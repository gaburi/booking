import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export class GoogleMeetService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_API_URL + '/api/auth/google/callback'
    );
  }

  // Generate the URL for the admin to authorize the app
  generateAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force refresh token generation
    });
  }

  // Exchange code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Create a Google Meet event
  async createMeeting(
    bookingId: string, 
    title: string, 
    description: string, 
    startTime: Date, 
    durationMinutes: number,
    attendeeEmail: string
  ) {
    // In a real app, we would retrieve the stored Refresh Token from the database (User model or SystemConfig)
    // For MVP, we assume it's in env or passed in. 
    // Since we don't have a DB table for system config yet, we'll use the ENV if available, 
    // or mock it if we are in "setup" mode.
    
    if (process.env.GOOGLE_REFRESH_TOKEN === 'mock' || !process.env.GOOGLE_REFRESH_TOKEN) {
      console.log('⚠️ Mocking Google Meet creation (No valid credentials)');
      return {
        meetLink: 'https://meet.google.com/mock-link-' + bookingId,
        eventId: 'mock-event-' + Date.now(),
      };
    }

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [{ email: attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: bookingId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
      });

      return {
        meetLink: response.data.hangoutLink || '',
        eventId: response.data.id || '',
      };
    } catch (error) {
      console.error('Error creating Google Meet event:', error);
      throw error;
    }
  }
}

export const googleMeetService = new GoogleMeetService();
