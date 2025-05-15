
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Log de démarrage de l'application avec des informations clairement visibles
console.log('==============================================');
console.log('Application de suivi épidémiologique en démarrage');
console.log('Tentative de connexion à l\'API FastAPI à http://127.0.0.1:8000');
console.log('==============================================');

createRoot(document.getElementById("root")!).render(<App />);
