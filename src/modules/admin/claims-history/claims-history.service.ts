import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClaimsHistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const whereCondition: any = {
      deleted_at: null,
    };
  
    if (search) {
      whereCondition.OR = [
        { claim_number: { contains: search, mode: 'insensitive' } },
        { policy_number: { contains: search, mode: 'insensitive' } },
        { type_of_damage: { contains: search, mode: 'insensitive' } },
        { insurance_company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({
        where: whereCondition,
        select: {
          id: true,
          claim_number: true,
          policy_number: true,
          type_of_damage: true,
          insurance_company: true,
          date_of_loss: true,
          status: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.claim.count({ where: whereCondition })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async remove(id: string) {
    return await this.prisma.claim.update({
      where: {
        id: id
      },
      data: {
        deleted_at: new Date(),
      }
    });
  }
}
