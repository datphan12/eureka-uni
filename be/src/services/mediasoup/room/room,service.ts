import { Injectable } from '@nestjs/common';
import { IRoom } from './interfaces/room.interface';
import { MediasoupService } from '../mediasoup.service';
import { mediaCodecs } from '../config/mediasoup.config';

@Injectable()
export class RoomService {
  private rooms: Map<String, IRoom> = new Map();

  constructor(private readonly mediasoupService: MediasoupService) {}

  public async getOrCreateRoom(roomId: string) {
    try {
      if (this.rooms.has(roomId)) {
        return this.rooms.get(roomId);
      }

      const worker = this.mediasoupService.getWorker();

      const router = await worker.createRouter({
        mediaCodecs,
      });

      const newRoom: IRoom = {
        id: roomId,
        router: { router },
        peers: new Map(),
      };

      this.rooms.set(roomId, newRoom);

      return newRoom;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  public deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
  }

  public addPeerToRoom(
    roomId: string,
    peer: {
      id: string;
      appData: {
        hoTen: string;
        hinhAnh: string;
      };
    },
  ) {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw Error('Room không tồn tại');
    }

    if (Array.from(room.peers.keys()).length >= 5) {
      throw Error('Room đã đạt giới hạn số lượng người tham gia.');
    }

    if (!room.peers.has(peer.id)) {
      room.peers.set(peer.id, {
        id: peer.id,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
        appData: peer.appData,
      });
    }
  }

  public deletePeerFromRoom(roomId: string, peerId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw Error('Room không tồn tại');
    }

    if (room.peers.has(peerId)) {
      room.peers.delete(peerId);
    }
  }
}
