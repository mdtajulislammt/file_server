import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileCleanupService implements OnModuleInit {
  private readonly logger = new Logger('AutoCleanup');

  // Directory path: public/ai-storage
  private readonly storageRoot = path.join(process.cwd(), 'public', 'ai-storage');

  onModuleInit() {
    this.logger.log(`🚀 Cleanup Service Initialized. Root: ${this.storageRoot}`);
  }

  // Protidin ratre 12 tay auto run hobe
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleStorageCleanup() {
    this.logger.log('🔍 Starting targeted 2-month cleanup scan...');
    
    const now = Date.now();
    const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
    
    // Counter for console report
    let deletedCount = 0;
    let skippedCount = 0;

    if (!fs.existsSync(this.storageRoot)) {
      this.logger.warn('⚠️ Storage root directory not found. Skipping cleanup.');
      return;
    }

    const processDirectory = (dirPath: string) => {
      const items = fs.readdirSync(dirPath);

      items.forEach((item) => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursive scan for nested folders (e.g., images/2026/03)
          processDirectory(fullPath);

          // Folder empty hole delete (Optional: storage clean rakhe)
          try {
            if (fs.readdirSync(fullPath).length === 0) {
              fs.rmdirSync(fullPath);
              this.logger.debug(`📁 Removed empty folder: ${item}`);
            }
          } catch (e) {}
        } else {
          // File Age Calculation
          const fileAgeMs = now - stat.mtimeMs;

          if (fileAgeMs >= TWO_MONTHS_MS) {
            try {
              fs.unlinkSync(fullPath);
              deletedCount++;
              this.logger.log(`✅ Deleted: ${item} (Age: ${Math.floor(fileAgeMs / (1000 * 60 * 60 * 24))} days)`);
            } catch (err) {
              this.logger.error(`❌ Failed to delete ${item}: ${err.message}`);
            }
          } else {
            skippedCount++;
            // New data gulo ekhane thakbe
          }
        }
      });
    };

    try {
      processDirectory(this.storageRoot);
      
      // Final Summary Console-e dekhabe
      this.logger.log('--------------------------------------------------');
      this.logger.log(`📊 Cleanup Summary:`);
      this.logger.log(`🗑️  Files Deleted: ${deletedCount}`);
      this.logger.log(`📂 Files Kept (New): ${skippedCount}`);
      this.logger.log('✅ Targeted cleanup finished.');
      this.logger.log('--------------------------------------------------');
    } catch (error) {
      this.logger.error('Cleanup execution error: ' + error.message);
    }
  }
}