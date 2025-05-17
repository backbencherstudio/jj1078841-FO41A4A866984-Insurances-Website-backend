import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { DateFilter } from './enums/date-filter.enum';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async findAll(dateFilter?: DateFilter): Promise<PaymentResponseDto[]> {
    const today = new Date();
    let dateCondition = {};

    if (dateFilter) {
      switch (dateFilter) {
        case DateFilter.LAST_WEEK: {
          const endOfLastWeek = new Date(today);
          endOfLastWeek.setDate(today.getDate() - today.getDay());
          const startOfLastWeek = new Date(endOfLastWeek);
          startOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
          dateCondition = {
            created_at: {
              gte: startOfLastWeek,
              lt: endOfLastWeek
            }
          };
          break;
        }
        case DateFilter.THIS_WEEK: {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          dateCondition = {
            created_at: {
              gte: startOfWeek
            }
          };
          break;
        }
        case DateFilter.THIS_MONTH: {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          dateCondition = {
            created_at: {
              gte: startOfMonth
            }
          };
          break;
        }
        case DateFilter.THIS_YEAR: {
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          dateCondition = {
            created_at: {
              gte: startOfYear
            }
          };
          break;
        }
      }
    }

    const claims = await this.prisma.claim.findMany({
      where: dateCondition,
      select: {
        claim_number: true,
        policy_number: true,
        type_of_damage: true,
        insurance_company: true,
        date_of_loss: true,
        user: {
          select: {
            payment_transactions: {
              select: {
                amount: true,
                status: true,
                created_at: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return claims.map(claim => ({
      claim_id: claim.claim_number,
      policy_number: claim.policy_number,
      type_of_damage: claim.type_of_damage,
      insurance_company: claim.insurance_company,
      date_of_loss: claim.date_of_loss,
      payment: Number(claim.user?.payment_transactions[0]?.amount) || 2680.09,
      status: claim.user?.payment_transactions[0]?.status === 'completed' ? 'Paid' : 'Unpaid'
    }));
  }
}
