import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  maNhom: string;

  @IsNotEmpty()
  @IsString()
  maNguoiDung: string;

  @IsString()
  noiDung: string;

  @IsObject()
  dinhKem: object;
}
