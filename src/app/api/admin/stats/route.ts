import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/admin/stats
 * Returns dashboard statistics
 * Protected route - requires JWT authentication
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get total bookings
    const totalBookings = await prisma.booking.count();

    // Get upcoming sessions (confirmed bookings with future dates)
    const now = new Date();
    const upcomingSessions = await prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        slot: {
          date: {
            gte: now,
          },
        },
      },
    });

    // Get total revenue from succeeded payments
    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
      },
      select: {
        amount: true,
      },
    });

    const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json(
      {
        totalBookings,
        upcomingSessions,
        revenue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
