'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, User, CreditCard, Video, Building, ArrowLeft, ArrowRight, CheckCircle2, Calendar, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';

type SessionType = 'PRESENCIAL' | 'ONLINE' | null;
type SessionFormat = 'GROUP' | 'INDIVIDUAL' | null;

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number | null;
}

interface BookingData {
  sessionFormat: SessionFormat;
  sessionType: SessionType;
  locationId: string;
  date: string;
  timeSlotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

interface DayAvailability {
  date: string;
  count: number;
}

export default function BookingPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const getDateLocale = () => {
    const lang = i18n.language?.split('-')[0];
    switch (lang) {
      case 'fr': return fr;
      case 'de': return de;
      case 'en': return enUS;
      default: return ptBR; // or enUS
    }
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // New state for calendar
  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const [bookingData, setBookingData] = useState<BookingData>({
    sessionFormat: null,
    sessionType: null,
    locationId: '',
    date: '',
    timeSlotId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Price State
  const [basePrice, setBasePrice] = useState(4999); // Default base price in cents

  useEffect(() => {
    // Check if selected slot has a specific price
    if (bookingData.timeSlotId) {
      const slot = availableSlots.find(s => s.id === bookingData.timeSlotId);
      if (slot && slot.price) {
        setBasePrice(slot.price);
        return;
      }
    }

    // Default pricing logic
    let price = 4999; // Default Online Price

    if (bookingData.sessionType === 'PRESENCIAL' && bookingData.locationId) {
      // Find selected location to see if it has a specific price
      const location = locations.find(l => l.id === bookingData.locationId);
      // For this demo, let's say "Location 1" (id: location-1) is more expensive, others are standard
      // In a real app, this price would come from the database/API location object
      if (location) {
        // Example logic:
        // If name contains "Premium" or ID is specific, higher price.
        // Let's implement a simple logic: 
        // If city is 'São Paulo' or 'New York' (examples), price is higher.
        // Or just hardcode for demonstration based on ID since we don't have DB access right now to change schema easily.
        if (location.city === 'Zurich' || location.city === 'Zürich') price = 8999;
        else if (location.city === 'Geneva') price = 7999;
        else price = 5999; // Standard in-person price
      }
    } else if (bookingData.sessionType === 'PRESENCIAL' && !bookingData.locationId) {
      price = 5999; // Base starting price for in-person before selection
    }

    setBasePrice(price);
  }, [bookingData.sessionType, bookingData.locationId, locations, bookingData.timeSlotId, availableSlots]);

  const finalPrice = basePrice - discountAmount;

  const validateCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponMessage('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponMessage(`${t('booking:coupon_applied')}: ${data.coupon.discountType === 'PERCENTAGE' ? data.coupon.discountValue + '%' : '€' + (data.coupon.discountValue / 100).toFixed(2)} ${t('booking:off')}`);

        if (data.coupon.discountType === 'PERCENTAGE') {
          setDiscountAmount(Math.round((basePrice * data.coupon.discountValue) / 100));
        } else {
          setDiscountAmount(data.coupon.discountValue);
        }
      } else {
        setCouponMessage(data.message || t('booking:invalid_coupon'));
        setCouponApplied(false);
        setDiscountAmount(0);
      }
    } catch (err) {
      setCouponMessage(t('booking:error_validating_coupon'));
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setDiscountAmount(0);
    setCouponMessage('');
  };

  // Fetch locations when needed
  useEffect(() => {
    if (currentStep === 3 && bookingData.sessionType === 'PRESENCIAL' && locations.length === 0) {
      fetchLocations();
    }
  }, [currentStep, bookingData.sessionType]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (bookingData.date && (bookingData.sessionType === 'ONLINE' || bookingData.locationId)) {
      fetchAvailableSlots();
    }
  }, [bookingData.date, bookingData.locationId]);

  // Fetch available days for the month
  useEffect(() => {
    if (currentStep === 4 && (bookingData.sessionType === 'ONLINE' || bookingData.locationId)) {
      fetchMonthAvailability(currentMonth);
    }
  }, [currentStep, currentMonth, bookingData.locationId, bookingData.sessionType]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError(t('booking:error_loading_locations'));
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        date: bookingData.date,
        type: bookingData.sessionType || '',
        ...(bookingData.locationId && { locationId: bookingData.locationId }),
      });


