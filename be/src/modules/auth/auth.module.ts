import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NguoiDungModule } from '../nguoidung/nguoidung.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../shared/strategies/jwt.strategy';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { GoogleStrategy } from '../shared/strategies/google.strategy';
import { FacebookStrategy } from '../shared/strategies/facebook.strategy';
import { MailModule } from '../../services/mail/mail.module';

@Module({
  imports: [NguoiDungModule, PassportModule, JwtModule, MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    GoogleStrategy,
    FacebookStrategy,
  ],
})
export class AuthModule {}
