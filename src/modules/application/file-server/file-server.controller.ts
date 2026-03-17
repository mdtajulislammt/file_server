import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileService } from 'src/modules/application/file-server/file-server.service';
import * as fs from 'fs';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          const today = new Date().toISOString().split('T')[0]; // 2026-03-17
          const uploadPath = './public/uploads';

          // folder er file list nao
          const files = fs.readdirSync(uploadPath);

          // ajker date diye file filter
          const todayFiles = files.filter((f) => f.startsWith(today));

          const nextNumber = todayFiles.length + 1;

          const fileName = `${today}-${nextNumber}${extname(file.originalname)}`;

          cb(null, fileName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.uploadFileLocal(file);
  }

  @Get('all')
  async getImages() {
    return this.fileService.getAllImages();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.fileService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.fileService.softDelete(id);
  }
}
