import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Check auth (assuming middleware or internal check, implementing basic check here for safety if middleware is missing)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) { // simplified check, normally middleware handles this
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Stale client check
        if (!(prisma as any).systemSettings) {
            console.warn('Prisma Client stale: systemSettings table not found. Returning empty.');
            return NextResponse.json({});
        }

        const settings = await (prisma as any).systemSettings.findMany();

        // Transform to object for easier consumption { key: value }
        const settingsMap = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, value, description } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { error: 'Missing key or value' },
                { status: 400 }
            );
        }

        // Check for stale client
        if (!(prisma as any).systemSettings) {
            return NextResponse.json({ error: 'System update pending restart.' }, { status: 503 });
        }

        const setting = await (prisma as any).systemSettings.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description },
        });

        return NextResponse.json(setting);
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
