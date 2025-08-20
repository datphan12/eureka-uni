import { IsString } from 'class-validator';

export class JoinGroupDto {
  @IsString()
  maNhom: string;

  @IsString()
  maNguoiDung: string;
}
