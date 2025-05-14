import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollBehaviorManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Stores scroll positions for POP actions: { [location.key]: scrollY }
  const scrollPositionsForKey = useRef<Record<string, number>>({});
  // Stores last known scroll positions for pathnames, used for subsequent PUSH/REPLACE: { [pathname]: scrollY }
  const scrollPositionsForPathname = useRef<Record<string, number>>({});
  // Tracks pathnames that have had their "first PUSH/REPLACE visit" scroll-to-top handled: { [pathname]: boolean }
  const firstPushScrollHandledForPathname = useRef<Record<string, boolean>>({});

  // Effect for restoring scroll or setting initial scroll on navigation
  useEffect(() => {
    const currentPathname = location.pathname;
    const currentLocationKey = location.key; // Can be 'default' on initial load

    if (navigationType === 'POP') {
      // Browser back/forward action
      if (scrollPositionsForKey.current[currentLocationKey] !== undefined) {
        window.scrollTo(0, scrollPositionsForKey.current[currentLocationKey]);
      } else {
        // Fallback for POP if no key-specific position (e.g. initial history stack)
        window.scrollTo(0, 0);
      }
    } else if (navigationType === 'PUSH' || navigationType === 'REPLACE') {
      // New navigation (link click, redirect)
      if (!firstPushScrollHandledForPathname.current[currentPathname]) {
        // This is the first PUSH/REPLACE to this *pathname* in this session
        window.scrollTo(0, 0);
        firstPushScrollHandledForPathname.current[currentPathname] = true;
        // Since it's a "fresh" first visit via PUSH/REPLACE, clear any stale pathname-based scroll for it.
        // The user will create a new scroll history for this path starting from the top.
        if (scrollPositionsForPathname.current[currentPathname] !== undefined) {
          delete scrollPositionsForPathname.current[currentPathname];
        }
      } else {
        // This is a subsequent PUSH/REPLACE to an already "first-visited" pathname.
        // We must NOT inherit scroll from the *previous different page*.
        // Try to restore *this page's own* last known scroll position (saved by pathname).
        if (scrollPositionsForPathname.current[currentPathname] !== undefined) {
          window.scrollTo(0, scrollPositionsForPathname.current[currentPathname]);
        } else {
          // If no specific scroll position is known for this pathname (e.g., user never scrolled it after its first visit),
          // scroll to top to prevent inheritance.
          window.scrollTo(0, 0);
        }
      }
    } else {
      // Handles initial load if navigationType is not yet PUSH/REPLACE/POP (e.g. undefined)
      // Treat initial load like a "first PUSH" to the current path.
      if (!firstPushScrollHandledForPathname.current[currentPathname]) {
        window.scrollTo(0, 0);
        firstPushScrollHandledForPathname.current[currentPathname] = true;
        if (scrollPositionsForPathname.current[currentPathname] !== undefined) {
          delete scrollPositionsForPathname.current[currentPathname];
        }
      }
    }
    // Dependencies for the scroll handling effect
  }, [location.pathname, location.key, navigationType]);

  // Effect for saving scroll position
  useEffect(() => {
    const keyToSaveFor = location.key; // Key of the current page
    const pathToSaveFor = location.pathname; // Pathname of the current page

    // Function to actually save the scroll positions
    const saveScrollPosition = () => {
      const currentScrollY = window.scrollY;
      if (keyToSaveFor && keyToSaveFor !== 'default') {
        scrollPositionsForKey.current[keyToSaveFor] = currentScrollY;
      }
      // Always update the latest scroll for the pathname.
      // This will be used by subsequent PUSH/REPLACE navigations to this path.
      scrollPositionsForPathname.current[pathToSaveFor] = currentScrollY;
    };

    // Save scroll on page refresh or tab close
    window.addEventListener('beforeunload', saveScrollPosition);

    // The cleanup function of this effect runs when its dependencies change,
    // effectively when we are navigating AWAY from the page defined by the *previous* location.key/pathname.
    return () => {
      saveScrollPosition(); // Save scroll of the page we are leaving
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
    // Rerun this effect (and its cleanup) when location.key or location.pathname changes.
    // This ensures we are always working with the key/path of the *current* page to save its scroll when leaving.
  }, [location.key, location.pathname]);

  return null; // This component does not render anything
};

export default ScrollBehaviorManager;