
import { CircularSpendingChart } from './CircularSpendingChart';
import { Transaction } from '@/types/Transaction';

interface SpendingChartProps {
  transactions: Transaction[];
}

export const SpendingChart = ({ transactions }: SpendingChartProps) => {
  return <CircularSpendingChart transactions={transactions} />;
};
