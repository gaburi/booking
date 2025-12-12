import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ valid: false, message: 'Code required' }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ valid: false, message: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ valid: false, message: 'Coupon is inactive' }, { status: 400 });
        }

        if (coupon.validUntil && new Date() > coupon.validUntil) {
            return NextResponse.json({ valid: false, message: 'Coupon expired' }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}
