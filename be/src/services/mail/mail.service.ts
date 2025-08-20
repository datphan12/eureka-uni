import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('MAIL_HOST'),
      port: configService.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: configService.get<string>('MAIL_USER'),
        pass: configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendMailToVerify(email: string, token: string): Promise<void> {
    const url = `${this.configService.get<string>('FRONT_END_URL')}/auth/verify-email/?token=${token}&email=${email}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Kích hoạt email',
      html: `<p>Click để kích hoạt email.</br> Mã sẽ hết hạn sau 5 phút.</p><a href="${url}">Kích hoạt tại đây</a>`,
    });
  }

  async sendEmailResetPassword(email: string, token: string): Promise<void> {
    const url = `${this.configService.get<string>('FRONT_END_URL')}/auth/reset-password/?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `<p>Click để đặt lại mật khẩu.</br> Mã sẽ hết hạn sau 15 phút.</p><a href="${url}">Đặt lại mật khẩu tại đây</a>`,
    });
  }
}
