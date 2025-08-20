import { Module } from '@nestjs/common';
import { CohereModule } from 'src/services/cohere/cohere.module';
import { AIController } from './ai.controller';

@Module({
  imports: [CohereModule],
  controllers: [AIController],
})
export class AIModule {}
