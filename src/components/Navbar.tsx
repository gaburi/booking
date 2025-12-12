'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from './ui/button';

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              Brilliance
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/booking">
              <Button variant="ghost" suppressHydrationWarning>{t('common:booking')}</Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" suppressHydrationWarning>{t('common:admin')}</Button>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
