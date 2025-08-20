import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/modules/shared/dtos/base-pagination.dto';

export class FilterTransactionDto extends BasePaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  amountMin?: string;

  @IsString()
  @IsOptional()
  amountMax?: string;

  @IsString()
  @IsOptional()
  transactionDateFrom?: string;

  @IsString()
  @IsOptional()
  transactionDateTo?: string;
}
