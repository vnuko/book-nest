import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { logger } from './logger.js';

// Define crop configuration type
export interface CropConfig {
  x: number;    // x coordinate of top-left corner of crop area (in pixels based on original image dimensions)
  y: number;    // y coordinate of top-left corner of crop area 
  width: number; // width of crop area (in pixels)
  height: number; // height of crop area (in pixels)
}

export class ImageProcessor {
  static async resizeToSquare(inputPath: string, outputPath: string, size: number = 400, cropConfig?: CropConfig): Promise<void> {
    try {
      let pipeline = sharp(inputPath);
      
      // If crop configuration is provided, crop first before resizing to square
      if (cropConfig) {
        pipeline = pipeline.extract({
          left: Math.round(cropConfig.x),
          top: Math.round(cropConfig.y),
          width: Math.round(cropConfig.width),
          height: Math.round(cropConfig.height)
        });
      }
      
      // Then resize to square while maintaining aspect ratio
      await pipeline
        .resize(size, size, {
          fit: 'cover', // Cover ensures the entire output size is filled
          position: 'center' // Center the image for cropping
        })
        .toFormat('jpeg', { quality: 85 }) // Standardize to JPEG for consistency 
        .toFile(outputPath);
      
      logger.info(`Image processed to square: ${inputPath} -> ${outputPath}${cropConfig ? ' with crop' : ''}`);
    } catch (error) {
      logger.error(
        'Failed to process image to square', 
        error as Error, 
        { inputPath, outputPath, cropConfig }
      );
      throw new Error(`Image processing failed: ${(error as Error).message}`);
    }
  }

  static async validateAndProcessForUpload(
    inputFile: Express.Multer.File, 
    targetPath: string, 
    size: number = 400,
    cropConfig?: CropConfig
  ): Promise<void> {
    // Extract directory and ensure it exists
    const dir = path.dirname(targetPath);
    await fs.ensureDir(dir);

    // Determine if target path should be JPEG (for consistency)
    const targetExt = path.extname(targetPath).toLowerCase();
    const needsProcessing = ['.jpg', '.jpeg', '.png', '.webp'].includes(targetExt);
    
    if (!needsProcessing) {
      throw new Error(`Unsupported image format: ${targetExt}`);
    }

    // Process the image to be square and of consistent size, with crop if specified
    await this.resizeToSquare(inputFile.path, targetPath, size, cropConfig);
  }
  
  // New method for processing author images where the frontend sends correctly-sized square images
  static async processAuthorImage(
    inputFile: Express.Multer.File, 
    targetPath: string,
    size: number = 400
  ): Promise<void> {
    // Extract directory and ensure it exists
    const dir = path.dirname(targetPath);
    await fs.ensureDir(dir);

    // Determine if target path should be JPEG (for consistency)
    const targetExt = path.extname(targetPath).toLowerCase();
    const needsProcessing = ['.jpg', '.jpeg', '.png', '.webp'].includes(targetExt);
    
    if (!needsProcessing) {
      throw new Error(`Unsupported image format: ${targetExt}`);
    }
    
    // Since the frontend sends properly-sized square images (with correct cropping), 
    // we just resize to the target size and convert format without repositioning
    try {
      await sharp(inputFile.path)
        .resize(size, size, {
          fit: 'fill', // Fill ensures that the whole canvas is covered at the specified dimensions
        })
        .toFormat('jpeg', { quality: 85 })
        .toFile(targetPath);
        
      logger.info(`Author image processed: ${inputFile.path} -> ${targetPath}`);
    } catch (error) {
      logger.error(
        'Failed to process author image', 
        error as Error, 
        { inputFile: inputFile.path, targetPath }
      );
      throw new Error(`Image processing failed: ${(error as Error).message}`);
    }
  }
}