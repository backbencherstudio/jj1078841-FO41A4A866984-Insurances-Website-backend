import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserManagementDto } from './dto/create-user-management.dto';
import { UpdateUserManagementDto } from './dto/update-user-management.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { UserStatusFilter } from './enums/user-status-filter.enum';

@Injectable()
export class UserManagementService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 10,
    filter: UserStatusFilter = UserStatusFilter.ALL
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    const whereConditions: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          {
            first_name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          },
          {
            last_name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          },
          {
            email: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          }
        ]
      }),
      ...(filter !== UserStatusFilter.ALL && {
        status: filter === UserStatusFilter.ACTIVE ? 1 : 0
      })
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereConditions,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          status: true,
          subscriptions: {
            select: {
              plan_type: true,
              status: true
            },
            orderBy: {
              created_at: 'desc'
            },
            take: 1
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      this.prisma.user.count({ where: whereConditions })
    ]);

    const mappedUsers = users.map(user => ({
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || '',
      email: user.email || '',
      date: user.created_at,
      plan: user.subscriptions[0]?.plan_type || 'No Plan',
      status: user.status === 1 ? 'Active' : 'Pending'
    }));

    return {
      data: mappedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
