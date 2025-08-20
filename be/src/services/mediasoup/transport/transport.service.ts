import { Injectable } from '@nestjs/common';
import { RoomService } from '../room/room,service';
import { webRtcTransport_options } from '../config/mediasoup.config';

@Injectable()
export class TransportService {
  constructor(private readonly roomService: RoomService) {}

  public async createWebRtcTransport(
    roomId: string,
    peer: {
      id: string;
      appData: {
        hoTen: string;
        hinhAnh: string;
      };
    },
    direction: 'send' | 'recv',
  ) {
    const room = this.roomService.getRoom(roomId);

    if (!room) {
      console.log(`Room với id: ${roomId} không tồn tại, không tạo transport`);
      return;
    }

    const transport = await room.router.router.createWebRtcTransport({
      ...webRtcTransport_options,
      appData: {
        id: peer.id,
        clientDirection: direction,
      },
    });

    this.roomService.addPeerToRoom(roomId, peer);

    const peerCheck = room.peers.get(peer.id);

    if (!peerCheck) {
      console.log(`Peer với id: ${peer.id} không tồn tại, không tạo transport`);
      return;
    }

    peerCheck.transports.set(transport.id, { transport });

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }
}
