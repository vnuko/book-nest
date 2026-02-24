import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

class ImageService {
  private maxImageSize = 5 * 1024 * 1024;
  private minImageSize = 500;
  private allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];
  private placeholderSignatures = [
    Buffer.from('GIF89a'),
    Buffer.from('GIF87a'),
  ];

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

  private isPlaceholderImage(buffer: Buffer): boolean {
    for (const sig of this.placeholderSignatures) {
      if (buffer.subarray(0, sig.length).equals(sig) && buffer.length < 100) {
        return true;
      }
    }
    return false;
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

      if (buffer.length < this.minImageSize) {
        logger.warn('Image download failed - image too small, likely placeholder', {
          url,
          bufferSize: buffer.length,
          minSize: this.minImageSize,
        });
        return false;
      }

      if (this.isPlaceholderImage(buffer)) {
        logger.warn('Image download failed - detected placeholder image', {
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
