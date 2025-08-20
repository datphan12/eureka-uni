import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { GoogleOAuthGuard } from '../shared/guards/google-oauth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Auth } from '../shared/decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  @Auth()
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('sign-up')
  async signUp(@Body() userData: SignUpDto) {
    return await this.authService.singUp(userData);
  }

  @Post('login')
  async login(
    @Body() userData: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(userData, res);
  }

  @Post('log-out')
  async logOut(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.googleLogin(req.user, res);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.facebookLogin(req.user, res);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Get('resend-verify-email')
  async resendVerifyEmail(@Query('email') email: string) {
    return await this.authService.reSendVerifyEmail(email);
  }

  @Get('send-email-reset-password')
  async sendEmailResetPassword(@Query('email') email: string) {
    return await this.authService.sendEmailResetPassword(email);
  }

  @Get('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Query('password') password: string,
  ) {
    return await this.authService.resetPassword(token, password);
  }

  // @Post('unlink-google')
  // async unlinkGoogleAccount(@Body() body: { email: string }) {
  //   return await this.authService.unlinkGoogleAccount(body.email);
  // }

  // @Post('unlink-facebook')
  // async unlinkFacebookAccount(@Body() body: { email: string }) {
  //   return await this.authService.unlinkFacebookAccount(body.email);
  // }
}
