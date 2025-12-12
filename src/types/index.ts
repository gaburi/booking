export type SessionType = 'PRESENCIAL' | 'ONLINE';
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export type UserRole = 'ADMIN' | 'SUPER_ADMIN';

export interface Location {
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
}

export interface AvailabilitySlot {
  id: string;
  locationId?: string;
  date: Date;
  time: string;
  duration: number;
  type: SessionType;
  status: SlotStatus;
  location?: Location;
}

export interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  notes?: string;
  type: SessionType;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  slot?: AvailabilitySlot;
}

export interface CreateBookingDTO {
  type: SessionType;
  locationId?: string;
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  notes?: string;
}
