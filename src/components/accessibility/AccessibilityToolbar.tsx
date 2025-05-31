
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAccessibility } from './AccessibilityProvider';
import { 
  Eye, 
  EyeOff, 
  Type, 
  Keyboard, 
  Volume2,
  Settings,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AccessibilityToolbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  const { 
    highContrast, 
    toggleHighContrast, 
    fontSize, 
    setFontSize, 
    announceToScreenReader 
  } = useAccessibility();

  const keyboardShortcuts = [
    { key: 'Alt + M', description: 'Aller au menu principal' },
    { key: 'Alt + C', description: 'Aller au contenu principal' },
    { key: 'Alt + H', description: 'Basculer le contraste élevé' },
    { key: 'Alt + 1', description: 'Petite taille de police' },
    { key: 'Alt + 2', description: 'Taille de police normale' },
    { key: 'Alt + 3', description: 'Grande taille de police' },
    { key: 'Tab', description: 'Naviguer vers l\'élément suivant' },
    { key: 'Shift + Tab', description: 'Naviguer vers l\'élément précédent' },
    { key: 'Entrée / Espace', description: 'Activer l\'élément focalisé' },
    { key: 'Échap', description: 'Fermer les dialogues' },
  ];

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => {
            setIsExpanded(true);
            announceToScreenReader('Barre d\'outils d\'accessibilité ouverte');
          }}
          className="rounded-full p-3 shadow-lg"
          aria-label="Ouvrir les options d'accessibilité"
          title="Options d'accessibilité (Alt + A)"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-xl border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Accessibilité</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setShowKeyboardHelp(false);
                announceToScreenReader('Barre d\'outils d\'accessibilité fermée');
              }}
              aria-label="Fermer les options d'accessibilité"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Contraste élevé */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                {highContrast ? (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                )}
                Contraste élevé
              </label>
              <Button
                variant={highContrast ? "default" : "outline"}
                size="sm"
                onClick={toggleHighContrast}
                aria-pressed={highContrast}
                aria-label={`${highContrast ? 'Désactiver' : 'Activer'} le contraste élevé`}
              >
                {highContrast ? 'Activé' : 'Désactivé'}
              </Button>
            </div>

            {/* Taille de police */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" aria-hidden="true" />
                Taille de police
              </label>
              <div className="flex gap-1">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFontSize(size);
                      announceToScreenReader(`Taille de police changée en ${size === 'small' ? 'petite' : size === 'medium' ? 'moyenne' : 'grande'}`);
                    }}
                    aria-pressed={fontSize === size}
                    aria-label={`Taille de police ${size === 'small' ? 'petite' : size === 'medium' ? 'moyenne' : 'grande'}`}
                    className={cn("flex-1", {
                      'text-xs': size === 'small',
                      'text-sm': size === 'medium',
                      'text-base': size === 'large'
                    })}
                  >
                    {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Aide clavier */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  setShowKeyboardHelp(!showKeyboardHelp);
                  announceToScreenReader(showKeyboardHelp ? 'Aide clavier fermée' : 'Aide clavier ouverte');
                }}
                aria-expanded={showKeyboardHelp}
                aria-controls="keyboard-help"
              >
                <span className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" aria-hidden="true" />
                  Raccourcis clavier
                </span>
                {showKeyboardHelp ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
              
              {showKeyboardHelp && (
                <div id="keyboard-help" className="bg-muted p-3 rounded-md text-xs space-y-1 max-h-48 overflow-y-auto">
                  <h4 className="font-medium mb-2">Raccourcis disponibles :</h4>
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-start gap-2">
                      <kbd className="bg-background px-1.5 py-0.5 rounded text-xs font-mono whitespace-nowrap">
                        {shortcut.key}
                      </kbd>
                      <span className="text-right">{shortcut.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Information pour lecteurs d'écran */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="h-3 w-3" aria-hidden="true" />
                <span>Lecteurs d'écran supportés</span>
              </div>
              <p>
                Cette application est optimisée pour NVDA, JAWS, et VoiceOver.
                Utilisez les raccourcis clavier pour une navigation rapide.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
