import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/locations - List all active locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = includeInactive ? {} : { isActive: true };

    const locations = await prisma.location.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST /api/locations - Create new location (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const location = await prisma.location.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        country: body.country,
        postalCode: body.postalCode,
        capacity: body.capacity || 1,
        lat: body.lat,
        lng: body.lng,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
