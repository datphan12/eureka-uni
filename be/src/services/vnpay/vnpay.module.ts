import { Module } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { GiaoDichModule } from 'src/modules/giaodich/giaodich.module';
import { KhoaHocModule } from 'src/modules/khoahoc/khoahoc.module';

@Module({
  imports: [GiaoDichModule, KhoaHocModule],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class VnPayModule {}
