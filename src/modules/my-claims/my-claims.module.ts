import { Module } from '@nestjs/common';
import { MyClaimsService } from './my-claims.service';
import { MyClaimsController } from './my-claims.controller';
import { StripeModule } from '../payment/stripe/stripe.module';

@Module({
  controllers: [MyClaimsController],
  providers: [MyClaimsService],
})
export class MyClaimsModule {}
