import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { SubscriberGuard } from './guards/subscriber.guard';

@Module({
  controllers: [StripeController],
  providers: [
    StripeService,
    SubscriberGuard,
  ],
  exports: [StripeService, SubscriberGuard]
})
export class StripeModule {}
