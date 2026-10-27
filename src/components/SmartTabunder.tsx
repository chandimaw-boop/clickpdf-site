'use client';

import { useEffect } from 'react';

interface SmartTabunderProps {
  directLink?: string;
}

export default function SmartTabunder({
  directLink = 'https://www.highrevenuegate.com/YOUR_ACTUAL_ADSTERRA_LINK',
}: SmartTabunderProps) {
  useEffect(() => {
    // 24 Hours Frequency Cap Check
    const hasOpenedToday = localStorage.getItem('adsterra_tabunder_opened');
    const now = new Date().getTime();

    if (hasOpenedToday && now - parseInt(hasOpenedToday) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handleGlobalClick = (e: MouseEvent) => {
      try {
        const currentUrl = window.location.href;

        // 1. Ad Tab එක Open කිරීම
        const adTab = window.open(directLink, '_blank');

        // 2. Main Site එක ඊළඟ තත්පරයේම Re-focus කර උඩට ගැනීම
        if (adTab) {
          window.open(currentUrl, '_self');

          // Frequency Cap එක Save කිරීම
          localStorage.setItem('adsterra_tabunder_opened', new Date().getTime().toString());

          // Event Listener එක අයින් කිරීම
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