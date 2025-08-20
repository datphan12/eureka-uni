import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateSocialDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  hoTen: string;

  hinhAnh?: string;

  googleId?: string;

  facebookId?: string;

  daKichHoat?: boolean;

  matKhau?: string;
}
