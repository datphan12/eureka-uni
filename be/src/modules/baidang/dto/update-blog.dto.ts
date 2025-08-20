import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { BlogStatusEnum } from '../../../common/constants/blog-status.enum';

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tieuDe?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  noiDungMarkdown?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  noiDungHTML?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hinhAnh?: string[];

  @IsOptional()
  @IsEnum(BlogStatusEnum)
  trangThai?: BlogStatusEnum;

  @IsString()
  @IsNotEmpty()
  maNguoiDung: string;
}
