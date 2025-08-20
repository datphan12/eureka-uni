import { IsNotEmpty, IsString } from 'class-validator';

export class GhiChuDto {
  @IsString()
  @IsNotEmpty()
  maNguoiDung: string;

  @IsString()
  @IsNotEmpty()
  maBaiGiang: string;

  @IsString()
  @IsNotEmpty()
  noiDung: string;
}
