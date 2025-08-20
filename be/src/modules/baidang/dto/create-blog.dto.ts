import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  tieuDe: string;

  @IsString()
  @IsNotEmpty()
  noiDungMarkdown: string;

  @IsString()
  @IsNotEmpty()
  noiDungHTML: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hinhAnh?: string[];

  @IsString()
  @IsNotEmpty()
  maNguoiDung: string;
}
