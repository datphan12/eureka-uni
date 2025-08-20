import { Module } from '@nestjs/common';
import { CohereService } from './cohere.service';
import { BaiDangModule } from 'src/modules/baidang/baidang.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [BaiDangModule, RedisModule],
  controllers: [],
  providers: [CohereService],
  exports: [CohereService],
})
export class CohereModule {}
