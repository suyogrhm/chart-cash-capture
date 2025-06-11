
import { useEffect } from 'react';

export const useBackButton = () => {
  useEffect(() => {
    // Completely disabled to prevent crashes
    console.log('Back button hook disabled for app stability');
  }, []);
};
