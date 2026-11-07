'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#problema', label: 'EL PROBLEMA' },
    { href: '#solucion', label: 'CÓMO FUNCIONA' },
    { href: '#competidores', label: 'VS COMPETIDORES' },
    { href: '#seguridad', label: 'SEGURIDAD' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#F5F5F4]/95 backdrop-blur-md border-b border-stone-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo — isotipo geométrico + texto */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-md bg-[#0C1424]" />
              <div className="absolute inset-[3px] rounded-sm border border-[#2540EB]/40" />
              <div className="absolute inset-[6px] rounded-ss border border-[#2540EB]/20" />
              <span className="relative text-white text-[10px] font-black tracking-tight">A</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-[#0C1424]" style={{ fontFamily: 'var(--font-inter)' }}>
              Vigi Protocol
            </span>
          </Link>

          {/* Desktop nav — mayúsculas, espaciado uniforme */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] font-medium uppercase tracking-wider text-ink-muted hover:text-[#0C1424] transition-colors duration-300"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA derecho — punto azul + texto */}
          <div className="hidden md:flex items-center">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#0C1424] hover:text-[#2540EB] transition-colors duration-300"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB] group-hover:scale-125 transition-transform duration-300" />
              <span>Ver Demo Live</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-[#0C1424]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F5F5F4] border-b border-stone-200 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-xs font-medium uppercase tracking-wider text-ink-muted hover:text-[#0C1424]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2540EB]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#2540EB]" />
            <span>Ver Demo Live</span>
          </Link>
        </div>
      )}
    </header>
  );
};
