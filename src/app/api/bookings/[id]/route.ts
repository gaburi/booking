import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  slot?: any;
}

interface UpdateBookingRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  language?: string;
  notes?: string;
  status?: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

/**
 * GET /api/bookings/[id]
 * Fetch a single booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            location: true,
          },
        },
        googleMeetEvent: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.slot) {
      return NextResponse.json(
        { error: 'Booking slot not found' },
        { status: 404 }
      );
    }

    // Calculate end time from start time + duration
    const calculateEndTime = (startTime: string, durationMinutes: number): string => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const startTime = booking.slot.time;
    const endTime = calculateEndTime(booking.slot.time, booking.slot.duration);

    // Format the response for the confirmation page
    const response = {
      id: booking.id,
      sessionType: booking.type,
      date: booking.slot.date.toISOString(),
      startTime: startTime,
      endTime: endTime,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      notes: booking.notes || undefined,
      status: booking.status,
      meetingLink: booking.googleMeetEvent?.meetLink || undefined,
      location: booking.slot.type === 'PRESENCIAL' && booking.slot.location ? {
        id: booking.slot.location.id,
        name: booking.slot.location.name,
        address: booking.slot.location.address,
        city: booking.slot.location.city,
      } : undefined,
      confirmationCode: booking.id.substring(0, 8).toUpperCase(),
      slotId: booking.slotId,
      language: booking.language,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bookings/[id]
 * Update a booking (only before payment is confirmed)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body: UpdateBookingRequest = await request.json();

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate status update
    if (
      body.status &&
      !['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(
        body.status
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid booking status. Must be PENDING_PAYMENT, CONFIRMED, CANCELLED, or COMPLETED',
        },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.status !== undefined) updateData.status = body.status;

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        slot: true,
      },
    });

    const response: BookingResponse = {
      id: updatedBooking.id,
      slotId: updatedBooking.slotId,
      firstName: updatedBooking.firstName,
      lastName: updatedBooking.lastName,
      email: updatedBooking.email,
      phone: updatedBooking.phone,
      language: updatedBooking.language,
      notes: updatedBooking.notes || undefined,
      type: updatedBooking.type as 'PRESENCIAL' | 'ONLINE',
      status: updatedBooking.status as 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
      totalAmount: updatedBooking.totalAmount,
      currency: updatedBooking.currency,
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString(),
      slot: updatedBooking.slot,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel/delete a booking and free up the slot
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update slot status back to AVAILABLE
    await prisma.availabilitySlot.update({
      where: { id: booking.slotId },
      data: { status: 'AVAILABLE' },
    });

    // Delete the booking
    const deletedBooking = await prisma.booking.delete({
      where: { id },
    });

    const response: BookingResponse = {
      id: deletedBooking.id,
      slotId: deletedBooking.slotId,
      firstName: deletedBooking.firstName,
      lastName: deletedBooking.lastName,
      email: deletedBooking.email,
      phone: deletedBooking.phone,
      language: deletedBooking.language,
      notes: deletedBooking.notes || undefined,
      type: deletedBooking.type as 'PRESENCIAL' | 'ONLINE',
      status: deletedBooking.status as 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
      totalAmount: deletedBooking.totalAmount,
      currency: deletedBooking.currency,
      createdAt: deletedBooking.createdAt.toISOString(),
      updatedAt: deletedBooking.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
