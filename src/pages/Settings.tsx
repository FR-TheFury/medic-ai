
import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Check, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    apiEndpoint: 'http://127.0.0.1:8000',
    theme: 'light',
    language: 'fr',
    notifications: true,
    emailNotifications: false,
  });
  
  // AI model settings
  const [aiSettings, setAiSettings] = useState({
    modelPath: '/path/to/model',
    predictionThreshold: '0.75',
    useGPU: true,
    cachePredictions: true,
    batchSize: '32',
  });
  
  const handleGeneralChange = (key: string, value: string | boolean) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleAIChange = (key: string, value: string | boolean) => {
    setAiSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setSuccess(true);
      toast({
        title: "Paramètres enregistrés",
        description: "Vos paramètres ont été enregistrés avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer les paramètres.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground mt-1">
            Configurez l'application selon vos besoins
          </p>
        </div>
        
        <Tabs 
          defaultValue="general" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="ai">Modèle d'IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configurez les paramètres généraux de l'application
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveSettings}>
                <CardContent className="space-y-6">
                  {success && (
                    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                      <Check className="h-4 w-4" />
                      <AlertDescription>Vos paramètres ont été enregistrés avec succès.</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiEndpoint">Point d'accès de l'API</Label>
                    <Input
                      id="apiEndpoint"
                      value={generalSettings.apiEndpoint}
                      onChange={(e) => handleGeneralChange('apiEndpoint', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      L'URL de base de l'API Python (ex: http://127.0.0.1:8000)
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Thème</Label>
                    <Select 
                      value={generalSettings.theme} 
                      onValueChange={(value) => handleGeneralChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un thème" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="system">Système</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select 
                      value={generalSettings.language} 
                      onValueChange={(value) => handleGeneralChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">Anglais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notifications dans l'application</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des notifications dans l'application
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={generalSettings.notifications}
                        onCheckedChange={(checked) => handleGeneralChange('notifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des notifications par email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={generalSettings.emailNotifications}
                        onCheckedChange={(checked) => handleGeneralChange('emailNotifications', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        "Enregistrer les paramètres"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du modèle d'IA</CardTitle>
                <CardDescription>
                  Configurez le modèle d'intelligence artificielle pour les prédictions
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveSettings}>
                <CardContent className="space-y-6">
                  {success && (
                    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                      <Check className="h-4 w-4" />
                      <AlertDescription>Vos paramètres ont été enregistrés avec succès.</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="modelPath">Chemin du modèle</Label>
                    <Input
                      id="modelPath"
                      value={aiSettings.modelPath}
                      onChange={(e) => handleAIChange('modelPath', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Le chemin vers le dossier contenant les modèles d'IA
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="predictionThreshold">Seuil de prédiction</Label>
                    <Input
                      id="predictionThreshold"
                      value={aiSettings.predictionThreshold}
                      onChange={(e) => handleAIChange('predictionThreshold', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Le seuil minimal de confiance pour les prédictions (entre 0 et 1)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Taille du lot</Label>
                    <Input
                      id="batchSize"
                      value={aiSettings.batchSize}
                      onChange={(e) => handleAIChange('batchSize', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Le nombre d'échantillons à traiter en une fois
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Options avancées</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="useGPU">Utiliser le GPU</Label>
                        <p className="text-sm text-muted-foreground">
                          Utiliser l'accélération GPU pour les prédictions
                        </p>
                      </div>
                      <Switch
                        id="useGPU"
                        checked={aiSettings.useGPU}
                        onCheckedChange={(checked) => handleAIChange('useGPU', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="cachePredictions">Mettre en cache les prédictions</Label>
                        <p className="text-sm text-muted-foreground">
                          Stocker les résultats des prédictions précédentes
                        </p>
                      </div>
                      <Switch
                        id="cachePredictions"
                        checked={aiSettings.cachePredictions}
                        onCheckedChange={(checked) => handleAIChange('cachePredictions', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        "Enregistrer les paramètres"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
