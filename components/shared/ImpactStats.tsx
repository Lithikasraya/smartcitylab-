'use client';

/**
 * ImpactStats — horizontal 4-stat strip with count-up on scroll.
 * No card boxes — just large numbers, thin vertical dividers, gray labels.
 * Stripe / Vercel / Linear aesthetic.
 */

import React from 'react';
import { CountUp } from './CountUp';
import { FadeUp } from './Motion';

const STATS = [
  { value: 35,  suffix: '+',  label: 'Active Projects' },
  { value: 120, suffix: '+',  label: 'Student Members' },
  { value: 4,   suffix: '',   label: 'Patents Filed'   },
  { value: 12,  suffix: '',   label: 'Live Deployments' },
];

export default function ImpactStats() {
  return (
    <FadeUp>
      <section className="border-y border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E5E7EB]">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="py-10 px-8 text-left first:pl-0 last:pr-0"
              >
                <div className="text-[42px] sm:text-[52px] font-black text-[#0A0A0A] tracking-tight leading-none tabular-nums">
                  <CountUp end={stat.value} suffix={stat.suffix} duration={1600} />
                </div>
                <p className="text-[13px] text-[#6B7280] font-medium mt-2 tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeUp>
  );
}
