
import { Transaction } from '@/types/Transaction';

const bankKeywords = {
  debit: ['debited', 'debit', 'withdrawn', 'purchase', 'spent', 'paid'],
  credit: ['credited', 'credit', 'received', 'deposited', 'refund', 'salary', 'transfer received'],
  amount: ['rs', 'inr', '₹', 'amount', 'amt'],
  account: ['a/c', 'account', 'acc'],
};

export const parseSMSTransaction = (smsText: string): Omit<Transaction, 'id' | 'date' | 'original_message'> | null => {
  const lowerText = smsText.toLowerCase();
  
  // Extract amount - look for patterns like "Rs 1000", "₹1,000", "INR 500.00"
  const amountPatterns = [
    /(?:rs\.?\s*|₹\s*|inr\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:amount|amt)[\s:]+(?:rs\.?\s*|₹\s*|inr\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs|inr|₹)/i
  ];

  let amount = 0;
  for (const pattern of amountPatterns) {
    const match = smsText.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  if (amount <= 0) return null;

  // Determine transaction type
  const isDebit = bankKeywords.debit.some(keyword => lowerText.includes(keyword));
  const isCredit = bankKeywords.credit.some(keyword => lowerText.includes(keyword));
  
  let type: 'income' | 'expense';
  if (isCredit && !isDebit) {
    type = 'income';
  } else if (isDebit && !isCredit) {
    type = 'expense';
  } else {
    // If unclear, check for more specific patterns
    if (lowerText.includes('salary') || lowerText.includes('refund') || lowerText.includes('cashback')) {
      type = 'income';
    } else {
      type = 'expense'; // Default to expense
    }
  }

  // Extract merchant/description
  let description = '';
  let category = 'other';

  // Common merchant patterns in SMS
  const merchantPatterns = [
    /(?:at|to|from)\s+([A-Za-z0-9\s&]+?)(?:\s+on|\s+via|\s+upi|\s+card|\.|$)/i,
    /(?:merchant|vendor)[\s:]+([A-Za-z0-9\s&]+?)(?:\s+on|\s+via|\.|$)/i,
    /upi-([A-Za-z0-9\s&]+?)(?:\s+on|\s+via|\.|$)/i
  ];

  for (const pattern of merchantPatterns) {
    const match = smsText.match(pattern);
    if (match && match[1]) {
      description = match[1].trim();
      break;
    }
  }

  // Category detection based on SMS content
  if (type === 'expense') {
    if (lowerText.includes('fuel') || lowerText.includes('petrol') || lowerText.includes('diesel')) {
      category = 'fuel';
    } else if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('zomato') || lowerText.includes('swiggy')) {
      category = 'food';
    } else if (lowerText.includes('uber') || lowerText.includes('ola') || lowerText.includes('metro')) {
      category = 'transport';
    } else if (lowerText.includes('amazon') || lowerText.includes('flipkart') || lowerText.includes('shopping')) {
      category = 'shopping';
    } else if (lowerText.includes('electricity') || lowerText.includes('water') || lowerText.includes('gas') || lowerText.includes('bill')) {
      category = 'bills';
    } else if (lowerText.includes('movie') || lowerText.includes('entertainment')) {
      category = 'entertainment';
    }
  } else {
    if (lowerText.includes('salary') || lowerText.includes('wage')) {
      category = 'salary';
    } else if (lowerText.includes('interest') || lowerText.includes('dividend')) {
      category = 'investment';
    } else if (lowerText.includes('refund') || lowerText.includes('cashback')) {
      category = 'refund';
    }
  }

  // If no description found, create a generic one
  if (!description) {
    if (type === 'expense') {
      description = category === 'other' ? 'Expense' : category.charAt(0).toUpperCase() + category.slice(1);
    } else {
      description = category === 'other' ? 'Income' : category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  return {
    type,
    amount,
    category,
    description: description.charAt(0).toUpperCase() + description.slice(1)
  };
};
