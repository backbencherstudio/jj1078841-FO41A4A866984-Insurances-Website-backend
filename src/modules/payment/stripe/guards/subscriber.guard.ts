import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from '../stripe.service';

@Injectable()
export class SubscriberGuard implements CanActivate {
  constructor(private stripeService: StripeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const { isSubscribed } = await this.stripeService.checkUserSubscription(userId);

    if (!isSubscribed) {
      throw new HttpException('Subscription required to access this resource', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}