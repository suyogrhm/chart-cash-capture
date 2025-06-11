
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { detectPaymentMethod } from '@/utils/paymentMethodSuggestions';
import { CreditCard, Smartphone, Banknote, Building } from 'lucide-react';

interface PaymentMethodDetectorProps {
  message: string;
  onSuggestionSelect: (method: string) => void;
}

export const PaymentMethodDetector = ({ message, onSuggestionSelect }: PaymentMethodDetectorProps) => {
  const detection = detectPaymentMethod(message);
  
  if (!detection) return null;

  const getIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return <Smartphone className="h-3 w-3" />;
      case 'card':
        return <CreditCard className="h-3 w-3" />;
      case 'cash':
        return <Banknote className="h-3 w-3" />;
      case 'bank_transfer':
        return <Building className="h-3 w-3" />;
      default:
        return <CreditCard className="h-3 w-3" />;
    }
  };

  const getMethodEmoji = (method: string) => {
    switch (method) {
      case 'upi': return '📱';
      case 'card': return '💳';
      case 'cash': return '💵';
      case 'bank_transfer': return '🏦';
      default: return '📝';
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-dashed border-primary/30">
      <span className="text-xs text-muted-foreground">Detected:</span>
      <Badge 
        variant="secondary" 
        className="cursor-pointer hover:bg-primary/10 transition-colors"
        onClick={() => onSuggestionSelect(detection.method)}
      >
        <span className="mr-1">{getMethodEmoji(detection.method)}</span>
        {detection.suggestion}
      </Badge>
      <span className="text-xs text-muted-foreground">
        ({Math.round(detection.confidence * 100)}% confidence)
      </span>
    </div>
  );
};
