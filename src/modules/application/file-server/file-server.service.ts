import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TajulStorage } from 'src/common/lib/Disk/TajulStorage';
import appConfig from 'src/config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileService {
  private readonly storageDir = path.join(
    process.cwd(),
    'public',
    'ai-storage',
  );
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
    if (!fs.existsSync(this.storageDir)) {
      return { status: 200, message: 'Storage not found', data: [] };
    }

    // Recursive function to scan sub-directories
    const getFilesRecursively = (dirPath: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dirPath);

      list.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory()) {
          results = results.concat(getFilesRecursively(fullPath));
        } else {
          results.push(fullPath);
        }
      });
      return results;
    };

    try {
      const allFilePaths = getFilesRecursively(this.storageDir);

      const mediaList = allFilePaths.map((filePath) => {
        // Path calculation (Windows/Linux compatibility)
        const relativePath = path
          .relative(this.storageDir, filePath)
          .replace(/\\/g, '/');
        const extension = path.extname(filePath).toLowerCase();

        // Media type identification
        const isVideo = ['.mp4', '.mkv', '.mov', '.webm'].includes(extension);
        const type = isVideo ? 'video' : 'image';

        return {
          name: path.basename(filePath),
          type: type,
          // appConfig usage based on your existing structure
          url: TajulStorage.url(
            `${appConfig().storageUrl.aiStorage}${relativePath}`,
          ),
          created_at: fs.statSync(filePath).birthtime,
        };
      });

      // Sort by latest created date
      mediaList.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

      return {
        status: 200,
        message: 'Media files retrieved successfully',
        data: mediaList,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Internal Server Error',
        error: error.message,
      };
    }
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
