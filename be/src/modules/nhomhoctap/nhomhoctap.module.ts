import { Module } from '@nestjs/common';
import { NhomHocTapService } from './nhomhoctap.service';
import { NhomsHocTapController } from './nhomhoctao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThanhVienNhom } from './entities/thanhviennhom.entity';
import { TinNhanNhom } from './entities/tinnhannhom.entity';
import { NhomHocTap } from './entities/nhomhoctap.entity';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([NhomHocTap, TinNhanNhom, ThanhVienNhom])],
  controllers: [NhomsHocTapController],
  providers: [NhomHocTapService, ChatGateway],
  exports: [ChatGateway, NhomHocTapService],
})
export class NhomHocTapModule {}
