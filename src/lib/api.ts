
// API client pour communiquer avec le backend Python
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

// Création d'une instance axios avec l'URL de base
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000, // Augmentation du timeout pour éviter les erreurs prématurées
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuration pour gérer les problèmes CORS
  withCredentials: false, // Désactiver l'envoi des cookies pour éviter des problèmes CORS
});

// Flag pour suivre l'état de la connexion API
let isApiAvailable = true;
let corsError = false;

// Fonction pour vérifier la disponibilité de l'API
export const checkApiAvailability = async () => {
  try {
    // Utiliser la route /maladies/ au lieu de la racine, qui semble ne pas être implémentée
    await api.get('/maladies/');
    if (!isApiAvailable) {
      toast.success("Connexion à l'API rétablie");
      isApiAvailable = true;
    }
    corsError = false;
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'API:', error);
    
    // Vérifier si c'est une erreur CORS
    if (error.message && (error.message.includes('Network Error') || error.message.includes('CORS'))) {
      corsError = true;
      console.error('Erreur CORS détectée:', error);
      toast.error("Erreur CORS: Vérifiez la configuration du serveur");
    }
    
    if (isApiAvailable) {
      toast.error("L'API n'est pas disponible. Utilisation des données de démonstration.");
      isApiAvailable = false;
    }
    return false;
  }
};

// Vérification périodique de la disponibilité de l'API (toutes les 30 secondes)
setInterval(checkApiAvailability, 30000);

// Ajout d'un intercepteur de requête pour inclure le token d'authentification
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    // Affichage détaillé des informations de requête
    if (config.data) {
      console.log('Request data:', config.data);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajout d'un en-tête pour permettre CORS
    config.headers['Access-Control-Allow-Origin'] = '*';
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Ajout d'un intercepteur de réponse pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.url}`);
    console.log('Response data:', response.data);
    // Réinitialiser les flags d'erreur sur réponse réussie
    isApiAvailable = true;
    corsError = false;
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    // Affichage plus détaillé des informations d'erreur
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // Même si on reçoit une erreur 404, on ne considère pas l'API comme indisponible
      // si on a reçu une réponse du serveur (sauf pour la vérification de disponibilité)
      if (error.config.url !== '/maladies/' && error.response.status === 404) {
        return Promise.reject(error);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      // Vérifier si c'est une erreur CORS
      if (error.message && (error.message.includes('Network Error') || error.message.includes('CORS'))) {
        corsError = true;
        console.error('Erreur CORS détectée dans la réponse');
        toast.error("Erreur CORS: Vérifiez la configuration du serveur FastAPI");
      }
    } else {
      console.error('Error message:', error.message);
    }
    
    // Vérifier si l'erreur est liée à un problème de connexion
    if (error.code === 'ECONNABORTED' || !error.response) {
      toast.error("Impossible de se connecter à l'API. Vérifiez que le serveur est en cours d'exécution.");
      isApiAvailable = false;
    } else {
      const message = error.response?.data?.detail || 'Une erreur est survenue';
      toast.error("Erreur API: " + message);
    }
    
    return Promise.reject(error);
  }
);

// Vérifier si l'API est en mode CORS error
export const isCorsError = () => corsError;

// Vérifier si l'API est disponible (pour les composants)
export const isApiActive = () => isApiAvailable;

// Endpoints d'authentification
export const auth = {
  login: (username: string, password: string) => 
    api.post('/token', { username, password }),
  register: (username: string, email: string, password: string) => 
    api.post('/users', { username, email, password }),
};

// Endpoints des maladies
export const maladies = {
  getAll: () => api.get('/maladies/'),
  getById: (id: number) => api.get(`/maladies/${id}`),
  create: (data: { nomMaladie: string }) => api.post('/maladies/', data),
  update: (id: number, data: { nomMaladie: string }) => api.put(`/maladies/${id}`, data),
  delete: (id: number) => api.delete(`/maladies/${id}`),
};

// Endpoints des pays
export const pays = {
  getAll: () => api.get('/pays/'),
  getById: (id: number) => api.get(`/pays/${id}`),
  getByNom: (nom: string) => api.get(`/pays/nom/${nom}`),
  create: (data: any) => api.post('/pays/', data),
  update: (id: number, data: any) => api.put(`/pays/${id}`, data),
  delete: (id: number) => api.delete(`/pays/${id}`),
};

// Endpoints des régions
export const regions = {
  getAll: () => api.get('/regions/'),
  getById: (id: number) => api.get(`/regions/${id}`),
  getByPays: (paysId: number) => api.get(`/regions/by_pays/${paysId}`),
  create: (data: any) => api.post('/regions/', data),
  update: (id: number, data: any) => api.put(`/regions/${id}`, data),
  delete: (id: number) => api.delete(`/regions/${id}`),
};

// Endpoints des relevés
export const releves = {
  getAll: () => api.get('/releves/'),
  getById: (id: number) => api.get(`/releves/${id}`),
  getByDateRange: (startDate: string, endDate: string) => 
    api.get(`/releves/range/?start_date=${startDate}&end_date=${endDate}`),
  getByRegionAndDateRange: (regionId: number, startDate: string, endDate: string) => 
    api.get(`/releves/region/${regionId}/range/?start_date=${startDate}&end_date=${endDate}`),
  create: (data: any) => api.post('/releves/', data),
  update: (id: number, data: any) => api.put(`/releves/${id}`, data),
  delete: (id: number) => api.delete(`/releves/${id}`),
};

// Endpoint de prédiction
export const predictions = {
  predictMortality: (data: {
    nbNouveauCas: number;
    nbDeces: number;
    densitePopulation: number;
    PIB: number;
    populationTotale: number;
    nbVaccineTotalement: number;
    nbHospiSoinsIntensif: number;
    pays: string;
  }) => api.post('/prediction/mortalite/', data),
};

export default api;
