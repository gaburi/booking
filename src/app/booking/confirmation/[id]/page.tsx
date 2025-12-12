'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Calendar, Clock, MapPin, Video, Mail, Phone, User, Printer, Home, Download, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Booking {
  id: string;
  sessionType: 'PRESENCIAL' | 'ONLINE';
  date: string;
  startTime: string;
  endTime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  status: string;
  meetingLink?: string;
  location?: Location;
  confirmationCode: string;
}

export default function ConfirmationPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBooking(params.id as string);
    }
  }, [params.id]);

  const fetchBooking = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        if (attempts === 0) setLoading(true);

        const response = await fetch(`/api/bookings/${id}`);

        if (response.ok) {
          const data = await response.json();
          setBooking(data);
          setLoading(false);
          return;
        }

        if (response.status === 404) {
          console.log(`Booking not found (attempt ${attempts + 1}), retrying...`);
          throw new Error('Not found yet');
        }

        throw new Error('API Error');

      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          setError(t('booking:error_loading_booking', 'Erro ao carregar informações da reserva.'));
          setLoading(false);
          console.error('Final Error fetching booking:', err);
        } else {
          await new Promise(r => setTimeout(r, 500 * attempts));
        }
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-cosmic text-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gold border-r-transparent"></div>
          <p className="mt-4 text-slate-300" suppressHydrationWarning>{t('common:loading', 'Carregando informações da reserva...')}</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[100dvh] bg-cosmic text-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="mx-auto max-w-2xl glass-card border-red-900/30">
            <CardHeader>
              <CardTitle className="text-2xl text-red-400" suppressHydrationWarning>{t('booking:error')}</CardTitle>
              <CardDescription className="text-slate-400" suppressHydrationWarning>{error || t('booking:booking_not_found')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold shadow-[0_0_20px_rgba(251,191,36,0.2)]" suppressHydrationWarning>
                  <Home className="mr-2 h-4 w-4" />
                  {t('booking:back_home')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-cosmic text-slate-100 selection:bg-amber-500/30">
      <Navbar />

      {/* Cosmic Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-green-900/20 via-emerald-900/10 to-transparent blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        {/* Success Header with Animation */}
        <div className="mx-auto mb-12 max-w-3xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pulse">
            <CheckCircle2 className="h-14 w-14 text-green-400" />
          </div>

          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-500/30 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-300" suppressHydrationWarning>{t('booking:confirmed_successfully')}</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent" suppressHydrationWarning>
              {t('booking:booking_confirmed')}
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto" suppressHydrationWarning>
            {t('booking:confirmation_sent_to')}{' '}
            <span className="font-semibold text-gold">{booking.email}</span>
          </p>
        </div>

        {/* Booking Details */}
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Main Information Card */}
          <Card className="glass-card border-none overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center text-2xl text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 mr-3">
                  <Calendar className="h-6 w-6 text-gold" />
                </div>
                {t('booking:booking_details', 'Detalhes da Sessão')}
              </CardTitle>
              <CardDescription className="text-slate-400 flex items-center gap-2" suppressHydrationWarning>
                <span>{t('booking:confirmation_code')}:</span>
                <span className="font-mono font-bold text-gold">{booking.confirmationCode}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Date */}
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-gold/30 transition-colors">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-slate-700">
                    <Calendar className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:date')}</p>
                    <p className="font-semibold text-white capitalize">{formatDate(booking.date)}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-gold/30 transition-colors">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-slate-700">
                    <Clock className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:time')}</p>
                    <p className="font-semibold text-white">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>

                {/* Location or Online */}
                {booking.sessionType === 'PRESENCIAL' ? (
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-gold/30 transition-colors sm:col-span-2">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-slate-700">
                      <MapPin className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:local')}</p>
                      <p className="font-semibold text-white">{booking.location?.name}</p>
                      <p className="text-sm text-slate-400">{booking.location?.address}</p>
                      <p className="text-sm text-slate-400">{booking.location?.city}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-gold/30 transition-colors sm:col-span-2">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-slate-700">
                      <Video className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:online_session')}</p>
                      <p className="font-semibold text-white mb-2" suppressHydrationWarning>{t('booking:video_call_link')}</p>
                      {booking.meetingLink ? (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
                          suppressHydrationWarning
                        >
                          {t('booking:access_meeting')}
                          <Download className="ml-2 h-4 w-4" />
                        </a>
                      ) : (
                        <p className="text-sm text-slate-400 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3" suppressHydrationWarning>
                          {t('booking:link_sent_before')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {booking.notes && (
                <div className="rounded-xl bg-slate-900/50 border border-slate-700/50 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-300" suppressHydrationWarning>{t('booking:observations')}</p>
                  <p className="text-sm text-slate-400">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Information Card */}
          <Card className="glass-card border-none">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="flex items-center text-2xl text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 mr-3">
                  <User className="h-6 w-6 text-gold" />
                </div>
                <span suppressHydrationWarning>{t('booking:your_info')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:full_name')}</p>
                  <p className="font-semibold text-white">
                    {booking.firstName} {booking.lastName}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:email')}</p>
                  <p className="font-semibold text-white break-all">{booking.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:phone')}</p>
                  <p className="font-semibold text-white">{booking.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1" suppressHydrationWarning>{t('booking:status')}</p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-900/30 border border-green-500/30 px-3 py-1 text-sm font-semibold text-green-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {booking.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card className="glass-card border-none">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="text-xl text-white" suppressHydrationWarning>{t('booking:qr_code_checkin')}</CardTitle>
              <CardDescription className="text-slate-400" suppressHydrationWarning>{t('booking:qr_code_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/30 p-8">
                <div className="mb-4 h-48 w-48 rounded-xl bg-white p-4 shadow-2xl shadow-amber-900/20">
                  <div className="flex h-full w-full items-center justify-center border-2 border-slate-200 rounded-lg">
                    <p className="text-center text-sm text-slate-600 font-mono">
                      QR Code
                      <br />
                      <span className="text-xs">{booking.confirmationCode}</span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  <span suppressHydrationWarning>{t('booking:code')}:</span> <span className="font-mono font-bold text-gold text-lg">{booking.confirmationCode}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="glass-card border-amber-900/30 bg-gradient-to-br from-amber-900/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <span suppressHydrationWarning>{t('booking:important_info')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gold" />
                <p suppressHydrationWarning>{t('booking:arrive_early')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gold" />
                <p suppressHydrationWarning>{t('booking:test_connection')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gold" />
                <p suppressHydrationWarning>{t('booking:reminder_email')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gold" />
                <p suppressHydrationWarning>{t('booking:reschedule_cancel')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 print:hidden sm:flex-row">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-gold/50 transition-all"
              suppressHydrationWarning
            >
              <Printer className="mr-2 h-4 w-4" />
              {t('booking:print_confirmation', 'Imprimir Confirmação')}
            </Button>
            <Link href="/" className="flex-1">
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-bold shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all"
                suppressHydrationWarning
              >
                <Home className="mr-2 h-4 w-4" />
                {t('booking:back_home', 'Voltar para Home')}
              </Button>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl glass-card border-none p-6 text-center">
            <p className="mb-4 text-sm text-slate-400" suppressHydrationWarning>
              {t('booking:need_help')}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`mailto:contato@brilliance.com`}
                className="flex items-center text-sm text-gold hover:text-amber-300 transition-colors"
              >
                <Mail className="mr-2 h-4 w-4" />
                contato@brilliance.com
              </a>
              <a
                href="tel:+5511999999999"
                className="flex items-center text-sm text-gold hover:text-amber-300 transition-colors"
              >
                <Phone className="mr-2 h-4 w-4" />
                (11) 99999-9999
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          nav,
          .print\\:hidden {
            display: none !important;
          }
          .container {
            max-width: 100% !important;
          }
          .glass-card {
            background: white !important;
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  );
}
