
import { Transaction } from '@/types/Transaction';

const incomeKeywords = ['earned', 'salary', 'paid', 'received', 'income', 'bonus', 'freelance', 'sold'];
const expenseKeywords = ['spent', 'bought', 'paid for', 'purchased', 'cost', 'bill', 'food', 'gas', 'fuel'];

const categories = {
  income: ['salary', 'freelance', 'investment', 'bonus', 'other'],
  expense: ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'fuel', 'other']
};

export const parseMessage = (message: string): Omit<Transaction, 'id' | 'date' | 'originalMessage'> | null => {
  const lowerMessage = message.toLowerCase();
  
  // Extract amount using regex
  const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
  if (!amountMatch) return null;
  
  const amount = parseFloat(amountMatch[1]);
  if (amount <= 0) return null;

  // Determine if it's income or expense with better logic for rent
  const hasIncomeKeyword = incomeKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasExpenseKeyword = expenseKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Special handling for rent - check context more carefully
  const isRentIncome = lowerMessage.includes('received rent') || 
                      lowerMessage.includes('rent received') ||
                      (lowerMessage.includes('rent') && (lowerMessage.includes('received') || lowerMessage.includes('income') || lowerMessage.includes('earned')));
  
  const isRentExpense = lowerMessage.includes('paid rent') || 
                       lowerMessage.includes('rent paid') ||
                       (lowerMessage.includes('rent') && (lowerMessage.includes('paid') || lowerMessage.includes('bill')));
  
  let type: 'income' | 'expense';
  if (isRentIncome || (hasIncomeKeyword && !hasExpenseKeyword && !isRentExpense)) {
    type = 'income';
  } else if (hasExpenseKeyword && !hasIncomeKeyword) {
    type = 'expense';
  } else {
    // Default to expense if ambiguous, unless it's clearly rent income
    type = isRentIncome ? 'income' : 'expense';
  }

  // Determine category based on keywords - but prioritize transaction type
  let category = 'other';
  
  if (type === 'income') {
    // For income, focus on income-specific categories
    if (lowerMessage.includes('salary') || lowerMessage.includes('job') || lowerMessage.includes('wage')) category = 'salary';
    else if (lowerMessage.includes('freelance') || lowerMessage.includes('contract') || lowerMessage.includes('consulting')) category = 'freelance';
    else if (lowerMessage.includes('bonus') || lowerMessage.includes('tip')) category = 'bonus';
    else if (lowerMessage.includes('investment') || lowerMessage.includes('dividend') || lowerMessage.includes('interest')) category = 'investment';
    else if (lowerMessage.includes('rent') || lowerMessage.includes('rental')) category = 'rental income';
    else if (lowerMessage.includes('refund') || lowerMessage.includes('return')) category = 'refund';
    // Default income category
    else category = 'other income';
  } else {
    // For expenses, use the existing expense categorization
    if (lowerMessage.includes('food') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner') || lowerMessage.includes('coffee')) category = 'food';
    else if (lowerMessage.includes('fuel') || lowerMessage.includes('petrol') || lowerMessage.includes('gasoline')) category = 'fuel';
    else if (lowerMessage.includes('gas') || lowerMessage.includes('uber') || lowerMessage.includes('transport')) category = 'transport';
    else if (lowerMessage.includes('movie') || lowerMessage.includes('game') || lowerMessage.includes('entertainment')) category = 'entertainment';
    else if (lowerMessage.includes('rent') || lowerMessage.includes('electricity') || lowerMessage.includes('bill')) category = 'bills';
    else if (lowerMessage.includes('shopping') || lowerMessage.includes('clothes') || lowerMessage.includes('bought')) category = 'shopping';
    else if (lowerMessage.includes('doctor') || lowerMessage.includes('health') || lowerMessage.includes('medicine')) category = 'health';
  }

  // Create description by removing amount and common words
  const description = message
    .replace(/\$?(\d+(?:\.\d{2})?)/g, '')
    .replace(/\b(spent|earned|paid|for|on|the|a|an|i|my)\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ') || `${type === 'income' ? 'Income' : 'Expense'} - ${category}`;

  return {
    type,
    amount,
    category,
    description: description.charAt(0).toUpperCase() + description.slice(1)
  };
};
