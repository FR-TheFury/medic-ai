
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileSpreadsheet,
  Globe,
  Home,
  LineChart,
  Settings,
  User,
  FileText
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMobileWithSidebar } from "@/hooks/use-mobile";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isMobile, sidebarExpanded, toggleSidebar } = useMobileWithSidebar();
  const location = useLocation();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight", !sidebarExpanded && "text-center")}>
            {sidebarExpanded ? "Navigation" : ""}
          </h2>
          <div className="space-y-1">
            <Link to="/">
              <Button
                variant={isActiveRoute("/") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <Home className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Accueil"}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant={isActiveRoute("/dashboard") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Dashboard"}
              </Button>
            </Link>
            <Link to="/maladies">
              <Button
                variant={isActiveRoute("/maladies") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <LineChart className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Maladies"}
              </Button>
            </Link>
            <Link to="/pays">
              <Button
                variant={isActiveRoute("/pays") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <Globe className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Pays"}
              </Button>
            </Link>
            <Link to="/releves">
              <Button
                variant={isActiveRoute("/releves") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Relevés"}
              </Button>
            </Link>
            <Link to="/prediction">
              <Button
                variant={isActiveRoute("/prediction") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <LineChart className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Prédiction"}
              </Button>
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight", !sidebarExpanded && "text-center")}>
            {sidebarExpanded ? "Mon espace" : ""}
          </h2>
          <div className="space-y-1">
            <Link to="/profile">
              <Button
                variant={isActiveRoute("/profile") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <User className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Profil"}
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant={isActiveRoute("/settings") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <Settings className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Paramètres"}
              </Button>
            </Link>
            <Link to="/documentation">
              <Button
                variant={isActiveRoute("/documentation") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => isMobile && toggleSidebar()}
              >
                <FileText className="mr-2 h-4 w-4" />
                {sidebarExpanded && "Documentation"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
