import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CreateBookingRequest {
  type: 'PRESENCIAL' | 'ONLINE';
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  notes?: string;
}

interface BookingResponse {
  id: string;
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  notes?: string;
  type: 'PRESENCIAL' | 'ONLINE';
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}



const DEFAULT_AMOUNT_CENTS = 4999; // 49.99 EUR in cents fallback

async function getSystemPrice(): Promise<number> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'SESSION_PRICE_CENTS' },
    });
    if (setting) {
      return parseInt(setting.value, 10);
    }
  } catch (err) {
    console.error('Error fetching price setting:', err);
  }
  return DEFAULT_AMOUNT_CENTS;
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateBookingRequest = await request.json();

    // Validate required fields
    const { type, slotId, firstName, lastName, email, phone, language, notes, couponCode } = body;

    if (
      !type ||
      !slotId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !language
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: type, slotId, firstName, lastName, email, phone, language',
        },
        { status: 400 }
      );
    }

    // Validate session type
    if (!['PRESENCIAL', 'ONLINE'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid session type. Must be PRESENCIAL or ONLINE' },
        { status: 400 }
      );
    }

    // Check if slot exists and is available
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        bookings: { select: { id: true } }
      }
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    if (slot.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Slot is not available for booking' },
        { status: 400 }
      );
    }

    if (slot.type !== type) {
      return NextResponse.json(
        { error: 'Slot type does not match booking type' },
        { status: 400 }
      );
    }

    // Calculate Price and Discount
    const systemPrice = await getSystemPrice();
    // Use slot-specific price if set, otherwise system price defaults
    const basePrice = slot.price !== null ? slot.price : systemPrice;

    let finalAmount = basePrice;
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      });

      // Basic validation (more strict validation could be shared with validate route)
      if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses && new Date(coupon.validUntil) > new Date()) {
        appliedCouponCode = couponCode;
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = Math.round((basePrice * coupon.discountValue) / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
        finalAmount = Math.max(0, basePrice - discountAmount);
      }
    }

    // Create booking and update slot status in transaction
    // Create booking and update slot status in transaction
    let booking;
    try {
      booking = await prisma.$transaction(async (tx) => {
        // Re-check capacity inside transaction
        const currentSlot = await tx.availabilitySlot.findUnique({
          where: { id: slotId },
          include: {
            bookings: { select: { id: true } }
          }
        });

        if (!currentSlot) throw new Error('Slot not found');

        // Check capacity
        if (currentSlot.bookings.length >= currentSlot.maxCapacity) {
          throw new Error('Slot is full');
        }

        const newBooking = await tx.booking.create({
          data: {
            slotId,
            firstName,
            lastName,
            email,
            phone,
            language,
            notes: notes || null,
            type,
            status: 'PENDING_PAYMENT',
            totalAmount: finalAmount,
            discountAmount,
            finalAmount,
            couponCode: appliedCouponCode,
            currency: 'EUR',
          },
        });

        // Update slot status to BOOKED if it reached capacity
        if (currentSlot.bookings.length + 1 >= currentSlot.maxCapacity) {
          await tx.availabilitySlot.update({
            where: { id: slotId },
            data: { status: 'BOOKED' },
          });
        }

        return newBooking;
      });
    } catch (err: any) {
      if (err.message === 'Slot is full') {
        return NextResponse.json(
          { error: 'This time slot is no longer available.' },
          { status: 409 } // Conflict
        );
      }
      throw err;
    }

    const response: BookingResponse = {
      id: booking.id,
      slotId: booking.slotId,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      language: booking.language,
      notes: booking.notes || undefined,
      type: booking.type as 'PRESENCIAL' | 'ONLINE',
      status: booking.status as 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings?email=user@example.com
 * List bookings by email
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email query parameter is required' },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { email },
      include: {
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const response: BookingResponse[] = bookings.map((booking) => ({
      id: booking.id,
      slotId: booking.slotId,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      language: booking.language,
      notes: booking.notes || undefined,
      type: booking.type as 'PRESENCIAL' | 'ONLINE',
      status: booking.status as 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
