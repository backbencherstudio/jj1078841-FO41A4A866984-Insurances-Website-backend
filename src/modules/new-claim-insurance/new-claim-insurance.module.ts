import { Module } from '@nestjs/common';
import { NewClaimInsuranceService } from './new-claim-insurance.service';
import { NewClaimInsuranceController } from './new-claim-insurance.controller';

@Module({
  controllers: [NewClaimInsuranceController],
  providers: [NewClaimInsuranceService],
})
export class NewClaimInsuranceModule {}
