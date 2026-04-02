import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/modules/application/file-server/file-server.service';
import { aiStorageOptions } from 'src/modules/application/file-server/storage.config';
import { UploadGuard } from 'src/modules/application/file-server/upload.guard';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(UploadGuard)
  @UseInterceptors(FileInterceptor('file', aiStorageOptions))
  async uploadAiFile(@UploadedFile() file: Express.Multer.File) {
    return await this.fileService.processAiUpload(file);
  }

  @Get('all')
  @UseGuards(UploadGuard)
  async getImages() {
    return this.fileService.getAllImages();
  }

  @Get(':filename')
  @UseGuards(UploadGuard)
  async getFile(@Param('filename') filename: string) {
    return this.fileService.getFile(filename);
  }
}
