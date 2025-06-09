
import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChartConfig } from '@/types/ChartTypes';

export const useChartConfig = (): ChartConfig => {
  const isMobile = useIsMobile();

  return useMemo(() => {
    if (isMobile) {
      return {
        outerRadius: 80,
        innerRadius: 60,
        height: 250
      };
    } else {
      return {
        outerRadius: 100,
        innerRadius: 80,
        height: 300
      };
    }
  }, [isMobile]);
};
