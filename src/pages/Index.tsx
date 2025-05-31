
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Si l'utilisateur est connecté, aller au dashboard
    // Sinon, rester sur la page d'accueil
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate, isAuthenticated]);

  // Si pas connecté, afficher la page d'accueil
  if (!isAuthenticated) {
    navigate('/home');
    return null;
  }

  return null;
};

export default Index;
