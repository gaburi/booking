import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AvailabilityResponse {
  id: string;
  locationId?: string;
  date: string;
  time: string;
  duration: number;
  type: 'PRESENCIAL' | 'ONLINE';
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  price?: number | null;
  maxCapacity?: number;
  currentBookings?: number;
  location?: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    capacity: number;
    lat?: number;
    lng?: number;
    isActive: boolean;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId') || undefined;
    const dateParam = searchParams.get('date');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const type = searchParams.get('type') as 'PRESENCIAL' | 'ONLINE' | null;

    // Validate type parameter - it is required
    if (!type || !['PRESENCIAL', 'ONLINE'].includes(type)) {
      // If type is not 'PRESENCIAL' or 'ONLINE', return 400
      // This handles the case where type is empty string too
      return NextResponse.json(
        { error: 'Session type is required (PRESENCIAL or ONLINE)' },
        { status: 400 }
      );
    }

    // Build query conditions
    const where: Record<string, unknown> = {
      status: 'AVAILABLE',
      type: type,
    };

    if (locationId) {
      where.locationId = locationId;
    }

    // Date Logic
    if (startDateParam && endDateParam) {
      // Range query (for calendar view)
      const start = new Date(startDateParam);
      const end = new Date(endDateParam);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        where.date = {
          gte: start,
          lte: end
        };
      }
    } else if (dateParam) {
      // Single date query
      const dateFilter = new Date(dateParam);
      if (!isNaN(dateFilter.getTime())) {
        const startOfDay = new Date(dateFilter);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateFilter);
        endOfDay.setHours(23, 59, 59, 999);

        where.date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    } else {
      // Default: filter by today or later
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      where.date = {
        gte: today,
      };
    }

    const slots: any[] = await prisma.availabilitySlot.findMany({
      where: where as any,
      include: {
        location: type === 'PRESENCIAL' ? true : false,
        bookings: {
          select: { id: true }
        }
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    } as any);

    // Filter by capacity and time (if today)
    const now = new Date();
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    const availableSlots = slots.filter(slot => {
      // If blocked or explicitly booked (legacy status), skip
      if (slot.status !== 'AVAILABLE') return false;

      // Check capacity
      if (slot.bookings.length >= slot.maxCapacity) return false;

      // Filter past times if date is today
      const slotDate = new Date(slot.date);
      if (slotDate.toDateString() === now.toDateString()) {
        const [hours, minutes] = slot.time.split(':').map(Number);
        const slotTime = new Date(slotDate);
        slotTime.setHours(hours, minutes, 0, 0);

        if (slotTime < now) return false;
      }

      // Also strictly filter textually past days
      if (slotDate < todayMidnight) return false;

      return true;
    });

    // Format response
    const response: AvailabilityResponse[] = availableSlots.map((slot) => ({
      id: slot.id,
      locationId: slot.locationId || undefined,
      date: slot.date.toISOString(),
      time: slot.time,
      duration: slot.duration,
      type: slot.type as 'PRESENCIAL' | 'ONLINE',
      status: slot.status as 'AVAILABLE' | 'BOOKED' | 'BLOCKED',
      price: slot.price,
      maxCapacity: slot.maxCapacity,
      currentBookings: slot.bookings.length,
      location: slot.location
        ? {
          id: slot.location.id,
          name: slot.location.name,
          address: slot.location.address,
          city: slot.location.city,
          country: slot.location.country,
          postalCode: slot.location.postalCode || undefined,
          capacity: slot.location.capacity,
          lat: slot.location.lat || undefined,
          lng: slot.location.lng || undefined,
          isActive: slot.location.isActive,
        }
        : undefined,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching availability slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
