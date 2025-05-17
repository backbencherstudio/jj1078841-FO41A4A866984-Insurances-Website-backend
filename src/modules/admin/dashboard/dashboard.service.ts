import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async findAll(period: 'monthly' | 'yearly' = 'monthly') {
    const totalMembers = await this.prisma.user.count({
      where: {
        deleted_at: null,
        type: 'user'
      }
    });

    let revenueData;
    if (period === 'monthly') {
      revenueData = await this.getMonthlyRevenueData();
    } else {
      revenueData = await this.getYearlyRevenueData();
    }

    return {
      overview: {
        totalMembers,
        currentRevenue: revenueData.currentRevenue,
      },
      revenueData: revenueData.data,
      period: period // Add period to response
    };
  }

  private async getMonthlyRevenueData() {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0);
      const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 23, 59, 59);

      const dailyTransactions = await this.prisma.paymentTransaction.aggregate({
        where: {
          deleted_at: null,
          status: 'completed',
          created_at: {
            gte: dayStart,
            lte: dayEnd,
          }
        },
        _sum: {
          amount: true
        }
      });

      days.push({
        date: day,
        revenue: Number(dailyTransactions._sum.amount || 0)
      });
    }

    const monthlyTotal = await this.prisma.paymentTransaction.aggregate({
      where: {
        deleted_at: null,
        status: 'completed',
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      },
      _sum: {
        amount: true
      }
    });

    return {
      currentRevenue: Number(monthlyTotal._sum.amount || 0),
      data: days
    };
  }

  private async getYearlyRevenueData() {
    const currentYear = new Date().getFullYear();
    const months = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const monthlyTransactions = await this.prisma.paymentTransaction.aggregate({
        where: {
          deleted_at: null,
          status: 'completed',
          created_at: {
            gte: startDate,
            lte: endDate,
          }
        },
        _sum: {
          amount: true
        }
      });

      months.push({
        month: startDate.toLocaleString('default', { month: 'short' }),
        revenue: Number(monthlyTransactions._sum.amount || 0)
      });
    }

    const currentMonthRevenue = months[new Date().getMonth()]?.revenue || 0;

    return {
      currentRevenue: currentMonthRevenue,
      data: months
    };
  }
}
