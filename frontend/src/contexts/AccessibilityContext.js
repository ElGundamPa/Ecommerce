import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const [largeFonts, setLargeFonts] = useState(() => localStorage.getItem('a11y_largeFonts') === '1');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('a11y_highContrast') === '1');
  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem('a11y_reducedMotion');
    if (saved != null) return saved === '1';
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('a11y-large-fonts', largeFonts);
    root.classList.toggle('a11y-high-contrast', highContrast);
    root.classList.toggle('a11y-reduced-motion', reducedMotion);
  }, [largeFonts, highContrast, reducedMotion]);

  useEffect(() => { localStorage.setItem('a11y_largeFonts', largeFonts ? '1' : '0'); }, [largeFonts]);
  useEffect(() => { localStorage.setItem('a11y_highContrast', highContrast ? '1' : '0'); }, [highContrast]);
  useEffect(() => { localStorage.setItem('a11y_reducedMotion', reducedMotion ? '1' : '0'); }, [reducedMotion]);

  const value = useMemo(() => ({
    largeFonts,
    highContrast,
    reducedMotion,
    toggleLargeFonts: () => setLargeFonts(v => !v),
    toggleHighContrast: () => setHighContrast(v => !v),
    toggleReducedMotion: () => setReducedMotion(v => !v),
  }), [largeFonts, highContrast, reducedMotion]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility debe usarse dentro de AccessibilityProvider');
  return ctx;
};






