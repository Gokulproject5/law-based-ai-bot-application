import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MapPin, FileText, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
    const location = useLocation();
    const { t } = useTranslation();

    const navItems = [
        { path: '/', icon: <Home size={20} />, label: t('home') },
        { path: '/categories', icon: <BookOpen size={20} />, label: t('browse_laws') },
        { path: '/templates', icon: <FileText size={20} />, label: t('templates') },
        { path: '/map', icon: <MapPin size={20} />, label: t('find_help') },
    ];

    return (
        <>
            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--glass-bg)] backdrop-blur-md border-t border-[var(--border-color)] md:hidden">
                <div className="flex justify-around items-center p-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center p-2 rounded-xl transition-all ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
                                }`}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium mt-1">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-40">
                <div className="p-6">
                    <h1 className="text-2xl font-bold font-['Outfit'] gradient-text flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                        NyayaLite
                    </h1>
                </div>

                <div className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-[var(--border-color)]">
                    <button className="flex items-center gap-3 px-4 py-2 w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <Settings size={20} />
                        <span>{t('settings')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
