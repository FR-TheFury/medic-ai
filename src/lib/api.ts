
// API client for communicating with the Python backend
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000', // Update this to your Python API endpoint
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.detail || 'An error occurred';
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const auth = {
  login: (username: string, password: string) => 
    api.post('/token', { username, password }),
  register: (username: string, email: string, password: string) => 
    api.post('/users', { username, email, password }),
};

// Maladies endpoints
export const maladies = {
  getAll: () => api.get('/maladies/'),
  getById: (id: number) => api.get(`/maladies/${id}`),
  create: (data: { nomMaladie: string }) => api.post('/maladies/', data),
  update: (id: number, data: { nomMaladie: string }) => api.put(`/maladies/${id}`, data),
  delete: (id: number) => api.delete(`/maladies/${id}`),
};

// Pays endpoints
export const pays = {
  getAll: () => api.get('/pays/'),
  getById: (id: number) => api.get(`/pays/${id}`),
  getByNom: (nom: string) => api.get(`/pays/nom/${nom}`),
  create: (data: any) => api.post('/pays/', data),
  update: (id: number, data: any) => api.put(`/pays/${id}`, data),
  delete: (id: number) => api.delete(`/pays/${id}`),
};

// Regions endpoints
export const regions = {
  getAll: () => api.get('/regions/'),
  getById: (id: number) => api.get(`/regions/${id}`),
  getByPays: (paysId: number) => api.get(`/regions/by_pays/${paysId}`),
  create: (data: any) => api.post('/regions/', data),
  update: (id: number, data: any) => api.put(`/regions/${id}`, data),
  delete: (id: number) => api.delete(`/regions/${id}`),
};

// Releves endpoints
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

// Prediction endpoint
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
