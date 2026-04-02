// external imports
import { Logger, ValidationPipe } from '@nestjs/common'; // Logger add kora hoyeche
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import helmet from 'helmet';
import { join } from 'path';
// internal imports
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { CustomExceptionFilter } from './common/exception/custom-exception.filter';
import { PrismaExceptionFilter } from './common/exception/prisma-exception.filter';
import { TajulStorage } from './common/lib/Disk/TajulStorage';
import appConfig from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // SSL Logic - Safe Load
  let httpsOptions: { key: Buffer; cert: Buffer } | undefined = undefined;

  const keyPath = join(process.cwd(), 'secrets', 'server.key');
  const certPath = join(process.cwd(), 'secrets', 'server.crt');

  try {
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
      logger.log('HTTPS configuration loaded successfully.');
    } else {
      logger.warn(
        'SSL certificates not found in ./secrets. Starting in HTTP mode.',
      );
    }
  } catch (err) {
    logger.error('Failed to load SSL certificates:', err.message);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    httpsOptions, // auto undefined pathabe jodi load na hoy
  });

  // Middleware & Adapters
  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(
    helmet({
      contentSecurityPolicy: false, // Swagger-er jonno CSP false rakha bhalo jodi development hoy
    }),
  );

  // Static Assets Setup
  const publicPath = join(process.cwd(), 'public');
  const storagePath = join(process.cwd(), 'public', 'storage');

  app.useStaticAssets(publicPath, {
    index: false,
    prefix: '/public',
    setHeaders: (res, path) => {
      if (path.includes('ai-storage')) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      }
    },
  });

  app.useStaticAssets(storagePath, {
    index: false,
    prefix: '/storage',
    setHeaders: (res) => {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    },
  });

  // Global Configs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(
    new CustomExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  // Storage Setup (Custom Lib)
  const config = appConfig();
  TajulStorage.config({
    driver: 'local',
    connection: {
      rootUrl: config.storageUrl.rootUrl,
      publicUrl: config.storageUrl.rootUrlPublic,
      awsBucket: config.fileSystems.s3.bucket,
      awsAccessKeyId: config.fileSystems.s3.key,
      awsSecretAccessKey: config.fileSystems.s3.secret,
      awsDefaultRegion: config.fileSystems.s3.region,
      awsEndpoint: config.fileSystems.s3.endpoint,
      minio: true,
    },
  });

  // Swagger Setup
  const appName = process.env.APP_NAME || 'NestJS API';
  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${appName} api`)
    .setDescription(`${appName} api docs`)
    .setVersion('1.0')
    .addTag(`${appName}`)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');

  const serverUrl = await app.getUrl();
  logger.log(`🚀 Application is running on: ${serverUrl}`);
}

bootstrap();
