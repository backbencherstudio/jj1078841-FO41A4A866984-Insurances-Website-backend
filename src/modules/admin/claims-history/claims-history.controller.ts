import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ClaimsHistoryService } from './claims-history.service';
import { CreateClaimsHistoryDto } from './dto/create-claims-history.dto';
import { UpdateClaimsHistoryDto } from './dto/update-claims-history.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('admin/claims-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClaimsHistoryController {
  constructor(private readonly claimsHistoryService: ClaimsHistoryService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return this.claimsHistoryService.findAll(search, +page, +limit);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.claimsHistoryService.remove(id);
      return {
        message: 'Claim deleted successfully'
      }
    } catch (error) {
      throw error;
    }
  }
}
