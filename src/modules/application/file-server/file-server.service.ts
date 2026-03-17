import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { TajulStorage } from 'src/common/lib/Disk/TajulStorage';
import appConfig from 'src/config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
  private readonly uploadDir = join(process.cwd(), 'public', 'uploads');
  constructor(private prisma: PrismaService) {}

  async uploadFileLocal(file: Express.Multer.File) {
    if (!file) {
      return {
        status: 400,
        message: 'No file uploaded',
      };
    }

    // Database-e save na kore sudu file details return korchi
    // File-ti ekhon 'public/uploads' folder-e ache
    return {
      status: 200,
      message: 'File uploaded successfully to local storage',
      data: {
        original_name: file.originalname,
        filename: file.filename,
        path: `${appConfig().storageUrl.uploads}${file.filename}`,
        size: file.size,
      },
    };
  }

  async getAllImages() {
    // 1. Check folder ache kina
    if (!fs.existsSync(this.uploadDir)) return [];

    // 2. Folder read kore file names niye asa
    const files = fs.readdirSync(this.uploadDir);

    // 3. Just simple array return
    const filesList = files.map((file) => ({
      name: file,
      url: TajulStorage.url(appConfig().storageUrl.uploads + file),
    }));
    return {
      status: 200,
      message: 'File list',
      data: filesList,
    };
  }

  async findOne(id: string) {
    const file = await this.prisma.fileServer.findFirst({
      where: { id, deleted_at: null },
      include: { user: true },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.fileServer.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
