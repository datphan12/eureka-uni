import { IsNotEmpty, IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  // peerId: string;
  peer: {
    id: string;
    appData: {
      hoTen: string;
      hinhAnh: string;
    };
  };
}
