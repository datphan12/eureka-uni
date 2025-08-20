import { Module } from '@nestjs/common';
import { NguoiDungController } from './nguoidung.controller';
import { NguoiDungService } from './nguoidung.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NguoiDung } from './entities/nguoidung.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NguoiDung])],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
  exports: [NguoiDungService],
})
export class NguoiDungModule {}
