import { IsString, IsNotEmpty } from 'class-validator';

export class JoinRequestDto {
  @IsString()
  @IsNotEmpty()
  maNhom: string;
}
