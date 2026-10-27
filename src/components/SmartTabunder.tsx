'use client';

import { useEffect } from 'react';

interface SmartTabunderProps {
  directLink?: string;
}

export default function SmartTabunder({
  directLink = 'https://www.highrevenuegate.com/YOUR_ACTUAL_ADSTERRA_LINK',
}: SmartTabunderProps) {
  useEffect(() => {
    // පැය 24කට එක පාරක් විතරක් වැටෙන්න Frequency Cap එක
    const hasOpenedToday = localStorage.getItem('adsterra_tabunder_opened');
    const now = new Date().getTime();

    if (hasOpenedToday && now - parseInt(hasOpenedToday) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handleGlobalClick = (e: MouseEvent) => {
      // 1. Invisible Anchor Element එකක් හදාගැනීම
      const a = document.createElement('a');
      a.href = directLink;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      // 2. Click Event එක Trigger කර ලින්ක් එක Open කිරීම
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });

      a.dispatchEvent(clickEvent);

      // 3. Frequency Cap එක Save කිරීම
      localStorage.setItem('adsterra_tabunder_opened', new Date().getTime().toString());

      // එක පාරක් Open වුණු පසු Event එක Cancel කිරීම
      window.removeEventListener('click', handleGlobalClick);
    };

    window.addEventListener('click', handleGlobalClick, { once: true });

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [directLink]);

  return null;
}