import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreateBaiGiangDto } from 'src/modules/baigiang/dto/create-baigiang.dto';

export class CreateKhoaHocDto {
  @IsString()
  @IsNotEmpty()
  tenKhoaHoc: string;

  @IsString()
  @IsOptional()
  moTa?: string;

  @IsString()
  @IsOptional()
  giaBan?: string;

  @IsString()
  hinhAnh: string;

  @IsOptional()
  // @IsArray()
  baiGiangs?: CreateBaiGiangDto[];

  @IsString()
  @IsNotEmpty()
  maNguoiTao: string;
}
