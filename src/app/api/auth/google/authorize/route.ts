import { NextResponse } from 'next/server';
import { googleMeetService } from '@/lib/google-meet';

/**
 * GET /api/auth/google/authorize
 * Redirects to Google OAuth consent screen
 * 
 * Usage: Visit http://localhost:3000/api/auth/google/authorize in your browser
 * 
 * ⚠️ SECURITY: Delete this file after obtaining your refresh token!
 */
export async function GET() {
    try {
        const authUrl = googleMeetService.generateAuthUrl();
        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Failed to generate auth URL',
                message: error.message,
                hint: 'Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env'
            },
            { status: 500 }
        );
    }
}
