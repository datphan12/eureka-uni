import { Module } from '@nestjs/common';
import { BaiGiangController } from './baigiang.controller';
import { BaiGiangService } from './baigiang.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaiGiang } from './entities/baigiang.entity';
import { KhoaHocModule } from '../khoahoc/khoahoc.module';
import { GhiChu } from './entities/ghichu.entity';
import { TailieuBaiGiang } from './entities/tailieu-baigiang.entity';
import { BinhLuanBaiGiang } from './entities/binhluan-baigiang.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BaiGiang,
      GhiChu,
      TailieuBaiGiang,
      BinhLuanBaiGiang,
    ]),
    KhoaHocModule,
  ],
  providers: [BaiGiangService],
  controllers: [BaiGiangController],
  exports: [BaiGiangService],
})
export class BaiGiangModule {}
