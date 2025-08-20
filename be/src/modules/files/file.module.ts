import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/services/cloudinary/cloudinary.module';
import { FileController } from './file.controller';

@Module({
  imports: [CloudinaryModule],
  providers: [],
  controllers: [FileController],
})
export class FileModule {}
