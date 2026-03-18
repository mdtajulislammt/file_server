import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { TajulStorage } from 'src/common/lib/Disk/TajulStorage';
import appConfig from 'src/config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
  private readonly uploadDir = join(process.cwd(), 'public', 'uploads');
  constructor(private prisma: PrismaService) {}


async processAiUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Path formatting for URL (Backslash to Forward slash)
    const formattedPath = file.path.replace(/\\/g, '/');

    return {
      status: 200,
      message: 'File uploaded successfully to AI storage',
      data: {
        original_name: file.originalname,
        filename: file.filename,
        path: formattedPath,
        size: file.size,
        mimetype: file.mimetype,
        uploaded_at: new Date(),
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
