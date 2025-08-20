import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeGroup } from 'src/common/constants/type-group.enum';
import { BasePaginationDto } from 'src/modules/shared/dtos/base-pagination.dto';

export class FilterGroupDto extends BasePaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TypeGroup)
  loaiNhom?: TypeGroup;

  @IsOptional()
  @IsString()
  createdAtFrom?: string;

  @IsOptional()
  @IsString()
  createdAtTo?: string;

  @IsOptional()
  @IsString()
  deletedAt: string;
}