      const response = await fetch(`/api/availability?${params}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data: any[] = await response.json();
      // Handle potential API response format differences if any
      const rawSlots = Array.isArray(data) ? data : [];

      const slots: TimeSlot[] = rawSlots.map((slot: any) => ({
        id: slot.id,
        startTime: slot.time,
        endTime: '', // api doesn't return endTime, calculate or leave empty
        available: slot.status === 'AVAILABLE',
        price: slot.price
      }));
      setAvailableSlots(slots);
    } catch (err) {
      setError(t('booking:error_loading_slots'));
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthAvailability = async (date: Date) => {
    try {
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        type: bookingData.sessionType || '',
        ...(bookingData.locationId && { locationId: bookingData.locationId }),
      });

      const response = await fetch(`/api/availability?${params}`);
      if (!response.ok) return; // Silent fail for calendar highlights

      const slots: any[] = await response.json();

      // Extract unique dates with availability
      const days = new Set<string>();
      slots.forEach(slot => {
        // Assume API returns ISO string, take YYYY-MM-DD
        const dateStr = slot.date.split('T')[0];
        days.add(dateStr);
      });

      setAvailableDays(days);
    } catch (err) {
      console.error('Error fetching month availability', err);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return bookingData.sessionFormat !== null;
      case 2:
        return bookingData.sessionType !== null;
      case 3:
        return bookingData.sessionType === 'ONLINE' || bookingData.locationId !== '';
      case 4:
        return bookingData.date !== '' && bookingData.timeSlotId !== '';
      case 5:
        return (
          bookingData.firstName !== '' &&
          bookingData.lastName !== '' &&
          bookingData.email !== '' &&
          bookingData.phone !== ''
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        type: bookingData.sessionType,
        slotId: bookingData.timeSlotId,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        notes: bookingData.notes,
        language: i18n.language || 'pt-BR',
        couponCode: couponApplied ? couponCode : undefined,
        totalAmount: basePrice,
        finalAmount: Math.max(0, finalPrice),
        discountAmount: discountAmount,
        currency: 'EUR',
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await response.json();
      router.push(`/booking/payment/${booking.id}`);
    } catch (err: any) {
      setError(err.message || t('booking:error_creating_booking'));
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: t('booking:session_format'), icon: Users },
    { number: 2, title: t('booking:session_type'), icon: Video },
    { number: 3, title: t('booking:location'), icon: MapPin },
    { number: 4, title: t('booking:select_date'), icon: CalendarComponent },
    { number: 5, title: t('booking:your_information'), icon: User },
    { number: 6, title: t('booking:payment'), icon: CreditCard },
  ];

  return (
    <div className="min-h-[100dvh] bg-cosmic text-slate-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.number === 4 ? Clock : step.icon; // Use Clock for step 4 icon in progress bar for now, or Import generic Calendar icon
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive
                          ? 'border-gold bg-gold text-slate-950 shadow-[0_0_15px_rgba(252,211,77,0.3)]'
                          : isCompleted
                            ? 'border-gold bg-gold/80 text-slate-950'
                            : 'border-slate-700 bg-slate-900/50 text-slate-500'
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          // Quick fix for icon types - Lucide icons are components
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        suppressHydrationWarning
                        className={`mt-2 hidden text-sm font-medium sm:block ${isActive || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                          }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 flex-1 transition-colors ${isCompleted ? 'bg-gold' : 'bg-slate-800'
                          }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="mx-auto max-w-4xl">
          {/* Step 1: Session Format */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-2xl text-white" suppressHydrationWarning>{t('booking:session_format')}</CardTitle>
                  <CardDescription className="text-slate-400" suppressHydrationWarning>{t('booking:session_format_subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      onClick={() => setBookingData({ ...bookingData, sessionFormat: 'GROUP' })}
                      className={`flex flex-col items-center justify-center rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] ${bookingData.sessionFormat === 'GROUP'
                        ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(252,211,77,0.1)]'
                        : 'glass-card border-transparent hover:border-gold/30'
                        }`}
                    >
                      <Users className={`mb-4 h-12 w-12 ${bookingData.sessionFormat === 'GROUP' ? 'text-gold' : 'text-slate-400'}`} />
                      <h3 className="mb-2 text-lg font-semibold text-white" suppressHydrationWarning>{t('booking:group_session')}</h3>
                      <p className="text-center text-sm text-slate-400" suppressHydrationWarning>
                        {t('booking:group_session_desc')}
                      </p>
                    </button>

                    <button
                      onClick={() => setBookingData({ ...bookingData, sessionFormat: 'INDIVIDUAL' })}
                      className={`flex flex-col items-center justify-center rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] ${bookingData.sessionFormat === 'INDIVIDUAL'
                        ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(252,211,77,0.1)]'
                        : 'glass-card border-transparent hover:border-gold/30'
                        }`}
                    >
                      <User className={`mb-4 h-12 w-12 ${bookingData.sessionFormat === 'INDIVIDUAL' ? 'text-gold' : 'text-slate-400'}`} />
                      <h3 className="mb-2 text-lg font-semibold text-white" suppressHydrationWarning>{t('booking:individual_session')}</h3>
                      <p className="text-center text-sm text-slate-400" suppressHydrationWarning>
                        {t('booking:individual_session_desc')}
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Session Type */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-2xl text-white" suppressHydrationWarning>{t('booking:session_type')}</CardTitle>
                  <CardDescription className="text-slate-400" suppressHydrationWarning>{t('booking:subtitle')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      onClick={() => setBookingData({ ...bookingData, sessionType: 'PRESENCIAL' })}
                      className={`flex flex-col items-center justify-center rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] ${bookingData.sessionType === 'PRESENCIAL'
                        ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(252,211,77,0.1)]'
                        : 'glass-card border-transparent hover:border-gold/30'
                        }`}
                    >
                      <Building className={`mb-4 h-12 w-12 ${bookingData.sessionType === 'PRESENCIAL' ? 'text-gold' : 'text-slate-400'}`} />
                      <h3 className="mb-2 text-lg font-semibold text-white" suppressHydrationWarning>{t('booking:presencial')}</h3>
                      <p className="text-center text-sm text-slate-400" suppressHydrationWarning>
                        {t('booking:presencial_desc', 'Encontro pessoal em um de nossos locais')}
                      </p>
                    </button>

                    <button
                      onClick={() => setBookingData({ ...bookingData, sessionType: 'ONLINE' })}
                      className={`flex flex-col items-center justify-center rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] ${bookingData.sessionType === 'ONLINE'
                        ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(252,211,77,0.1)]'
                        : 'glass-card border-transparent hover:border-gold/30'
                        }`}
                    >
                      <Video className={`mb-4 h-12 w-12 ${bookingData.sessionType === 'ONLINE' ? 'text-gold' : 'text-slate-400'}`} />
                      <h3 className="mb-2 text-lg font-semibold text-white" suppressHydrationWarning>{t('booking:online')}</h3>
                      <p className="text-center text-sm text-slate-400" suppressHydrationWarning>
                        {t('booking:online_desc', 'Sessão via videochamada de qualquer lugar')}
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Location Selection */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-2xl" suppressHydrationWarning>
                    {bookingData.sessionType === 'ONLINE' ? t('booking:online') : t('booking:select_location')}
                  </CardTitle>
                  <CardDescription suppressHydrationWarning>
                    {bookingData.sessionType === 'ONLINE'
                      ? t('booking:online_desc', 'Você receberá um link de videochamada por email')
                      : t('booking:select_location_desc', 'Selecione o local mais conveniente para você')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookingData.sessionType === 'ONLINE' ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Video className="mb-4 h-16 w-16 text-gold" />
                      <p className="text-center text-slate-300">
                        {t('booking:online_session_info')}
                        <br />
                        {t('booking:online_session_link_info')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center">{t('common:loading')}</div>
                      ) : (
                        locations.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => setBookingData({ ...bookingData, locationId: location.id })}
                            className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${bookingData.locationId === location.id
                              ? 'border-gold bg-gold/10'
                              : 'glass-card border-transparent hover:border-gold/30'
                              }`}
                          >
                            <div className="flex items-start">
                              <MapPin className={`mr-3 mt-1 h-5 w-5 flex-shrink-0 ${bookingData.locationId === location.id ? 'text-gold' : 'text-slate-400'}`} />
                              <div>
                                <h3 className="font-semibold text-white">{location.name}</h3>
                                <p className="text-sm text-slate-400">{location.address}</p>
                                <p className="text-sm text-slate-500">{location.city}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Date and Time */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="bg-gold/20 p-2 rounded-lg text-gold">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span suppressHydrationWarning>{t('booking:select_date')}</span>
                </h2>
                <p className="text-slate-400 ml-12">{t('booking:subtitle')}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                {/* Left Column: Calendar */}
                <Card className="h-fit glass-card border-none">
                  <CardContent className="p-6 flex justify-center booking-calendar-wrapper">
                    <CalendarComponent
                      className="p-3 text-slate-200"
                      mode="single"
                      selected={bookingData.date ? new Date(bookingData.date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                          setBookingData({ ...bookingData, date: offsetDate.toISOString().split('T')[0], timeSlotId: '' });
                        } else {
                          setBookingData({ ...bookingData, date: '', timeSlotId: '' });
                        }
                      }}
                      onMonthChange={setCurrentMonth}
                      locale={getDateLocale()}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      modifiers={{
                        available: (date) => {
                          const dateStr = date.toISOString().split('T')[0];
                          return availableDays.has(dateStr);
                        }
                      }}
                      modifiersClassNames={{
                        available: "bg-indigo-900/50 text-indigo-200 font-bold hover:bg-gold/20 hover:text-gold rounded-full",
                        selected: "bg-gold text-slate-950 font-bold hover:bg-amber-400 rounded-full"
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Right Column: Time Slots */}
                <Card className="h-fit min-h-[400px] flex flex-col glass-card border-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center gap-2 text-white">
                      <Clock className="h-5 w-5 text-gold" />
                      <span suppressHydrationWarning>{t('booking:available_slots')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {bookingData.date ? (
                      <div className="mt-2">
                        {loading && (
                          <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gold"></div>
                          </div>
                        )}

                        {!loading && availableSlots && availableSlots.length === 0 && (
                          <div className="rounded-lg bg-red-900/20 p-4 text-center text-red-300 mt-10 border border-red-900/30">
                            {t('booking:no_slots_available')}
                          </div>
                        )}

                        {!loading && availableSlots && availableSlots.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => setBookingData({ ...bookingData, timeSlotId: slot.id })}
                                disabled={!slot.available}
                                className={`py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 border ${bookingData.timeSlotId === slot.id
                                  ? 'bg-gold text-slate-950 border-gold shadow-lg font-bold'
                                  : slot.available
                                    ? 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-gold/50 hover:text-gold'
                                    : 'bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                  }`}
                              >
                                {slot.startTime}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-slate-500 text-center p-8 opacity-60">
                        <Calendar className="h-12 w-12 mb-4 text-slate-600" />
                        <p>{t('booking:select_date')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 5: Personal Information */}
          {currentStep === 5 && (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-2xl text-white" suppressHydrationWarning>{t('booking:your_information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName" className="text-slate-300">{t('booking:first_name')}</Label>
                      <Input
                        id="firstName"
                        value={bookingData.firstName}
                        onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                        placeholder={t('booking:placeholder_first_name')}
                        className="mt-2 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-gold focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-slate-300">{t('booking:last_name')}</Label>
                      <Input
                        id="lastName"
                        value={bookingData.lastName}
                        onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                        placeholder={t('booking:placeholder_last_name')}
                        className="mt-2 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-gold focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-300">{t('booking:email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      placeholder={t('booking:placeholder_email')}
                      className="mt-2 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-gold focus:ring-gold"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-slate-300">{t('booking:phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      placeholder={t('booking:placeholder_phone')}
                      className="mt-2 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-gold focus:ring-gold"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-slate-300">{t('booking:notes')}</Label>
                    <textarea
                      id="notes"
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      placeholder={t('booking:placeholder_notes')}
                      className="mt-2 flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-gold"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Payment */}
          {currentStep === 6 && (
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-2xl text-white" suppressHydrationWarning>{t('booking:payment')}</CardTitle>
                  <CardDescription className="text-slate-400" suppressHydrationWarning>{t('booking:proceed_to_payment')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-xl bg-slate-950/50 border border-slate-700 p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white">{t('booking:booking_details')}</h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('booking:session_type')}:</span>
                        <span className="font-medium text-white">{bookingData.sessionType === 'PRESENCIAL' ? t('booking:presencial') : t('booking:online')}</span>
                      </div>
                      {bookingData.sessionType === 'PRESENCIAL' && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('booking:location')}:</span>
                          <span className="font-medium text-white">
                            {locations.find((l) => l.id === bookingData.locationId)?.name}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('booking:session_date')}:</span>
                        <span className="font-medium text-white">
                          {new Date(bookingData.date).toLocaleDateString(i18n.language)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('booking:session_time')}:</span>
                        <span className="font-medium text-white">
                          {availableSlots.find((s) => s.id === bookingData.timeSlotId)?.startTime}
                        </span>
                      </div>

                      {/* Coupon Section */}
                      <div className="border-t border-slate-700 pt-2 mt-2">
                        <div className="flex gap-2 items-center mb-2">
                          <Input
                            placeholder={t('booking:coupon_code')}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="h-8 text-sm bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                            disabled={couponApplied}
                          />
                          {couponApplied ? (
                            <Button size="sm" variant="ghost" className="h-8 text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={removeCoupon} suppressHydrationWarning>
                              {t('booking:remove')}
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8 border-slate-600 text-slate-300 hover:bg-gold hover:text-slate-950 hover:border-gold" onClick={validateCoupon} disabled={!couponCode || validatingCoupon} suppressHydrationWarning>
                              {validatingCoupon ? '...' : t('booking:apply')}
                            </Button>
                          )}
                        </div>
                        {couponMessage && (
                          <p className={`text-xs mb-2 ${couponApplied ? 'text-green-400' : 'text-red-400'}`}>
                            {couponMessage}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-slate-700 pt-2">
                        <div className="flex justify-between text-base text-slate-300">
                          <span suppressHydrationWarning>{t('booking:subtotal')}:</span>
                          <span>€ {(basePrice / 100).toFixed(2)}</span>
                        </div>
                        {couponApplied && (
                          <div className="flex justify-between text-base text-green-400">
                            <span suppressHydrationWarning>{t('booking:discount')}:</span>
                            <span>- € {(discountAmount / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold mt-1 text-white">
                          <span suppressHydrationWarning>{t('booking:total')}:</span>
                          <span className="text-gold">€ {(finalPrice / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
                    <CreditCard className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                    <p className="mb-2 font-medium text-slate-300">
                      {t('booking:pay_securely')}
                    </p>
                    <p className="text-sm text-slate-500">{t('booking:proceed_to_payment')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between max-w-2xl mx-auto">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                suppressHydrationWarning
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common:back')}
              </Button>
            )}
            {currentStep < 6 ? (
              <Button
                onClick={handleNext}
                disabled={!validateCurrentStep() || loading}
                className="ml-auto bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold shadow-[0_0_15px_rgba(252,211,77,0.4)]"
                suppressHydrationWarning
              >
                {t('common:next')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateCurrentStep() || loading}
                className="ml-auto bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold shadow-[0_0_15px_rgba(252,211,77,0.4)]"
                suppressHydrationWarning
              >
                {loading ? t('booking:processing') : t('booking:proceed_to_payment')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
