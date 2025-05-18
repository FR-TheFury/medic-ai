
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      const isMobileScreen = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(isMobileScreen);
      // Auto collapse sidebar on mobile
      if (isMobileScreen) {
        setSidebarExpanded(false);
      }
    };
    
    mql.addEventListener("change", onChange);
    // Initial check
    onChange();
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  return {
    isMobile,
    sidebarExpanded,
    toggleSidebar
  };
}
