import { Module } from '@nestjs/common';
import { NewClaimInsuranceService } from './new-claim-insurance.service';
import { NewClaimInsuranceController } from './new-claim-insurance.controller';
import { StripeModule } from '../payment/stripe/stripe.module';

@Module({
  imports: [StripeModule], // Add StripeModule as an import
  controllers: [NewClaimInsuranceController],
  providers: [NewClaimInsuranceService],
})
export class NewClaimInsuranceModule {}
