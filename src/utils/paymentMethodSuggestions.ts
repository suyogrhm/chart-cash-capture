
export interface PaymentMethodSuggestion {
  keywords: string[];
  method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
  confidence: number;
}

const paymentMethodPatterns: PaymentMethodSuggestion[] = [
  {
    keywords: ['upi', 'paytm', 'gpay', 'google pay', 'phonepe', 'bhim', 'amazon pay', 'razorpay'],
    method: 'upi',
    confidence: 0.9
  },
  {
    keywords: ['cash', 'notes', 'coins', 'physical', 'hand'],
    method: 'cash',
    confidence: 0.8
  },
  {
    keywords: ['card', 'debit', 'credit', 'visa', 'mastercard', 'rupay', 'swipe', 'tap'],
    method: 'card',
    confidence: 0.85
  },
  {
    keywords: ['bank', 'transfer', 'neft', 'rtgs', 'imps', 'wire'],
    method: 'bank_transfer',
    confidence: 0.8
  },
  {
    keywords: ['cheque', 'check', 'draft', 'online', 'wallet', 'other'],
    method: 'other',
    confidence: 0.6
  }
];

export const detectPaymentMethod = (message: string): { method: string; confidence: number; suggestion: string } | null => {
  const normalizedMessage = message.toLowerCase();
  
  for (const pattern of paymentMethodPatterns) {
    for (const keyword of pattern.keywords) {
      if (normalizedMessage.includes(keyword)) {
        const suggestions = {
          upi: 'UPI Payment (Google Pay, PhonePe, Paytm, etc.)',
          cash: 'Cash Payment',
          card: 'Card Payment (Debit/Credit)',
          bank_transfer: 'Bank Transfer (NEFT/RTGS/IMPS)',
          other: 'Other Payment Method'
        };
        
        return {
          method: pattern.method,
          confidence: pattern.confidence,
          suggestion: suggestions[pattern.method]
        };
      }
    }
  }
  
  return null;
};

export const getPaymentMethodSuggestions = (input: string): PaymentMethodSuggestion[] => {
  const normalizedInput = input.toLowerCase();
  
  return paymentMethodPatterns
    .filter(pattern => 
      pattern.keywords.some(keyword => 
        keyword.includes(normalizedInput) || normalizedInput.includes(keyword)
      )
    )
    .sort((a, b) => b.confidence - a.confidence);
};
