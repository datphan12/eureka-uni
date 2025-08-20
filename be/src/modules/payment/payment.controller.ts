import { Body, Controller, Post } from '@nestjs/common';
import { VnpayService } from 'src/services/vnpay/vnpay.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Post('create-payment-url')
  async create(
    @Body() body: { maNguoiDung: string; maKhoaHoc: string; amount: number },
  ) {
    return this.vnpayService.createPaymentUrl(
      body.maNguoiDung,
      body.maKhoaHoc,
      body.amount,
    );
  }

  @Post('return')
  async paymentReturn(@Body() query: any) {
    return this.vnpayService.handleReturn(query);
  }
}
