import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface BulkAvailabilityRequest {
  locationId?: string | null;
  sessionType: 'PRESENCIAL' | 'ONLINE';
  sessionFormat?: 'GROUP' | 'INDIVIDUAL';
  startDate: string;
  endDate: string;
  times: string[];
  duration: number;
  daysOfWeek: number[];
  maxPeople?: number;
}

/**
 * POST /api/admin/availability/bulk
 * Creates multiple availability slots at once
 * Protected route - requires JWT authentication
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body: BulkAvailabilityRequest = await request.json();
    const { locationId, sessionType, sessionFormat, startDate, endDate, times, duration, daysOfWeek, maxPeople } = body;
    const capacity = maxPeople && maxPeople > 0 ? maxPeople : 1;
    const format = sessionFormat || 'INDIVIDUAL';

    // Validate required fields
    if (!sessionType || !startDate || !endDate || !times || !duration || !daysOfWeek) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate session type
    if (sessionType !== 'PRESENCIAL' && sessionType !== 'ONLINE') {
      return NextResponse.json(
        { error: 'Invalid session type. Must be PRESENCIAL or ONLINE' },
        { status: 400 }
      );
    }

    // Validate location for presencial sessions
    if (sessionType === 'PRESENCIAL' && !locationId) {
      return NextResponse.json(
        { error: 'Location is required for presencial sessions' },
        { status: 400 }
      );
    }

    // Validate arrays
    if (!Array.isArray(times) || times.length === 0) {
      return NextResponse.json(
        { error: 'At least one time slot is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return NextResponse.json(
        { error: 'At least one day of the week is required' },
        { status: 400 }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate location exists (if presencial)
    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });

      if (!location) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }

      if (!location.isActive) {
        return NextResponse.json(
          { error: 'Location is not active' },
          { status: 400 }
        );
      }
    }

    // Generate slots for each date in the range
    const slots = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();

      // Check if this day is included in the selected days
      if (daysOfWeek.includes(dayOfWeek)) {
        // Create a slot for each time
        for (const time of times) {
          const slotDate = new Date(currentDate);
          slotDate.setHours(0, 0, 0, 0);

          slots.push({
            locationId: sessionType === 'PRESENCIAL' ? locationId : null,
            date: slotDate,
            time: time,
            duration: duration,
            type: sessionType,
            sessionFormat: format,
            status: 'AVAILABLE',
            maxCapacity: capacity,
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create all slots in database
    // SQLite compatible approach (process one by one or in parallel)
    let createdCount = 0;

    // Process in chunks to avoid overwhelming the DB connection
    const chunk_size = 50;
    for (let i = 0; i < slots.length; i += chunk_size) {
      const chunk = slots.slice(i, i + chunk_size);

      await Promise.all(
        chunk.map(async (slot) => {
          try {
            // Check existence first or try create and catch error
            // Using count to verify if we should create (pseudo-skipDuplicates)
            const existing = await prisma.availabilitySlot.findFirst({
              where: {
                locationId: slot.locationId,
                date: slot.date,
                time: slot.time,
                type: slot.type
              }
            });

            if (!existing) {
              await prisma.availabilitySlot.create({ data: slot });
              createdCount++;
            }
          } catch (e) {
            // Ignore unique constraint violations if any slip through
            console.error('Error creating slot:', e);
          }
        })
      );
    }

    const result = { count: createdCount };

    return NextResponse.json(
      {
        message: 'Availability slots created successfully',
        count: result.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bulk availability:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
