import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileController } from './file-server.controller';
import { FileService } from './file-server.service';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService],
})
export class FileServerModule {}
