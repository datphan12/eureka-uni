import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { VnPayModule } from 'src/services/vnpay/vnpay.module';

@Module({
  imports: [VnPayModule],
  controllers: [PaymentController],
})
export class PaymentModule {}
