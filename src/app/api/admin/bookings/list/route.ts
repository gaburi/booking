import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Basic Auth Check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                slot: true,
            },
        });

        // Transform if needed to match interface
        const response = bookings.map((booking) => ({
            id: booking.id,
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            phone: booking.phone,
            language: booking.language,
            type: booking.type,
            status: booking.status,
            createdAt: booking.createdAt.toISOString(),
            totalAmount: booking.totalAmount,
        }));

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
