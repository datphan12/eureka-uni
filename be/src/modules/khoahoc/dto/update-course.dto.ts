import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreateBaiGiangDto } from 'src/modules/baigiang/dto/create-baigiang.dto';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  tenKhoaHoc?: string;

  @IsString()
  @IsOptional()
  moTa?: string;

  @IsString()
  @IsOptional()
  giaBan?: string;

  @IsString()
  @IsOptional()
  hinhAnh?: string;

  // @IsOptional()
  // @IsArray()
  // baiGiangs?: CreateBaiGiangDto[];

  @IsString()
  @IsOptional()
  maNguoiTao?: string;
}
