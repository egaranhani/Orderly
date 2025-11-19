import { Module } from '@nestjs/common';
import { VertexAiService } from './vertex-ai.service';
import { IAiService } from '@domain/services/ai.service.interface';

@Module({
  providers: [
    {
      provide: 'IAiService',
      useClass: VertexAiService,
    },
  ],
  exports: ['IAiService'],
})
export class AiInfrastructureModule {}

