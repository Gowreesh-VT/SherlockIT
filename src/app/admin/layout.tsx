'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/worlds', label: 'Worlds' },
  { href: '/admin/final-answer', label: 'Final Answer' },
  { href: '/admin/progress', label: 'Progress' },
  { href: '/admin/submissions', label: 'Submissions' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-50 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SherlockIT</h1>
              <p className="text-slate-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 text-sm font-bold">
              A
            </div>
            <div>
              <p className="text-slate-200 text-sm font-medium">Admin</p>
              <p className="text-slate-500 text-xs">Organizer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div className="w-64 flex-shrink-0" />

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-slate-950">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
