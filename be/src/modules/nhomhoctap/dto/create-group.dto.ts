import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TypeGroup } from 'src/common/constants/type-group.enum';
import { ThanhVienNhom } from '../entities/thanhviennhom.entity';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  tenNhom: string;

  @IsOptional()
  @IsString()
  maMoi?: string;

  @IsOptional()
  @IsString()
  gioiHanThanhVien?: string;

  @IsOptional()
  @IsEnum(TypeGroup)
  loaiNhom?: TypeGroup;

  @IsOptional()
  thanhVienNhom?: ThanhVienNhom[];

  @IsString()
  maNguoiDung: string;
}
