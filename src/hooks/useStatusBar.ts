
import { useEffect } from 'react';

export const useStatusBar = () => {
  useEffect(() => {
    // Completely disabled to prevent crashes  
    console.log('Status bar hook disabled for app stability');
  }, []);
};
