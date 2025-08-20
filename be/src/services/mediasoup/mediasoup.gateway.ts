import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join-room.dto';
import { ConnectTransportDto } from './dto/connect-transport.dto';
import { RoomService } from './room/room,service';
import { TransportService } from './transport/transport.service';
import { ProducerConsumerService } from './producer-consumer/producer-consumer.service';
import { ChatGateway } from 'src/modules/nhomhoctap/chat.gateway';
import { NhomHocTapService } from 'src/modules/nhomhoctap/nhomhoctap.service';

@WebSocketGateway({
  namespace: '/mediasoup',
  cors: { origin: process.env.FRONT_END_URL, credentials: true },
})
export class MediasoupGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly transportService: TransportService,
    private readonly producerConsumerService: ProducerConsumerService,
    private readonly nhomHocTapService: NhomHocTapService,
    private readonly chatGateway: ChatGateway,
  ) {}

  afterInit() {
    console.log(`Server initialized`);
  }

  handleConnection(client: Socket) {
    console.log(`Client media connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client media disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, peer } = dto;

    try {
      const checkUserInGroup = await this.nhomHocTapService.checkUserInGroup(
        roomId,
        peer.id,
      );

      if (!checkUserInGroup) {
        throw new Error('Bạn không có quyền tham gia phòng họp này');
      }

      const newRoom = await this.roomService.getOrCreateRoom(roomId);
      if (!newRoom) {
        throw new Error(`Room với id: ${roomId} không tồn tại`);
      }

      const sendTransportOptions =
        await this.transportService.createWebRtcTransport(roomId, peer, 'send');

      const recvTransportOptions =
        await this.transportService.createWebRtcTransport(roomId, peer, 'recv');

      client.join(roomId);

      const room = this.roomService.getRoom(roomId);
      if (!room) {
        throw new Error(`Room với id: ${roomId} không tồn tại`);
      }

      const peers = Array.from(room.peers.values());

      const existingProducers: {
        producerId: string;
        peerId: string;
        kind: string;
      }[] = [];
      for (const [otherPeerId, peer] of room.peers) {
        if (otherPeerId !== dto.peer.id) {
          for (const producer of peer.producers.values()) {
            existingProducers.push({
              producerId: producer.producer.id,
              peerId: otherPeerId,
              kind: producer.producer.kind,
            });
          }
        }
      }

      client.to(roomId).emit('new-peer', { peer });
      this.chatGateway.notifyRoomMessage(roomId, {
        roomId,
        type: 'created_room',
      });

      return {
        sendTransportOptions,
        recvTransportOptions,
        rtpCapabilities: newRoom.router.router.rtpCapabilities,
        peers: peers.map((peer) => ({
          id: peer.id,
          appData: peer.appData,
        })),
        existingProducers,
      };
    } catch (error) {
      client.emit('join-room-error', {
        error: error.message,
        code: 'PERMISSION_DENIED',
      });
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { peerId },
  ) {
    const rooms = Array.from(client.rooms);

    for (const roomId of rooms) {
      if (roomId !== peerId) {
        const room = this.roomService.getRoom(roomId);
        if (room) {
          const peer = room.peers.get(peerId);
          if (peer) {
            for (const producer of peer.producers.values()) {
              producer.producer.close();
            }
            for (const consumer of peer.consumers.values()) {
              consumer.consumer.close();
            }
            for (const transport of peer.transports.values()) {
              transport.transport.close();
            }
            room.peers.delete(peerId);
          }
          client.leave(roomId);
          client.to(roomId).emit('peer-left', { peerId: peerId });
          if (room.peers.size === 0) {
            this.roomService.deleteRoom(roomId);
            this.chatGateway.notifyRoomMessage(roomId, {
              roomId,
              type: 'closed_room',
            });
          }
        }
      }
    }
    return { left: true };
  }

  @SubscribeMessage('connect-transport')
  async handleConnectTransport(
    @MessageBody() data: ConnectTransportDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, peerId, transportId, dtlsParameters } = data;

    const room = this.roomService.getRoom(roomId);
    if (!room) {
      throw new Error(`Room với id: ${roomId} không tồn tại`);
    }

    const peer = room.peers.get(peerId);
    if (!peer) {
      return { error: 'Peer not found' };
    }

    const transport = peer.transports.get(transportId);
    if (!transport) {
      return { error: 'Transport not found' };
    }

    await transport.transport.connect({ dtlsParameters });

    return { connected: true };
  }

  @SubscribeMessage('produce')
  async handleProduce(@MessageBody() data, @ConnectedSocket() client: Socket) {
    const { roomId, peerId, kind, transportId, rtpParameters, appData } = data;

    try {
      const producerId = await this.producerConsumerService.createProducer({
        roomId,
        peerId,
        transportId,
        kind,
        rtpParameters,
        type: appData?.type,
      });

      client.to(roomId).emit('new-producer', { producerId, peerId, kind });

      return { producerId };
    } catch (error) {
      console.error(error);
      client.emit('produce-error', { error: error.message });
    }
  }

  @SubscribeMessage('consume')
  async handleConsume(@MessageBody() data, @ConnectedSocket() client: Socket) {
    const { roomId, peerId, producerId, rtpCapabilities, transportId } = data;
    try {
      const consumerData = await this.producerConsumerService.createConsumer({
        roomId,
        peerId,
        transportId,
        producerId,
        rtpCapabilities,
      });

      return {
        consumerData,
      };
    } catch (error) {
      console.error(error);
      client.emit('consume-error', { error: error.message });
    }
  }

  @SubscribeMessage('close-producer')
  async handleCloseProducer(
    @MessageBody() data: { roomId: string; peerId: string; producerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, peerId, producerId } = data;

    const room = this.roomService.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    const peer = room.peers.get(peerId);
    if (!peer) return { error: 'Peer not found' };

    const producer = peer.producers.get(producerId);
    if (producer) {
      const producerKind = producer.producer.kind;
      const producerType = producer.type;
      producer.producer.close();
      peer.producers.delete(producerId);

      client.to(roomId).emit('producer-closed', {
        producerId,
        peerId,
        kind: producerKind,
        type: producerType,
      });
    }

    return { closed: true };
  }
}
