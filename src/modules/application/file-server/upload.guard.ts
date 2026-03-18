// common/guards/upload.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UploadGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Header theke password nibe
    const password = request.headers['secret'];

    const SECRET_PASSWORD = '7#kP$mt505$2@v*L9';

    if (!password || password !== SECRET_PASSWORD) {
      throw new UnauthorizedException('Invalid or missing upload password');
    }

    return true;
  }
}
