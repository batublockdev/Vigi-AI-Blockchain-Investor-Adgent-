'use client';

import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { CompetitorsSection } from '@/components/landing/CompetitorsSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { CTAFinal } from '@/components/landing/CTAFinal';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingNav />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <CompetitorsSection />
        <SecuritySection />
        <CTAFinal />
      </main>
    </div>
  );
}
