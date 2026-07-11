'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Award, Heart, ShieldCheck, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 font-sans-lux">
      
      {/* Introduction Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 text-gold">
            <Landmark className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.25em] font-bold">Showroom Heritage</span>
          </div>

          <h1 className="font-serif-lux text-3xl sm:text-5xl font-extrabold tracking-wide text-fg-custom leading-[1.15]">
            Weaving Traditions Since Generations
          </h1>

          <p className="text-xs sm:text-sm font-light text-fg-custom/80 leading-relaxed">
            {t('about_us_desc')}
          </p>

          <p className="text-xs font-light text-fg-custom/75 leading-relaxed">
            Our brand is synonymous with quality, authenticity, and elegance. Sourced directly from weavers in Kanchipuram, Dharmavaram, Gadwal, and Venkatagiri, each saree is hand-picked to ensure it meets our rigorous standards of zari quality, drape flow, and thread count.
          </p>

          <Link href="/shop" className="inline-block gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider px-8 py-4 rounded-xl shadow hover:opacity-90 transition-opacity">
            Explore Collection
          </Link>
        </div>

        {/* Storytelling image banner */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-card-border shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
            alt="Handloom Weaving Process"
            className="w-full h-full object-cover filter brightness-90 hover:scale-102 transition-transform duration-500"
          />
        </div>
      </section>

      {/* Our Values & Core Pillars */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-serif-lux text-2xl sm:text-3xl font-bold tracking-wide">Why Choose Sri Sakthi Sarees?</h2>
          <div className="h-[1px] w-20 maroon-gradient mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Award,
              title: 'Pure Mulberry Silk',
              desc: 'We verify each silk thread for gold/silver zari validation, providing you with certified, heavy-drape silks that last as family heirlooms.'
            },
            {
              icon: Heart,
              title: 'Weaver Fair Trade',
              desc: 'By cutting out middlemen, we bring handloomed sarees directly to NTR district at fair weaver-supported pricing models.'
            },
            {
              icon: ShieldCheck,
              title: 'Nandigama Showroom trust',
              desc: 'For decades, our Raithupeta store has been a trusted shopping destination for weddings, traditional ceremonies, and local festivals.'
            }
          ].map((val, i) => {
            const Icon = val.icon;
            return (
              <div key={i} className="bg-card-custom border border-card-border p-6 rounded-2xl space-y-4 shadow-sm text-center">
                <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif-lux text-xs font-bold uppercase tracking-wider">{val.title}</h3>
                <p className="text-xs text-fg-custom/70 font-light leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weaving process details */}
      <section className="bg-[#800000]/5 p-8 sm:p-12 rounded-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="font-serif-lux text-xl sm:text-2xl font-bold tracking-wide text-fg-custom">The Craft Of Indian Handlooms</h2>
          <p className="text-xs font-light text-fg-custom/80 leading-relaxed">
            Saree weaving is not just an industry; it is a sacred art passed down from master craftsmen. A single Kanchipuram wedding saree can take anywhere from 10 to 30 days of painstaking manual labor. The interlocking of contrasting colors (Korvai technique) and the gold thread decorations (Zari weaving) require three shuttle looms and extreme coordination.
          </p>
          <p className="text-xs font-light text-fg-custom/80 leading-relaxed">
            By shopping with us, you are keeping the traditional handloom industry of Andhra Pradesh and India alive.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80" alt="Saree Weaving Detail" className="rounded-xl border border-card-border aspect-square object-cover" />
          <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80" alt="Mulberry Silks" className="rounded-xl border border-card-border aspect-square object-cover mt-4" />
        </div>
      </section>

    </div>
  );
}
