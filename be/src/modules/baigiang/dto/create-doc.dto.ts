import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocDto {
  @IsString()
  @IsNotEmpty()
  maBaiGiang: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}
