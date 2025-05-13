import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('claim-summary/:claimNumber')
  @UseGuards(JwtAuthGuard)
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
}
