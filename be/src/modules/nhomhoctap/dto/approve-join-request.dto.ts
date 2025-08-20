import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ApproveJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  maNhom: string;

  @IsString()
  @IsNotEmpty()
  maNguoiDung: string;

  @IsBoolean()
  approve: boolean;
}
