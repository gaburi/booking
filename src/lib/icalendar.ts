import ical, { ICalCalendarMethod } from 'ical-generator';

interface BookingEvent {
    id: string;
    startTime: Date;
    endTime: Date; // Calculated from duration
    summary: string;
    description: string;
    location: string;
    url: string;
    organizer: {
        name: string;
        email: string;
    };
    attendee: {
        name: string;
        email: string;
    };
}

export function generateCalendarInvite(event: BookingEvent, method: ICalCalendarMethod = ICalCalendarMethod.REQUEST): string {
    const calendar = ical({
        method,
        prodId: '//Brilance//SessionBooking//EN',
        events: [
            {
                id: event.id, // KEEPING ID CONSTANT IS KEY FOR UPDATES/CANCELLATIONS
                start: event.startTime,
                end: event.endTime,
                summary: event.summary,
                description: event.description,
                location: event.location,
                url: event.url,
                organizer: event.organizer,
                attendees: [
                    {
                        name: event.attendee.name,
                        email: event.attendee.email,
                        rsvp: true,
                        partstat: 'NEEDS-ACTION',
                        role: 'REQ-PARTICIPANT',
                    },
                ],
            },
        ],
    });

    return calendar.toString();
}
