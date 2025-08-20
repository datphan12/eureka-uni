import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BinhLuanDto {
  @IsString()
  @IsNotEmpty()
  maBaiGiang: string;

  @IsOptional()
  @IsString()
  noiDung?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dinhKem?: string[];
}
