import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MyClaimsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.claim.findMany({
      where: {
        user_id: userId
      },
      select: {
        claim_number: true,
        policy_number: true,
        type_of_damage: true,
        date_of_loss: true,
        insurance_company: true,
        status: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}
