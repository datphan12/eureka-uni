import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/modules/shared/dtos/base-pagination.dto';

export class FilterCourseDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  priceMin?: string;

  @IsString()
  @IsOptional()
  priceMax?: string;

  @IsString()
  @IsOptional()
  createdAtFrom?: string;

  @IsString()
  @IsOptional()
  createdAtTo?: string;

  @IsString()
  @IsOptional()
  deletedAt?: string;
}
