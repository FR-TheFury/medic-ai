
// API client pour communiquer avec le backend Python
import axios from 'axios';
import { toast } from 'sonner';

// Création d'une instance axios avec l'URL de base
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000, // Augmentation du timeout pour éviter les erreurs prématurées
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    // Affichage plus détaillé des informations d'erreur
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    const message = error.response?.data?.detail || 'Une erreur est survenue';
    toast.error("Erreur API: " + message);
    return Promise.reject(error);
  }
);

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
