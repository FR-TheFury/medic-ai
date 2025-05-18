
import { Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Maladies from "@/pages/Maladies";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Pays from "@/pages/Pays";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Releves from "@/pages/Releves";
import Prediction from "@/pages/Prediction";
import MSPR from "@/pages/MSPR";
import Documentation from "@/pages/Documentation";

import { AuthContextProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthContextProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/maladies" element={<Maladies />} />
        <Route path="/pays" element={<Pays />} />
        <Route path="/releves" element={<Releves />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/mspr" element={<MSPR />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthContextProvider>
  );
}

export default App;
