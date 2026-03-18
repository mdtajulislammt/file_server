// storage.config.ts
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const aiStorageOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Mimetype check: Image or Video
      const typeFolder = file.mimetype.startsWith('video') ? 'video' : 'images';
      
      // Dynamic Path: public/ai-storage/images/2026/03
      const uploadPath = join('public', 'ai-storage', typeFolder, year, month);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
};