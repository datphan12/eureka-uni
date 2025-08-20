import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { NguoiDungModule } from './modules/nguoidung/nguoidung.module';
import { AuthModule } from './modules/auth/auth.module';
import { NhomHocTapModule } from './modules/nhomhoctap/nhomhoctap.module';
import { KhoaHocModule } from './modules/khoahoc/khoahoc.module';
import { BaiGiangModule } from './modules/baigiang/baigiang.module';
import { GiaoDichModule } from './modules/giaodich/giaodich.module';
import { BaiDangModule } from './modules/baidang/baidang.module';
import { FileModule } from './modules/files/file.module';
import { AIModule } from './modules/ai/ai.module';
import { MediasoupModule } from './services/mediasoup/mediasoup.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RedisModule } from './services/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    NguoiDungModule,
    NhomHocTapModule,
    KhoaHocModule,
    BaiGiangModule,
    GiaoDichModule,
    PaymentModule,
    BaiDangModule,
    AIModule,
    FileModule,
    MediasoupModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
