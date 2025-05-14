import React, { useEffect } from 'react'; // Added useEffect
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiBriefcase, FiPlusSquare, FiBookmark, FiSearch, FiSun, FiMoon } from 'react-icons/fi'; // Added FiSun, FiMoon
import { type IconBaseProps } from 'react-icons';
import useThemeStore, { applyThemeToDocument } from '../../stores/themeStore'; // Import theme store
import Button from '../ui/Button'; // Assuming you have a Button component

const MainLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore(); // Use theme store

  // Effect to apply theme and listen for system changes
  useEffect(() => {
    applyThemeToDocument(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (useThemeStore.getState().theme === 'system') {
        applyThemeToDocument('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const effectiveTheme = getEffectiveTheme();
  
  // Function to check if a link is active
  const isActive = (path: string) => {
    // Exact match for home page
    if (path === '/') {
      return location.pathname === path;
    }
    
    // Special case for /jobs/add to prevent highlighting /jobs
    if (path === '/jobs' && (location.pathname === '/jobs/add' || location.pathname.startsWith('/jobs/add/'))) {
      return false;
    }
    
    // Special case for /jobs/:id/edit to prevent highlighting /jobs
    if (path === '/jobs' && location.pathname.includes('/edit')) {
      return false;
    }
    
    // For other paths, check if current path starts with the given path
    // But only if we're at the path boundary (to prevent partial matches)
    return location.pathname === path || 
           (location.pathname.startsWith(path) && 
            (location.pathname.length === path.length || location.pathname[path.length] === '/'));
  };
  
  // Navigation link component for the top header (desktop)
  const TopNavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    const activeClass = isActive(to) 
      ? 'text-primary font-semibold' 
      : 'text-foreground hover:text-primary transition-colors';
    
    return (
      <Link to={to} className={`px-3 py-2 ${activeClass}`}>
        {children}
      </Link>
    );
  };

  // Navigation link component for the bottom bar (mobile)
  // Update the type of the 'icon' prop here
  const BottomNavLink = ({ to, icon, label }: { to: string, icon: React.ReactElement<IconBaseProps>, label: string }) => {
    const activeClass = isActive(to)
      ? 'text-primary'
      : 'text-muted-foreground hover:text-primary';
    return (
      <Link to={to} className={`flex flex-col items-center justify-center flex-1 p-2 ${activeClass} transition-colors`}>
        {/* Now TypeScript knows 'icon' can accept 'size' and 'className' */}
        {React.cloneElement(icon, { size: 24, className: 'mb-0.5' })}
        <span className="text-xs">{label}</span>
      </Link>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center text-2xl font-bold text-primary">
            <FiSearch className="mr-2 h-6 w-6" />
            NextHire
          </Link>
          
          <div className="flex items-center gap-2"> {/* Wrapper for desktop nav and theme toggle */}
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <TopNavLink to="/">Home</TopNavLink>
              <TopNavLink to="/jobs">Jobs</TopNavLink>
              <TopNavLink to="/jobs/add">Post Job</TopNavLink>
              <TopNavLink to="/saved-jobs">Saved</TopNavLink>
            </nav>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              iconOnly
              onClick={toggleTheme}
              aria-label={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} mode`}
              title={`Current theme: ${theme}. Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'}.`}
              // Pass the icon to the 'icon' prop
              icon={
                effectiveTheme === 'dark' ? (
                  <FiMoon size={20} className="text-red"/>
                ) : (
                  <FiSun size={20} className="text-red"/>
                )
              }
            /> {/* Remove children from here */}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden border-t border-border bg-background sticky bottom-0 z-10">
        <div className="container mx-auto flex justify-around">
          <BottomNavLink to="/" icon={<FiHome />} label="Home" />
          <BottomNavLink to="/jobs" icon={<FiBriefcase />} label="Jobs" />
          <BottomNavLink to="/jobs/add" icon={<FiPlusSquare />} label="Post Job" />
          <BottomNavLink to="/saved-jobs" icon={<FiBookmark />} label="Saved" />
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;