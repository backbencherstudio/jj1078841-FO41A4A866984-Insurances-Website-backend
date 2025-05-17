import { Controller, Get, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { MyClaimsService } from './my-claims.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriberGuard } from '../payment/stripe/guards/subscriber.guard';

@Controller('dashboard/my-claims')
export class MyClaimsController {
  constructor(private readonly myClaimsService: MyClaimsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    try {
      return await this.myClaimsService.findAll(req.user.userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching claims',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
