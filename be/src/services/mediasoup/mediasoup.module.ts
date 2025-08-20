import { Module } from '@nestjs/common';
import { MediasoupGateway } from './mediasoup.gateway';
import { RoomModule } from './room/room.module';
import { TransportModule } from './transport/transport.module';
import { ProducerConsumerModule } from './producer-consumer/producer-consumer.module';
import { NhomHocTapModule } from 'src/modules/nhomhoctap/nhomhoctap.module';
import { MediasoupService } from './mediasoup.service';

@Module({
  imports: [
    RoomModule,
    TransportModule,
    ProducerConsumerModule,
    NhomHocTapModule,
  ],
  providers: [MediasoupService, MediasoupGateway],
  exports: [MediasoupService],
})
export class MediasoupModule {}
