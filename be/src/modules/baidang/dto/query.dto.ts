import { IsNumberString, IsOptional } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
