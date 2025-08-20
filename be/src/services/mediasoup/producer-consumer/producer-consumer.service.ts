import { Injectable } from '@nestjs/common';
import {
  IConsumerParams,
  IProducerParams,
} from './interfaces/producer-consumer.interface';
import { IProducer } from '../interface/mediasoup.interface';
import { RoomService } from '../room/room,service';

@Injectable()
export class ProducerConsumerService {
  constructor(private readonly roomService: RoomService) {}

  public async createProducer(params: IProducerParams) {
    const { roomId, peerId, kind, rtpParameters, transportId, type } = params;

    const room = this.roomService.getRoom(roomId);

    if (!room) {
      console.log(`Room với id: ${roomId} không tồn tại, không tạo producer`);
      return;
    }

    const peer = room.peers.get(peerId);
    if (!peer) {
      console.log(`Peer với id: ${peerId} không tồn tại, không tạo producer`);
      return;
    }

    const transport = peer.transports.get(transportId);
    if (!transport) {
      console.log(
        `Transport với id: ${transportId} không tồn tại, không tạo producer`,
      );
      return;
    }

    const existingProducers = Array.from(peer.producers.values());
    for (const existingProducer of existingProducers) {
      if (
        existingProducer.producer.kind === kind &&
        existingProducer.type === type
      ) {
        existingProducer.producer.close();
        peer.producers.delete(existingProducer.producer.id);
      }
    }

    const producer = await transport.transport.produce({
      kind,
      rtpParameters,
    });

    peer.producers.set(producer.id, { producer, type });

    producer.on('@close', () => {
      peer.producers.delete(producer.id);
    });

    return producer.id;
  }

  public async closeProducer(
    roomId: string,
    peerId: string,
    producerId: string,
  ) {
    const room = this.roomService.getRoom(roomId);
    if (!room) return false;

    const peer = room.peers.get(peerId);
    if (!peer) return false;

    const producer = peer.producers.get(producerId);
    if (!producer) return false;

    producer.producer.close();
    peer.producers.delete(producerId);

    return true;
  }

  public async createConsumer(params: IConsumerParams) {
    const { roomId, peerId, producerId, rtpCapabilities, transportId } = params;

    const room = this.roomService.getRoom(roomId);

    if (!room) {
      console.log(`Room với id: ${roomId} không tồn tại, không tạo consumer`);
      return;
    }

    const consumerPeer = room.peers.get(peerId);
    if (!consumerPeer) {
      console.log(`Peer với id: ${peerId} không tồn tại, không tạo consumer`);
      return;
    }

    let foundProducer: IProducer | null = null;

    for (const [currentPeerId, currentPeer] of room.peers.entries()) {
      const producer = currentPeer.producers.get(producerId);
      if (producer) {
        foundProducer = producer;
        break;
      }
    }

    if (!foundProducer) {
      console.log(
        `Producer với id: ${producerId} không tồn tại trong bất kỳ peer nào, không tạo consumer`,
      );
      return;
    }

    const transport = consumerPeer.transports.get(transportId);
    if (!transport) {
      console.log(
        `Transport với id: ${transportId} không tồn tại, không tạo consumer`,
      );
      return;
    }

    const consumer = await transport.transport.consume({
      producerId: foundProducer.producer.id,
      rtpCapabilities,
      paused: false,
    });

    consumerPeer.consumers.set(consumer.id, { consumer });

    consumer.on('@close', () => {
      consumerPeer.consumers.delete(consumer.id);
    });

    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: foundProducer.type,
    };
  }
}
