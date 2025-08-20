import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { VaiTro } from '../../../common/constants/role.enum';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email: string;

  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @IsOptional()
  matKhau?: string;

  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsOptional()
  hoTen: string;

  @IsOptional()
  @IsString({ message: 'Tiểu sử phải là chuỗi ký tự' })
  tieuSu?: string;

  @IsOptional()
  @IsString({ message: 'Hình ảnh phải là chuỗi ký tự' })
  hinhAnh?: string;

  @IsEnum(VaiTro, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  vaiTro?: VaiTro;

  @IsOptional()
  daKichHoat?: boolean;

  @IsOptional()
  @IsString()
  maNguoiDung?: string;
}
