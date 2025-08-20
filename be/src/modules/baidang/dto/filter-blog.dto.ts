import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/modules/shared/dtos/base-pagination.dto';

export class FilterBlogDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  createdAtFrom?: string;

  @IsOptional()
  @IsString()
  createdAtTo?: string;
}
