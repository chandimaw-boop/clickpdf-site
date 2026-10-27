'use client';

import { useEffect } from 'react';

interface SmartTabunderProps {
  directLink?: string;
}

export default function SmartTabunder({
  directLink = 'https://www.highrevenuegate.com/YOUR_ACTUAL_ADSTERRA_LINK',
}: SmartTabunderProps) {
  useEffect(() => {
    // පැය 24කට එක පාරක් විතරක් Open වීම තහවුරු කිරීමට Frequency Cap Check එක
    const hasOpenedToday = localStorage.getItem('adsterra_tabunder_opened');
    const now = new Date().getTime();

    if (hasOpenedToday && now - parseInt(hasOpenedToday) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handleGlobalClick = (e: MouseEvent) => {
      try {
        // Real User Click එකේදීම Direct Link එක New Tab එකක Open කිරීම
        const popTab = window.open(directLink, '_blank');

        if (popTab) {
          // Ad Tab එක පසුපසට යවා Main Site එක Screen එකේ උඩින්ම තැබීම
          popTab.blur();
          window.focus();

          // Frequency Cap එක Save කිරීම
          localStorage.setItem('adsterra_tabunder_opened', new Date().getTime().toString());

          // එක පාරක් Open වුණු පසු Event Listener එක අයින් කිරීම
          window.removeEventListener('click', handleGlobalClick);
        }
      } catch (err) {
        console.error('Tabunder error:', err);
      }
    };

    // User ගේ ප්‍රථම Click එකේදීම Trigger වීමට Event Listener එක එකතු කිරීම
    window.addEventListener('click', handleGlobalClick, { once: true });

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [directLink]);

  return null;
}