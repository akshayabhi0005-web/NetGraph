import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesGrid } from '../components/landing/FeaturesGrid';
import { HowItWorks } from '../components/landing/HowItWorks';
import { AboutSection } from '../components/landing/AboutSection';
import { PublicCTA } from '../components/landing/PublicCTA';
import { Footer } from '../components/common/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <HowItWorks />
        <AboutSection />
        <PublicCTA />
      </main>
      <Footer />
    </div>
  );
};
