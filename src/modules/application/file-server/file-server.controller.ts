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
import { extname, join } from 'path';
import { FileService } from 'src/modules/application/file-server/file-server.service';
import * as fs from 'fs';
import { aiStorageOptions } from 'src/modules/application/file-server/storage.config';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', aiStorageOptions))
  async uploadAiFile(@UploadedFile() file: Express.Multer.File) {
    return await this.fileService.processAiUpload(file);
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
