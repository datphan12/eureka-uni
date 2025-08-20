import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const vnpayConfig = {
  vnp_TmnCode: configService.get('VNPAY_TMN_CODE'),
  vnp_HashSecret: configService.get('VNPAY_HASH_SECRET'),
  vnp_Url: configService.get('VNPAY_URL'),
  vnp_ReturnUrl: configService.get('VNPAY_RETURN_URL'),
};
