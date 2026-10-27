'use client';

import { useEffect } from 'react';

interface SmartTabunderProps {
  directLink?: string;
}

export default function SmartTabunder({
  directLink = 'https://araplhn.org/4/fa15e2c728c19c6f9a55268c4d552e69',
}: SmartTabunderProps) {
  useEffect(() => {
    // 24 Hours Frequency Cap Check (User ට වදයක් නොවී එක පාරක් විතරක් Open වීමට)
    const hasOpenedToday = localStorage.getItem('adsterra_tabunder_opened');
    const now = new Date().getTime();

    if (hasOpenedToday && now - parseInt(hasOpenedToday) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handleGlobalClick = () => {
      try {
        // Direct Link එක New Tab එකකින් Open කිරීම
        const popTab = window.open(directLink, '_blank');

        if (popTab) {
          // Ad Tab එක පසුපසට యවා Main Site එක Screen එකේ උඩින්ම තැබීම
          popTab.blur();
          window.focus();

          // Frequency Cap Timestamp එක Save කිරීම
          localStorage.setItem('adsterra_tabunder_opened', new Date().getTime().toString());

          // එක පාරක් Open වුණු පසු Listener එක අයින් කිරීම
          window.removeEventListener('click', handleGlobalClick);
        }
      } catch (err) {
        console.error('Tabunder error:', err);
      }
    };

    window.addEventListener('click', handleGlobalClick, { once: true });

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [directLink]);

  return null;
}