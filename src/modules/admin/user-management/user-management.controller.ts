import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { CreateUserManagementDto } from './dto/create-user-management.dto';
import { UpdateUserManagementDto } from './dto/update-user-management.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { UserStatusFilter } from './enums/user-status-filter.enum';
import { ApiQuery } from '@nestjs/swagger';

@Controller('admin/user-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ 
    name: 'filter', 
    required: false, 
    enum: UserStatusFilter,
    enumName: 'UserStatusFilter'
  })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter: UserStatusFilter = UserStatusFilter.ALL,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    try {
      return this.userManagementService.findAll(
        search,
        page ? +page : 1,
        limit ? +limit : 10,
        filter
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.userManagementService.remove(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error; // Let the exception handler deal with the error
    }
  }
}
