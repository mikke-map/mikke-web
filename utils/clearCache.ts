export const clearAllCaches = async () => {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    console.log('All caches cleared successfully');
  }
};

export const initializeFreshSession = () => {
  if (typeof window !== 'undefined') {
    // Check if this is a fresh session
    const isReloaded = sessionStorage.getItem('isReloaded');
    
    if (!isReloaded) {
      // Mark as reloaded
      sessionStorage.setItem('isReloaded', 'true');
      
      // Force reload with cache bypass
      window.location.reload();
    }
  }
};