'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, Settings, User } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileNav() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16 px-2">
                <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-gold' : 'text-slate-400 hover:text-slate-200'}`}>
                    <Home className="w-6 h-6" />
                    <span suppressHydrationWarning className="text-[10px] font-medium">{t('common:home', 'Home')}</span>
                </Link>

                <Link href="/booking" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/booking') ? 'text-gold' : 'text-slate-400 hover:text-slate-200'}`}>
                    <Calendar className="w-6 h-6" />
                    <span suppressHydrationWarning className="text-[10px] font-medium">{t('common:booking', 'Booking')}</span>
                </Link>

                <Link href="/admin" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/admin') ? 'text-gold' : 'text-slate-400 hover:text-slate-200'}`}>
                    <Settings className="w-6 h-6" />
                    <span suppressHydrationWarning className="text-[10px] font-medium">{t('common:admin', 'Admin')}</span>
                </Link>

                {/* Since LanguageSwitcher is usually a dropdown, we might need a simplified version for mobile or just a toggle. 
            For now, let's keep it simple or use a "profile" placeholder if we had auth. 
            Actually, let's put the Language Switcher here but styled for the bar.
            Or maybe just a generic menu.
        */}
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
                    <div className="flex justify-center">
                        <LanguageSwitcher className="w-auto h-8 text-xs border-none bg-transparent focus:ring-0 p-0 text-slate-400" />
                    </div>
                    <span suppressHydrationWarning className="text-[10px] font-medium mt-1">{t('common:language', 'Lang')}</span>
                </div>
            </div>
        </div>
    );
}
