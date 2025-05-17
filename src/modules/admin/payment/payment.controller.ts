import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { DateFilter } from './enums/date-filter.enum';

@ApiTags('Admin Payment')
@Controller('admin/payment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiQuery({ 
    name: 'dateFilter', 
    required: false, 
    enum: DateFilter,
    enumName: 'DateFilter'
  })
  async findAll(@Query('dateFilter') dateFilter?: DateFilter): Promise<PaymentResponseDto[]> {
    try {
      return await this.paymentService.findAll(dateFilter);
    } catch (error) {
      throw error;
    }
  }
}
