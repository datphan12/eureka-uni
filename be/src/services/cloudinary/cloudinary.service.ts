import { BadRequestException, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import cloudinary from './cloudinary.config';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder = 'eureka-uni',
  ): Promise<{ url: string; public_id: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(
                `Upload failed: ${error.message || 'Unknown error'}`,
              ),
            );
          }
          if (!result) {
            return reject(
              new BadRequestException(
                'Upload failed: No result returned from Cloudinary',
              ),
            );
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(
    publicId: string,
    resourceType = 'auto',
  ): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(
                `Delete failed: ${error.message || 'Unknown error'}`,
              ),
            );
          }
          resolve({ result: result.result });
        },
      );
    });
  }

  extractPublicId(url: string): string {
    try {
      const urlParts = url.split('/');
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');

      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL');
      }

      const relevantParts = urlParts.slice(uploadIndex + 2);
      const publicId = relevantParts.join('/');

      const extensionIndex = publicId.lastIndexOf('.');
      return extensionIndex !== -1
        ? publicId.substring(0, extensionIndex)
        : publicId;
    } catch (error) {
      throw new BadRequestException('Could not extract public_id from URL');
    }
  }
}
