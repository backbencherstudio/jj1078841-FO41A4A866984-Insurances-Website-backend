import { Module } from '@nestjs/common';
import { ClaimsHistoryService } from './claims-history.service';
import { ClaimsHistoryController } from './claims-history.controller';

@Module({
  controllers: [ClaimsHistoryController],
  providers: [ClaimsHistoryService],
})
export class ClaimsHistoryModule {}
