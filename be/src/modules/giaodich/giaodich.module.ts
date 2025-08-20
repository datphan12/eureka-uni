import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiaoDich } from './entities/giaodich.entity';
import { GiaoDichController } from './giaodich.controller';
import { GiaoDichService } from './giaodich.service';

@Module({
  imports: [TypeOrmModule.forFeature([GiaoDich])],
  controllers: [GiaoDichController],
  providers: [GiaoDichService],
  exports: [GiaoDichService],
})
export class GiaoDichModule {}
