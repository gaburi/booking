import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all coupons
export async function GET(request: NextRequest) {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

// POST: Create coupon
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Basic validation
        if (!body.code || !body.discountValue) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: body.code,
                discountType: body.discountType || 'PERCENTAGE',
                discountValue: body.discountValue,
                maxUses: body.maxUses,
                validUntil: body.validUntil ? new Date(body.validUntil) : null,
                isActive: true
            }
        });
        return NextResponse.json(coupon);
    } catch (error) {
        // Unique constraint violation for code
        console.error(error);
        return NextResponse.json({ error: 'Failed to create coupon (Code might exist)' }, { status: 500 });
    }
}

// PATCH: Update status
export async function PATCH(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        const body = await request.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const coupon = await prisma.coupon.update({
            where: { id },
            data: { isActive: body.isActive }
        });
        return NextResponse.json(coupon);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

// DELETE: Remove coupon
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.coupon.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
