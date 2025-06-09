
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, MessageCircle, Wallet, CreditCard, Plus, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  onMessage: (message: string, accountId?: string, paymentMethod?: string) => void;
  accounts: Account[];
}

export const MessageInput = ({ onMessage, accounts }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  // Find savings account first, then fallback to first account
  const defaultAccount = accounts.find(acc => acc.type === 'savings') || accounts[0];
  const [selectedAccount, setSelectedAccount] = useState(defaultAccount?.id || '');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onMessage(message.trim(), selectedAccount, selectedPaymentMethod);
      setMessage('');
      setSelectedPaymentMethod('');
      setIsExpanded(false);
      toast({
        title: "Transaction recorded!",
        description: "Your message has been processed and added to your transactions.",
      });
    }
  };

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'upi', label: '📱 UPI' },
    { value: 'card', label: '💳 Card' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
    { value: 'other', label: '📝 Other' },
  ];

  return (
    <Card className="bg-card border-border shadow-lg overflow-hidden">
      <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center gap-3 ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-foreground`}>Add Transaction</h2>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Describe your expense or income</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto"
          >
            <Plus className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`} />
          </Button>
        </div>

        {/* Enhanced Usage Examples - More Prominent */}
        <div className={`${isMobile ? 'mb-3' : 'mb-4'} p-3 bg-primary/5 border border-primary/20 rounded-lg`}>
          <div className="flex items-start gap-2">
            <Lightbulb className={`${isMobile ? 'h-4 w-4 mt-0.5' : 'h-5 w-5 mt-0.5'} text-primary flex-shrink-0`} />
            <div className="flex-1">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-primary mb-1`}>
                Quick Examples:
              </p>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground space-y-1`}>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-background px-2 py-1 rounded text-xs font-mono border">"Bought coffee for ₹150"</span>
                  <span className="bg-background px-2 py-1 rounded text-xs font-mono border">"Received salary ₹30000"</span>
                  <span className="bg-background px-2 py-1 rounded text-xs font-mono border">"Paid rent ₹12000"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'}`}>
          <div className={`flex gap-${isMobile ? '2' : '3'}`}>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., 'Spent ₹150 on coffee' or 'Earned ₹5000 salary'"
              className={`flex-1 ${isMobile ? 'text-sm h-10' : 'text-base'} border-border focus:border-primary`}
            />
            <Button type="submit" className={`${isMobile ? 'px-4' : 'px-6'} bg-primary hover:bg-primary/90`}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Expanded Options */}
          {isExpanded && (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-${isMobile ? '3' : '4'} pt-${isMobile ? '3' : '4'} border-t border-border`}>
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: account.color }}
                          />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Payment method (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
};
