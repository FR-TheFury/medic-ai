
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection automatique vers la page de login
    navigate('/login');
  }, [navigate]);

  return null; // Pas besoin d'afficher quoi que ce soit car on redirige
};

export default Index;
