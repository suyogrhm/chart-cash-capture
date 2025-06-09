
import { Transaction } from '@/types/Transaction';

const incomeKeywords = ['earned', 'salary', 'paid', 'received', 'income', 'bonus', 'freelance', 'sold'];
const expenseKeywords = ['spent', 'bought', 'paid for', 'purchased', 'cost', 'bill', 'food', 'gas', 'fuel'];

const categories = {
  income: ['salary', 'freelance', 'investment', 'bonus', 'other'],
  expense: ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'fuel', 'other']
};

export const parseMessage = (message: string): Omit<Transaction, 'id' | 'date' | 'originalMessage'> | null => {
  const lowerMessage = message.toLowerCase();
  
  // Extract amount using regex - look for numbers at the end or standalone
  const amountMatches = message.match(/\b(\d+(?:,\d{3})*(?:\.\d{2})?)\b/g);
  if (!amountMatches || amountMatches.length === 0) return null;
  
  // Take the last number as the amount (most likely to be the transaction amount)
  const lastAmount = amountMatches[amountMatches.length - 1];
  const amount = parseFloat(lastAmount.replace(/[,\s]/g, ''));
  if (amount <= 0) return null;

  // Remove the amount from the message to get clean description
  let cleanMessage = message.replace(new RegExp(`\\b${lastAmount.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), '').trim();
  
  // Remove extra whitespace
  cleanMessage = cleanMessage.replace(/\s+/g, ' ').trim();

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

  // Determine category based on keywords
  let category = 'other';
  
  if (type === 'income') {
    if (lowerMessage.includes('salary') || lowerMessage.includes('job') || lowerMessage.includes('wage')) category = 'salary';
    else if (lowerMessage.includes('freelance') || lowerMessage.includes('contract') || lowerMessage.includes('consulting')) category = 'freelance';
    else if (lowerMessage.includes('bonus') || lowerMessage.includes('tip')) category = 'bonus';
    else if (lowerMessage.includes('investment') || lowerMessage.includes('dividend') || lowerMessage.includes('interest')) category = 'investment';
    else if (lowerMessage.includes('rent') || lowerMessage.includes('rental')) category = 'rental income';
    else if (lowerMessage.includes('refund') || lowerMessage.includes('return')) category = 'refund';
    else category = 'other income';
  } else {
    if (lowerMessage.includes('food') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner') || lowerMessage.includes('coffee') || lowerMessage.includes('movie')) category = lowerMessage.includes('movie') ? 'entertainment' : 'food';
    else if (lowerMessage.includes('fuel') || lowerMessage.includes('petrol') || lowerMessage.includes('gasoline')) category = 'fuel';
    else if (lowerMessage.includes('gas') || lowerMessage.includes('uber') || lowerMessage.includes('transport')) category = 'transport';
    else if (lowerMessage.includes('movie') || lowerMessage.includes('game') || lowerMessage.includes('entertainment')) category = 'entertainment';
    else if (lowerMessage.includes('rent') || lowerMessage.includes('electricity') || lowerMessage.includes('bill')) category = 'bills';
    else if (lowerMessage.includes('shopping') || lowerMessage.includes('clothes') || lowerMessage.includes('bought')) category = 'shopping';
    else if (lowerMessage.includes('doctor') || lowerMessage.includes('health') || lowerMessage.includes('medicine')) category = 'health';
  }

  // Create clean description
  let description = cleanMessage;
  
  // Remove common transaction words and clean up
  description = description
    .replace(/\b(spent|earned|paid|for|on|the|a|an|i|my|from|to|₹|rupees?|rs\.?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // For simple cases like "movie 230", extract just the main word
  if (description.split(' ').length === 1 && description.length > 0) {
    // Single word case, use it as is
    description = description.charAt(0).toUpperCase() + description.slice(1);
  } else if (description.length === 0) {
    // If no description, create a meaningful one based on category
    description = category === 'other' ? (type === 'income' ? 'Income' : 'Expense') : category.charAt(0).toUpperCase() + category.slice(1);
  } else {
    // Multi-word case, clean and capitalize
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  return {
    type,
    amount,
    category,
    description
  };
};
