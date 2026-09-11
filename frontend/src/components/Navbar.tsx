'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles, Calendar, Building, Ticket, Bot, Shield, LogOut, User as UserIcon } from 'lucide-react';
import { removeAuthToken } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Sparkles },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Venues', href: '/venues', icon: Building },
    { name: 'My Passes', href: '/registrations', icon: Ticket },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot, highlight: true },
    ...(user?.role === 'ADMIN' ? [{ name: 'Observability', href: '/admin/agent-activity', icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">SmartEvent<span className="text-indigo-600">.AI</span></span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-full border border-indigo-100">Agentic v1.0</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition ${
                  link.highlight
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    : active
                    ? 'bg-slate-100 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 hidden sm:flex items-center space-x-2">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium text-slate-700">{user.name}</span>
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 font-mono rounded text-[10px] font-bold">{user.role}</span>
              </div>
              <button onClick={handleLogout} title="Logout" className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
