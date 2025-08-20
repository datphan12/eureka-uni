import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BasePaginationDto } from 'src/modules/shared/dtos/base-pagination.dto';

export class FilterUserDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  vaiTro?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  daKichHoat?: boolean;

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
