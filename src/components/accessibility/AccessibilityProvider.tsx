
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface AccessibilityContextType {
  announceToScreenReader: (message: string) => void;
  focusElement: (elementId: string) => void;
  skipToContent: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Zone live pour les annonces aux lecteurs d'écran
  const announceToScreenReader = (message: string) => {
    const liveRegion = document.getElementById('screen-reader-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Effacer le message après un délai pour permettre de nouvelles annonces
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  // Fonction pour focuser un élément spécifique
  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      announceToScreenReader(`Focus déplacé vers ${element.getAttribute('aria-label') || element.textContent || elementId}`);
    }
  };

  // Fonction pour aller au contenu principal
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      announceToScreenReader('Navigation vers le contenu principal');
    }
  };

  // Fonction pour basculer le contraste élevé
  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const newValue = !prev;
      announceToScreenReader(newValue ? 'Mode contraste élevé activé' : 'Mode contraste élevé désactivé');
      return newValue;
    });
  };

  // Gestion des raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + M : Aller au menu principal
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainNav = document.querySelector('[role="navigation"]') as HTMLElement;
        if (mainNav) {
          mainNav.focus();
          announceToScreenReader('Navigation vers le menu principal');
        }
      }

      // Alt + C : Aller au contenu principal
      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        skipToContent();
      }

      // Alt + H : Mode contraste élevé
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        toggleHighContrast();
      }

      // Alt + 1, 2, 3 : Tailles de police
      if (event.altKey && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault();
        const sizeMap = { '1': 'small', '2': 'medium', '3': 'large' } as const;
        const newSize = sizeMap[event.key as '1' | '2' | '3'];
        setFontSize(newSize);
        announceToScreenReader(`Taille de police changée en ${newSize === 'small' ? 'petite' : newSize === 'medium' ? 'moyenne' : 'grande'}`);
      }

      // Échap : Fermer les modales/dialogues
      if (event.key === 'Escape') {
        const openDialog = document.querySelector('[role="dialog"][data-state="open"]');
        if (openDialog) {
          const closeButton = openDialog.querySelector('[aria-label*="fermer"], [aria-label*="close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
            announceToScreenReader('Dialogue fermé');
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Appliquer les styles d'accessibilité
  useEffect(() => {
    const root = document.documentElement;
    
    // Contraste élevé
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Taille de police
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
  }, [highContrast, fontSize]);

  const value: AccessibilityContextType = {
    announceToScreenReader,
    focusElement,
    skipToContent,
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Zone live pour les annonces aux lecteurs d'écran */}
      <div
        id="screen-reader-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Zone pour les annonces urgentes */}
      <div
        id="screen-reader-alerts"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
};
