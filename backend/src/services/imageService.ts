import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

class ImageService {
  private maxImageSize = 5 * 1024 * 1024;
  private allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

  private isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  private getImageExtension(url: string): string {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase().slice(1);

    if (this.allowedFormats.includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }

    return 'jpg';
  }

  async downloadImage(url: string, targetPath: string): Promise<boolean> {
    if (!this.isValidImageUrl(url)) {
      logger.warn('Invalid image URL', { url });
      return false;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BookNest/1.0',
        },
      });

      if (!response.ok) {
        logger.warn('Image download failed - HTTP error', {
          url,
          status: response.status,
          targetPath,
        });
        return false;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.startsWith('image/')) {
        logger.warn('Image download failed - invalid content type', {
          url,
          contentType,
        });
        return false;
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > this.maxImageSize) {
        logger.warn('Image download failed - too large', {
          url,
          size: contentLength,
        });
        return false;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.length > this.maxImageSize) {
        logger.warn('Image download failed - buffer too large', {
          url,
          bufferSize: buffer.length,
        });
        return false;
      }

      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, buffer);

      logger.info('Image downloaded successfully', { url, targetPath });
      return true;
    } catch (error) {
      logger.warn('Image download failed', {
        url,
        targetPath,
        error: (error as Error).message,
      });
      return false;
    }
  }
}

export const imageService = new ImageService();
