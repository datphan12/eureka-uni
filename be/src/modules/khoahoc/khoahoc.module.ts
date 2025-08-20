import { Module } from '@nestjs/common';
import { KhoaHocController } from './khoahoc.controller';
import { KhoaHocService } from './khoahoc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhoaHoc } from './entities/khoahoc.entity';
import { NguoiDungKhoaHoc } from './entities/nguoidung_khoahoc.entity';
import { NguoiDungModule } from '../nguoidung/nguoidung.module';
import { RedisModule } from 'src/services/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KhoaHoc, NguoiDungKhoaHoc]),
    NguoiDungModule,
    RedisModule,
  ],
  providers: [KhoaHocService],
  controllers: [KhoaHocController],
  exports: [KhoaHocService],
})
export class KhoaHocModule {}
