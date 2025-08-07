import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus, Req, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('claim-summary/:claimNumber')
  async getClaimSummary(@Param('claimNumber') claimNumber: string) {
    try {
      return await this.dashboardService.getClaimSummary(claimNumber);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching claim summary',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    } 
  }

  @Post('sentMessageToAdmin')
  async setMessageTOAdmin(@Body() body:{message:String, claimId:String}, @Request() req){
    const userId = req?.user?.userId
    const response = await this.dashboardService.sendMessageToAdmin(body.message,userId, body.claimId)
    return response
  }
}
