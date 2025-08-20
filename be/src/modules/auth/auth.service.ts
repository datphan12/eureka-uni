import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NguoiDungService } from '../nguoidung/nguoidung.service';
import { NguoiDung } from '../nguoidung/entities/nguoidung.entity';
import { SignUpDto } from './dto/signup.dto';
import { CreateUserDto } from '../nguoidung/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { cookieConfig } from './cookie.config';
import { comparePassword, hashPassword } from '../../common/utils';
import { MailService } from 'src/services/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly nguoiDungService: NguoiDungService,
    private readonly mailService: MailService,
  ) {}

  // SERVICE: ĐĂNG KÝ
  async singUp(userData: SignUpDto) {
    if (!userData.email || !userData.matKhau || !userData.hoTen) {
      throw new BadRequestException('Thông tin không được để trống');
    }

    if (await this.nguoiDungService.getUserByUsername(userData.hoTen)) {
      throw new ConflictException('Tên người dùng đã được đăng ký');
    }

    const checkUser = await this.nguoiDungService.getUserByEmail(
      userData.email,
    );

    if (checkUser) {
      throw new ConflictException('Email đã được đăng ký');
    }

    const newUser: CreateUserDto = {
      email: userData.email,
      matKhau: userData.matKhau,
      hoTen: userData.hoTen,
      // daKichHoat: false,
      daKichHoat: true,
    };
    const createdUser = await this.nguoiDungService.createUser(newUser);

    // await this.sendVerifyEmail(createdUser);

    return {
      success: true,
    };
  }

  // SERVICE: ĐĂNG NHẬP
  async login(userData: LoginDto, res: Response) {
    const user = await this.nguoiDungService.getUserByEmail(userData.email);
    if (!user) {
      throw new ConflictException('Email hoặc mật khẩu không chính xác');
    }

    if (!(await comparePassword(userData.matKhau, user.matKhau))) {
      throw new ConflictException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.daKichHoat) {
      return {
        success: false,
        daKichHoat: user.daKichHoat,
      };
    }

    if (user.deletedAt) {
      return {
        success: false,
        deletedAt: user.deletedAt,
      };
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    res.cookie('refreshToken', refreshToken, cookieConfig);

    return {
      success: true,
      accessToken,
      user: {
        email: user.email,
        vaiTro: user.vaiTro,
        hoTen: user.hoTen,
        daKichHoat: user.daKichHoat,
      },
    };
  }

  // SERVICE: đăng nhập/đăng ký bằng google
  async googleLogin(googleUser: any, res: Response) {
    let user = await this.nguoiDungService.getUserByGoogleId(
      googleUser.googleId,
    );

    if (!user) {
      user = await this.nguoiDungService.getUserByEmail(googleUser.email);
      if (user) {
        user.googleId = googleUser.googleId;
        await this.nguoiDungService.update(user.id, user);
      } else {
        user = await this.nguoiDungService.createUser({
          email: googleUser.email,
          hoTen: googleUser.hoTen,
          hinhAnh: googleUser.hinhAnh,
          googleId: googleUser.googleId,
          daKichHoat: true,
        });
      }
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    res.cookie('refreshToken', refreshToken, cookieConfig);

    res.redirect(
      `${process.env.FRONT_END_URL}/auth/google/callback?accessToken=${accessToken}&email=${user.email}&vaiTro=${user.vaiTro}&hoTen=${user.hoTen}`,
    );
  }

  // SERVICE: đăng nhập/đăng ký bằng facebook
  async facebookLogin(facebookUser: any, res: Response) {
    let user = await this.nguoiDungService.getUserByFacebookId(
      facebookUser.facebookId,
    );

    if (!user) {
      if (facebookUser.email) {
        user = await this.nguoiDungService.getUserByEmail(facebookUser.email);
        if (user) {
          user.facebookId = facebookUser.facebookId;
          await this.nguoiDungService.update(user.id, user);
        }
      }

      if (!user) {
        user = await this.nguoiDungService.createUser({
          email: facebookUser.email,
          hoTen: facebookUser.hoTen,
          hinhAnh: facebookUser.hinhAnh,
          facebookId: facebookUser.facebookId,
          daKichHoat: true,
        });
      }
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    res.cookie('refreshToken', refreshToken, cookieConfig);

    res.redirect(
      `${process.env.FRONT_END_URL}/auth/facebook/callback?accessToken=${accessToken}&email=${user.email}&vaiTro=${user.vaiTro}&hoTen=${user.hoTen}`,
    );
  }

  //SERVICE: ĐĂNG XUẤT
  async logout(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Đã đăng xuất thành công' };
  }

  // SERVICE: KÍCH HOẠT TÀI KHOẢN
  async verifyEmail(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      const user = await this.nguoiDungService.getUserByEmail(payload.email);

      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      if (user.daKichHoat) {
        return {
          success: true,
          message: 'Tài khoản đã được kích hoạt. Vui lòng đăng nhập lại!',
        };
      }

      if (user.maKichHoat !== token) {
        throw new BadRequestException('Mã kích hoạt không hợp lệ');
      }

      await this.nguoiDungService.update(user.id, {
        daKichHoat: true,
        maKichHoat: null,
      });

      return {
        success: true,
        message: 'Tài khoản đã được kích hoạt. Vui lòng đăng nhập lại!',
      };
    } catch (err) {
      return {
        success: false,
        message: 'Mã kích hoạt không hợp lệ!',
      };
    }
  }

  async generateTokens(
    user: NguoiDung,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, vaiTro: user.vaiTro };

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_EXPIRATION,
        secret: process.env.JWT_SECRET_KEY,
      }),
      await this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_EXPIRATION_REFRESH,
        secret: process.env.JWT_SECRET_KEY_REFRESH,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async sendVerifyEmail(createdUser: NguoiDung) {
    const payload = {
      sub: createdUser.id,
      email: createdUser.email,
      daKichHoat: createdUser.daKichHoat,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
      secret: process.env.JWT_SECRET_KEY,
    });

    await this.nguoiDungService.update(createdUser.id, {
      maKichHoat: token,
    });

    await this.mailService.sendMailToVerify(createdUser.email, token);
  }

  //SERVICE GỬI LẠI MÃ KÍCH HOẠT
  async reSendVerifyEmail(email: string) {
    try {
      const user = await this.nguoiDungService.getUserByEmail(email);
      if (user) {
        await this.sendVerifyEmail(user);
        return {
          success: true,
          message: 'Mã kích hoạt đã được gửi. Vui lòng kiểm tra email.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi gửi lại mã kích hoạt',
      };
    }
  }

  //SERVICE GỬI LẠI MÃ ĐẶT LẠI MẬT KHẨU
  async sendEmailResetPassword(email: string) {
    try {
      const payload = {
        email: email,
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET_KEY,
      });

      const user = await this.nguoiDungService.getUserByEmail(email);

      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      await this.nguoiDungService.update(user.id, {
        maDatLaiMatKhau: token,
      });

      await this.mailService.sendEmailResetPassword(email, token);

      return {
        success: true,
        message: 'Mã đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi gửi lại mã đặt lại mật khẩu',
      };
    }
  }

  // SERVICE: ĐẶT LẠI MẬT KHẨU
  async resetPassword(token: string, password: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      const user = await this.nguoiDungService.getUserByEmail(payload.email);

      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      if (user.maDatLaiMatKhau !== token) {
        throw new BadRequestException('Mã đặt lại mật khẩu không hợp lệ');
      }

      if (user.matKhau) {
        if (await comparePassword(password, user.matKhau)) {
          throw new BadRequestException('Mật khẩu hiện tại đã được sử dụng');
        }
      }

      await this.nguoiDungService.update(user.id, {
        matKhau: await hashPassword(password),
        maDatLaiMatKhau: null,
      });

      return {
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công!',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //social link, unlink

  // async unlinkGoogleAccount(userEmail: string) {
  //   try {
  //     const user = await this.nguoiDungService.getUserByEmail(userEmail);

  //     if (!user?.googleId) {
  //       throw new BadRequestException(
  //         'Tài khoản chưa được liên kết với Google',
  //       );
  //     }

  //     await this.nguoiDungService.update(user.id, {
  //       googleId: null,
  //     });

  //     return {
  //       success: true,
  //       message: 'Hủy liên kết Google thành công',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message || 'Lỗi khi hủy liên kết Google',
  //     };
  //   }
  // }

  // async unlinkFacebookAccount(userEmail: string) {
  //   try {
  //     const user = await this.nguoiDungService.getUserByEmail(userEmail);

  //     if (!user) {
  //       throw new BadRequestException('Người dùng không tồn tại');
  //     }

  //     if (!user.facebookId) {
  //       throw new BadRequestException(
  //         'Tài khoản chưa được liên kết với Facebook',
  //       );
  //     }

  //     await this.nguoiDungService.update(user.id, {
  //       facebookId: null,
  //     });

  //     return {
  //       success: true,
  //       message: 'Hủy liên kết Facebook thành công',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message || 'Lỗi khi hủy liên kết Facebook',
  //     };
  //   }
  // }

  // SERVICE: REFRESH TOKEN
  async refreshToken(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException('Refresh token không hợp lệ');
      }

      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET_KEY_REFRESH,
      });

      const user = await this.nguoiDungService.getUserByEmail(payload.email);

      if (!user) {
        throw new BadRequestException('Người dùng không tồn tại');
      }

      const accessToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, vaiTro: user.vaiTro },
        {
          expiresIn: process.env.JWT_EXPIRATION,
          secret: process.env.JWT_SECRET_KEY,
        },
      );

      return {
        accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
