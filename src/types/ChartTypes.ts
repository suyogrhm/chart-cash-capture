
export interface SpendingData {
  name: string;
  value: number;
  color: string;
}

export interface CircularSpendingChartProps {
  data?: SpendingData[];
  transactions?: Transaction[];
  title?: string;
}

export interface ChartConfig {
  outerRadius: number;
  innerRadius: number;
  height: number;
}
