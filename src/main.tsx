
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log to confirm application startup
console.log('Application starting, connecting to API at http://127.0.0.1:8000');

createRoot(document.getElementById("root")!).render(<App />);
