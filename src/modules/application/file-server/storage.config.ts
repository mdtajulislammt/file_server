// storage.config.ts
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const aiStorageOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');

      const typeFolder = file.mimetype.startsWith('video') ? 'video' : 'images';

      // FIX: Absolute path use kora hoyeche process.cwd() diye
      const uploadPath = join(
        process.cwd(),
        'public',
        'ai-storage',
        typeFolder,
        year,
        month,
      );

      // Folder na thakle create korbe
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
};
