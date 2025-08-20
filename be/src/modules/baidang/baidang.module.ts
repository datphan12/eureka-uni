import { Module } from '@nestjs/common';
import { BaiDangController } from './baidang.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhanHoiBaiDang } from './entities/phanhoi_baidang.entity';
import { BaiDang } from './entities/baidang.entity';
import { BaiDangService } from './baidang.service';
import { RedisModule } from 'src/services/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([BaiDang, PhanHoiBaiDang]), RedisModule],
  controllers: [BaiDangController],
  providers: [BaiDangService],
  exports: [BaiDangService],
})
export class BaiDangModule {}
