import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBaiGiangDto {
  @IsString()
  @IsNotEmpty()
  tieuDe: string;

  @IsOptional()
  @IsString()
  moTa?: string;

  @IsOptional()
  @IsString()
  videoUrl: string;

  @IsInt()
  @IsNotEmpty()
  thuTu: number;

  @IsNotEmpty()
  @IsString()
  maBaiGiang: string;
}
