'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Calendar, Video, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { t } = useTranslation('home');

  return (
    <div className="min-h-[100dvh] bg-cosmic text-slate-100 selection:bg-amber-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent blur-[120px] -z-10" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 text-sm text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span suppressHydrationWarning>{t('home:available_now')}</span>
            </div>

            <h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent" suppressHydrationWarning>
                {t('home:hero_title_1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]" suppressHydrationWarning>
                {t('home:hero_title_2')}
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl md:text-2xl leading-relaxed" suppressHydrationWarning>
              {t('home:hero_subtitle')}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="w-full h-14 px-8 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-lg font-bold rounded-full shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all duration-300 sm:w-auto"
                  suppressHydrationWarning
                >
                  {t('home:book_now')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/booking">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 px-8 border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white text-lg rounded-full backdrop-blur-sm transition-all sm:w-auto"
                  suppressHydrationWarning
                >
                  {t('home:check_availability')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-5xl" suppressHydrationWarning>
            {t('home:why_choose_us')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400" suppressHydrationWarning>
            {t('home:why_choose_subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature 1 - Calendar */}
          <Card className="group glass-card border-slate-800 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2">
            <CardHeader>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-slate-700 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 text-amber-400 transition-colors">
                <Calendar className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-amber-400 transition-colors" suppressHydrationWarning>{t('home:feature_scheduling_title')}</CardTitle>
              <CardDescription className="text-base text-slate-400" suppressHydrationWarning>
                {t('home:feature_scheduling_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_scheduling_1')}
                </li>
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_scheduling_2')}
                </li>
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_scheduling_3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2 - Video */}
          <Card className="group glass-card border-slate-800 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2">
            <CardHeader>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-slate-700 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 text-amber-400 transition-colors">
                <Video className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-amber-400 transition-colors" suppressHydrationWarning>{t('home:feature_online_title')}</CardTitle>
              <CardDescription className="text-base text-slate-400" suppressHydrationWarning>
                {t('home:feature_online_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_online_1')}
                </li>
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_online_2')}
                </li>
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_online_3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3 - Globe */}
          <Card className="group glass-card border-slate-800 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2">
            <CardHeader>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-slate-700 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 text-amber-400 transition-colors">
                <Globe className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white group-hover:text-amber-400 transition-colors" suppressHydrationWarning>{t('home:feature_locations_title')}</CardTitle>
              <CardDescription className="text-base text-slate-400" suppressHydrationWarning>
                {t('home:feature_locations_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_locations_1')}
                </li>
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_locations_2')}
                </li>
                <li className="flex items-start" suppressHydrationWarning>
                  <CheckCircle2 className="mr-3 h-5 w-5 text-amber-500/70" />
                  {t('home:feature_locations_3')}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl" suppressHydrationWarning>
              {t('home:cta_title')}
            </h2>
            <p className="mb-10 text-xl text-slate-400 max-w-2xl mx-auto" suppressHydrationWarning>
              {t('home:cta_desc')}
            </p>
            <Link href="/booking">
              <Button
                size="lg"
                className="h-16 px-10 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xl font-bold rounded-full shadow-[0_0_25px_rgba(251,191,36,0.25)] hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:scale-105"
                suppressHydrationWarning
              >
                {t('home:cta_button')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm">
            <p suppressHydrationWarning>{t('home:footer_rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

