
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  Activity, 
  Stethoscope, 
  Globe, 
  FileBarChart, 
  TrendingUp,
  BookOpen,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { useAuth } from "@/contexts/AuthContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Accueil", href: "/home", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Maladies", href: "/maladies", icon: Stethoscope },
  { name: "Pays", href: "/pays", icon: Globe },
  { name: "Relevés", href: "/releves", icon: FileBarChart },
  { name: "Prédiction", href: "/prediction", icon: TrendingUp },
  { name: "Documentation", href: "/documentation", icon: BookOpen },
  { name: "MSPR", href: "/mspr", icon: FileText },
];

const userNavigation = [
  { name: "Profil", href: "/profile", icon: User },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCurrentPage = (href: string) => {
    if (href === "/home") {
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40" role="banner">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
                <Link 
                  to="/home" 
                  className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                  aria-label="PandemicTracker - Retour à l'accueil"
                >
                  <Activity className="h-6 w-6" aria-hidden="true" />
                  <span>PandemicTracker</span>
                </Link>
              </div>

              {/* Navigation desktop */}
              <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Navigation principale">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = isCurrentPage(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        isCurrent
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      aria-current={isCurrent ? "page" : undefined}
                      title={`Aller à ${item.name}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User menu */}
              <div className="flex items-center gap-2">
                {userNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.name}
                      variant="ghost"
                      size="sm"
                      asChild
                      className="hidden sm:flex focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <Link 
                        to={item.href}
                        aria-label={item.name}
                        title={item.name}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  );
                })}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={handleLogout}
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Navigation mobile */}
            {mobileMenuOpen && (
              <nav 
                id="mobile-navigation"
                className="md:hidden border-t py-4"
                role="navigation" 
                aria-label="Navigation mobile"
              >
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = isCurrentPage(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          isCurrent
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isCurrent ? "page" : undefined}
                        title={`Aller à ${item.name}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {item.name}
                      </Link>
                    );
                  })}
                  
                  <div className="border-t pt-4 mt-4">
                    {userNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          onClick={() => setMobileMenuOpen(false)}
                          title={item.name}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {item.name}
                        </Link>
                      );
                    })}
                    
                    <button 
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={handleLogout}
                      title="Se déconnecter"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </nav>
            )}
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="container mx-auto px-4 py-6" role="main" tabIndex={-1}>
          {children}
        </main>

        {/* Barre d'outils d'accessibilité */}
        <AccessibilityToolbar />
      </div>
    </AccessibilityProvider>
  );
}
