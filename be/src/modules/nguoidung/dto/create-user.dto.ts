import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { VaiTro } from '../../../common/constants/role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  matKhau: string;

  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  hoTen: string;

  @IsOptional()
  @IsString({ message: 'Tiểu sử phải là chuỗi ký tự' })
  tieuSu?: string;

  @IsOptional()
  @IsString({ message: 'Hình ảnh phải là chuỗi ký tự' })
  hinhAnh?: string;

  @IsEnum(VaiTro, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  vaiTro?: VaiTro = VaiTro.HOCVIEN;

  @IsOptional()
  daKichHoat?: boolean = false;
}
