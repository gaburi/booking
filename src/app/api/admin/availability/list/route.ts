import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const slots = await prisma.availabilitySlot.findMany({
            where: {
                status: 'AVAILABLE',
                date: { gte: new Date() } // Only future
            },
            include: {
                location: true,
                bookings: { select: { id: true } }
            },
            orderBy: { date: 'asc' },
            take: 100
        });
        return NextResponse.json(slots);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Ensure we don't delete booked slots (safety check)
        const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
        if (!slot || slot.status !== 'AVAILABLE') {
            return NextResponse.json({ error: 'Cannot delete booked or missing slot' }, { status: 400 });
        }

        await prisma.availabilitySlot.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, price } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        // Update the slot
        const updatedSlot = await prisma.availabilitySlot.update({
            where: { id },
            data: {
                price: price ? parseInt(price) : null,
                maxCapacity: body.maxCapacity ? parseInt(body.maxCapacity) : undefined,
                sessionFormat: body.sessionFormat || undefined
            }
        });

        return NextResponse.json(updatedSlot);
    } catch (e) {
        console.error('Error updating slot:', e);
        return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 });
    }
}
