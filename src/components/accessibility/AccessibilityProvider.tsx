
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
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Zone live pour les annonces aux lecteurs d'écran
  const announceToScreenReader = (message: string) => {
    const liveRegion = document.getElementById('screen-reader-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Effacer le message après un délai pour permettre de nouvelles annonces
      setTimeout(() => {
        if (liveRegion.textContent === message) {
          liveRegion.textContent = '';
        }
      }, 1000);
    }
    
    // Log pour debug
    console.log('Screen reader announcement:', message);
  };

  // Fonction pour faire lire du texte (Web Speech API)
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Arrêter toute lecture en cours
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        announceToScreenReader('Lecture audio démarrée');
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        announceToScreenReader('Lecture audio terminée');
      };
      
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Erreur de lecture audio:', event.error);
        announceToScreenReader('Erreur lors de la lecture audio');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      announceToScreenReader('La lecture audio n\'est pas supportée par ce navigateur');
      toast.error('La lecture audio n\'est pas supportée par ce navigateur');
    }
  };

  // Fonction pour arrêter la lecture
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      announceToScreenReader('Lecture audio arrêtée');
    }
  };

  // Fonction pour focuser un élément spécifique
  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      const elementLabel = element.getAttribute('aria-label') || 
                          element.getAttribute('title') || 
                          element.textContent?.trim() || 
                          elementId;
      announceToScreenReader(`Focus déplacé vers ${elementLabel}`);
    } else {
      console.warn(`Element with id "${elementId}" not found`);
    }
  };

  // Fonction pour aller au contenu principal
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content') || 
                       document.querySelector('main') || 
                       document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announceToScreenReader('Navigation vers le contenu principal');
    } else {
      console.warn('Main content element not found');
      announceToScreenReader('Contenu principal non trouvé');
    }
  };

  // Fonction pour basculer le contraste élevé
  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const newValue = !prev;
      const message = newValue ? 'Mode contraste élevé activé' : 'Mode contraste élevé désactivé';
      announceToScreenReader(message);
      toast.success(message);
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

      // Alt + A : Ouvrir les options d'accessibilité
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        const accessibilityButton = document.querySelector('[aria-label*="accessibilité"]') as HTMLElement;
        if (accessibilityButton) {
          accessibilityButton.click();
          announceToScreenReader('Options d\'accessibilité ouvertes');
        }
      }

      // Alt + 1, 2, 3 : Tailles de police
      if (event.altKey && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault();
        const sizeMap = { '1': 'small', '2': 'medium', '3': 'large' } as const;
        const newSize = sizeMap[event.key as '1' | '2' | '3'];
        setFontSize(newSize);
        const sizeLabel = newSize === 'small' ? 'petite' : newSize === 'medium' ? 'moyenne' : 'grande';
        const message = `Taille de police changée en ${sizeLabel}`;
        announceToScreenReader(message);
        toast.success(message);
      }

      // Alt + S : Arrêter la lecture audio
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        stopSpeaking();
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
        // Arrêter aussi la lecture audio si en cours
        if (isSpeaking) {
          stopSpeaking();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking]);

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

  // Ajouter des attributs d'accessibilité au body
  useEffect(() => {
    document.body.setAttribute('data-font-size', fontSize);
    document.body.setAttribute('data-high-contrast', highContrast.toString());
  }, [fontSize, highContrast]);

  const value: AccessibilityContextType = {
    announceToScreenReader,
    focusElement,
    skipToContent,
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    speakText,
    stopSpeaking,
    isSpeaking,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={(e) => e.target.style.top = '6px'}
        onBlur={(e) => e.target.style.top = '-40px'}
      >
        Aller au contenu principal
      </a>
      {children}
      {/* Zone live pour les annonces aux lecteurs d'écran */}
      <div
        id="screen-reader-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      
      {/* Zone pour les annonces urgentes */}
      <div
        id="screen-reader-alerts"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </AccessibilityContext.Provider>
  );
};
