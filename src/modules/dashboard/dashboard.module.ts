import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { StripeModule } from '../payment/stripe/stripe.module'; // Add this import

@Module({
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
