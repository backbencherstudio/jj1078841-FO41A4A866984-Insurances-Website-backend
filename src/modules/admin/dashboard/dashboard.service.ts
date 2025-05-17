import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async findAll(period: 'monthly' | 'yearly' = 'monthly') {
    const totalMembers = await this.prisma.user.count({
      where: {
        type: 'user'
      }
    });

    const totalClaims = await this.prisma.claim.count();

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyRevenue = await this.prisma.paymentTransaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'succeeded',
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    });

    let revenueData = [];
    if (period === 'yearly') {
      const currentYear = currentDate.getFullYear();
      revenueData = await Promise.all(
        Array.from({ length: 12 }, async (_, month) => {
          const startDate = new Date(currentYear, month, 1);
          const endDate = new Date(currentYear, month + 1, 0);

          const revenue = await this.prisma.paymentTransaction.aggregate({
            _sum: {
              amount: true
            },
            where: {
              status: 'succeeded',
              created_at: {
                gte: startDate,
                lte: endDate
              }
            }
          });

          return {
            month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
            revenue: revenue._sum.amount || 0
          };
        })
      );
    } else if (period === 'monthly') {
      const daysInMonth = lastDayOfMonth.getDate();
      revenueData = await Promise.all(
        Array.from({ length: daysInMonth }, async (_, day) => {
          const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
          const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 2);

          const revenue = await this.prisma.paymentTransaction.aggregate({
            _sum: {
              amount: true
            },
            where: {
              status: 'succeeded',
              created_at: {
                gte: startDate,
                lte: endDate
              }
            }
          });

          return {
            day: `${day + 1}`,
            revenue: revenue._sum.amount || 0
          };
        })
      );
    }

    const recentClaims = await this.prisma.claim.findMany({
      select: {
        id: true,
        policy_number: true,
        type_of_damage: true,
        insurance_company: true,
        date_of_loss: true,
        status: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 4
    });

    return {
      overview: {
        totalMembers,
        totalClaims,
        pendingClaims: totalClaims,
        monthlyRevenue: monthlyRevenue._sum.amount || 0
      },
      revenueData,
      recentClaims
    };
  }
}
