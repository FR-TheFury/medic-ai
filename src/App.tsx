
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { checkApiAvailability } from "@/lib/api";
import { useEffect } from "react";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Maladies from "./pages/Maladies";
import Prediction from "./pages/Prediction";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MSPR from "./pages/MSPR";
import Pays from "./pages/Pays";
import Releves from "./pages/Releves";

// Configuration du client React Query avec de meilleurs paramètres par défaut
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Limite les tentatives de requête
      staleTime: 30000, // 30 secondes avant de considérer les données comme obsolètes
      refetchOnWindowFocus: false, // Désactive le rechargement automatique lors du focus
      refetchOnMount: true, // Recharge les données au montage du composant
      // Gestion globale des erreurs de requêtes
      onError: (error: any) => {
        console.error("Erreur de requête:", error);
      }
    },
    mutations: {
      // Gestion des erreurs pour les mutations
      onError: (error) => {
        console.error("Erreur de mutation:", error);
      }
    }
  }
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Vérification de l'API au chargement du composant
  useEffect(() => {
    checkApiAvailability();
  }, []);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/maladies" element={
        <ProtectedRoute>
          <Maladies />
        </ProtectedRoute>
      } />
      
      <Route path="/prediction" element={
        <ProtectedRoute>
          <Prediction />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      <Route path="/mspr" element={
        <ProtectedRoute>
          <MSPR />
        </ProtectedRoute>
      } />
      
      <Route path="/pays" element={
        <ProtectedRoute>
          <Pays />
        </ProtectedRoute>
      } />
      
      <Route path="/releves" element={
        <ProtectedRoute>
          <Releves />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Vérification initiale de la disponibilité de l'API
  useEffect(() => {
    checkApiAvailability();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
