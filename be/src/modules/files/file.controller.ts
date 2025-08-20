import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class FileController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder = 'eureka-uni',
  ) {
    try {
      const result = await this.cloudinaryService.uploadFile(file, folder);
      return {
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: result.url,
          public_id: result.public_id,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to upload file');
    }
  }

  @Delete('delete')
  async deleteFile(
    @Query('publicId') publicId: string,
    @Query('url') url: string,
    @Query('resourceType') resourceType = 'image',
  ) {
    try {
      const idToDelete =
        publicId || (url && this.cloudinaryService.extractPublicId(url));

      if (!idToDelete) {
        throw new BadRequestException('Either publicId or url is required');
      }

      const result = await this.cloudinaryService.deleteFile(
        idToDelete,
        resourceType,
      );

      return {
        success: true,
        message: 'File deleted successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to delete file');
    }
  }
}
