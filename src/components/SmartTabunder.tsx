'use client';

import { useEffect } from 'react';

interface SmartTabunderProps {
  // උඹේ Adsterra Direct Link එක මෙතනට Pass කරන්න පුළුවන්
  directLink?: string;
}

export default function SmartTabunder({
  directLink = 'https://www.highrevenuegate.com/YOUR_ADSTERRA_DIRECT_LINK_HERE',
}: SmartTabunderProps) {
  useEffect(() => {
    // 24 Hours Frequency Cap Check (User ට වදයක් නොවී එක පාරක් විතරක් Open වීමට)
    const hasOpenedToday = localStorage.getItem('adsterra_tabunder_opened');
    const now = new Date().getTime();

    if (hasOpenedToday && now - parseInt(hasOpenedToday) < 24 * 60 * 60 * 1000) {
      return; // පැය 24ක් ඇතුළත රන් වී ඇත්නම් නවත්වන්න
    }

    const handleGlobalClick = (e: MouseEvent) => {
      try {
        // වෙනම Tab එකක් පසුපසින් Open කිරීමේ Logic එක
        const popTab = window.open(directLink, '_blank');

        if (popTab) {
          // Ad Tab එක පසුපසට (Blur) යවා Main Site එක උඩින් (Focus) තැබීම
          popTab.blur();
          window.focus();

          // Frequency Cap එක LocalStorage හි Save කිරීම
          localStorage.setItem('adsterra_tabunder_opened', new Date().getTime().toString());

          // එක පාරක් Open වුණු පසු Event Listener එක අයින් කිරීම
          window.removeEventListener('click', handleGlobalClick);
        }
      } catch (err) {
        console.error('Tabunder block check:', err);
      }
    };

    // User සයිට් එකේ කොතැන ක්ලික් කළත් Trigger වීම
    window.addEventListener('click', handleGlobalClick, { once: true });

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [directLink]);

  return null; // UI එකට කිසිදු වෙනසක් නොපෙනේ (100% Background Process)
}