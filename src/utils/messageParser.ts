
import { Transaction } from '@/types/Transaction';

const incomeKeywords = ['earned', 'salary', 'paid', 'received', 'income', 'bonus', 'freelance', 'sold'];
const expenseKeywords = ['spent', 'bought', 'paid for', 'purchased', 'cost', 'bill', 'food', 'gas', 'fuel'];

const categories = {
  income: ['salary', 'freelance', 'investment', 'bonus', 'other'],
  expense: ['food', 'transport', 'entertainment', 'bills', 'shopping', 'health', 'fuel', 'other']
};

export const parseMessage = (message: string): Omit<Transaction, 'id' | 'date' | 'originalMessage'> | null => {
  const lowerMessage = message.toLowerCase();
  
  // Extract amount using regex - look for numbers (including those with commas)
  const amountMatches = message.match(/\b(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+)\b/g);
  if (!amountMatches || amountMatches.length === 0) return null;
  
  // Take the last/largest number as the amount (most likely to be the transaction amount)
  const amounts = amountMatches.map(match => parseFloat(match.replace(/,/g, '')));
  const amount = Math.max(...amounts);
  if (amount <= 0) return null;

  // Remove all amount occurrences from the message to get clean description
  let cleanMessage = message;
  amountMatches.forEach(amountStr => {
    cleanMessage = cleanMessage.replace(new RegExp(`\\b${amountStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), '');
  });
  
  // Clean up extra whitespace and common words
  cleanMessage = cleanMessage
    .replace(/\b(₹|rupees?|rs\.?)\b/gi, '') // Remove currency symbols
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Determine if it's income or expense
  const hasIncomeKeyword = incomeKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasExpenseKeyword = expenseKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Special handling for rent
  const isRentIncome = lowerMessage.includes('received rent') || 
                      lowerMessage.includes('rent received') ||
                      (lowerMessage.includes('rent') && lowerMessage.includes('received'));
  
  const isRentExpense = lowerMessage.includes('paid rent') || 
                       lowerMessage.includes('rent paid') ||
                       (lowerMessage.includes('rent') && lowerMessage.includes('paid'));
  
  let type: 'income' | 'expense';
  if (isRentIncome || (hasIncomeKeyword && !hasExpenseKeyword && !isRentExpense)) {
    type = 'income';
  } else if (hasExpenseKeyword && !hasIncomeKeyword) {
    type = 'expense';
  } else {
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
    if (lowerMessage.includes('food') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner') || lowerMessage.includes('coffee')) category = 'food';
    else if (lowerMessage.includes('movie') || lowerMessage.includes('game') || lowerMessage.includes('entertainment')) category = 'entertainment';
    else if (lowerMessage.includes('fuel') || lowerMessage.includes('petrol') || lowerMessage.includes('gasoline')) category = 'fuel';
    else if (lowerMessage.includes('gas') || lowerMessage.includes('uber') || lowerMessage.includes('transport')) category = 'transport';
    else if (lowerMessage.includes('rent') || lowerMessage.includes('electricity') || lowerMessage.includes('bill')) category = 'bills';
    else if (lowerMessage.includes('shopping') || lowerMessage.includes('clothes') || lowerMessage.includes('bought')) category = 'shopping';
    else if (lowerMessage.includes('doctor') || lowerMessage.includes('health') || lowerMessage.includes('medicine')) category = 'health';
  }

  // Create clean description by removing common transaction words and cleaning up
  let description = cleanMessage
    .replace(/\b(spent|earned|paid|for|on|the|a|an|i|my|from|to)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // For rent transactions, clean up specific patterns
  if (lowerMessage.includes('rent')) {
    description = description
      .replace(/\brent\s+(received|paid)\b/gi, '')
      .replace(/\b(received|paid)\s+rent\b/gi, '')
      .replace(/\brent\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // If description is empty or just a single word, create a meaningful one
  if (description.length === 0) {
    description = category === 'other' ? (type === 'income' ? 'Income' : 'Expense') : category.charAt(0).toUpperCase() + category.slice(1);
  } else if (description.length > 0) {
    // Capitalize first letter and clean up
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  return {
    type,
    amount,
    category,
    description
  };
};
