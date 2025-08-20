import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PhanHoiDto {
  @IsOptional()
  @IsString()
  noiDung: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dinhKem?: string[];

  @IsString()
  @IsNotEmpty()
  maBaiDang: string;

  @IsString()
  @IsNotEmpty()
  maNguoiDung: string;
}
