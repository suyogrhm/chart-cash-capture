
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, MessageCircle, Wallet, CreditCard, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputProps {
  onMessage: (message: string, accountId?: string, paymentMethod?: string) => void;
  accounts: Account[];
}

export const MessageInput = ({ onMessage, accounts }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
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

  const handleQuickAction = (quickMessage: string) => {
    setMessage(quickMessage);
    // Optionally submit immediately
    onMessage(quickMessage, selectedAccount, selectedPaymentMethod);
    setMessage('');
    toast({
      title: "Transaction recorded!",
      description: "Your quick action has been added to your transactions.",
    });
  };

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'upi', label: '📱 UPI' },
    { value: 'card', label: '💳 Card' },
    { value: 'bank_transfer', label: '🏦 Bank Transfer' },
    { value: 'other', label: '📝 Other' },
  ];

  const quickActions = [
    { label: '☕ Coffee', amount: '₹150', message: 'Spent ₹150 on coffee' },
    { label: '🚗 Fuel', amount: '₹2000', message: 'Spent ₹2000 on fuel' },
    { label: '🍔 Lunch', amount: '₹300', message: 'Spent ₹300 on lunch' },
    { label: '🎬 Movie', amount: '₹500', message: 'Spent ₹500 on movie' },
  ];

  return (
    <Card className="bg-card border-border shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add Transaction</h2>
            <p className="text-sm text-muted-foreground">Describe your expense or income</p>
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., 'Spent ₹150 on coffee' or 'Earned ₹5000 salary'"
              className="flex-1 text-base border-border focus:border-primary"
            />
            <Button type="submit" className="px-6 bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          {!isExpanded && !isMobile && (
            <div className="flex gap-2 flex-wrap">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.message)}
                  className="text-xs hover:bg-primary/10"
                >
                  {action.label} {action.amount}
                </Button>
              ))}
            </div>
          )}

          {/* Expanded Options */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
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
        
        <div className="mt-3 text-sm text-muted-foreground">
          💡 Try: "Bought coffee for ₹150", "Received salary ₹30000", "Paid rent ₹12000"
        </div>
      </div>
    </Card>
  );
};
