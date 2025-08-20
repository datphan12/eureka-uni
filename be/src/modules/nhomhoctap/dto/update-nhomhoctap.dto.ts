import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeGroup } from 'src/common/constants/type-group.enum';
import { ThanhVienNhom } from '../entities/thanhviennhom.entity';

export class UpdateNhomHocTapDto {
  @IsString()
  tenNhom: string;

  @IsOptional()
  @IsString()
  maMoi?: string;

  @IsOptional()
  // @IsString()
  gioiHanThanhVien?: string;

  @IsOptional()
  @IsEnum(TypeGroup)
  loaiNhom?: TypeGroup;

  @IsString()
  maNguoiDung: string;
}
