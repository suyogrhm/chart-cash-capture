
import { Budget } from '@/types/Transaction';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useBudgetOperations = (
  budgets: Budget[],
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>
) => {
  const { user } = useAuth();

  const handleAddBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budget, user_id: user.id, spent: 0 })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add budget",
        variant: "destructive",
      });
    } else if (data) {
      setBudgets(prev => [...prev, data as Budget]);
    }
  };

  return {
    handleAddBudget,
  };
};
