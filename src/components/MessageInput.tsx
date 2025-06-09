
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, MessageCircle, Wallet, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Account } from '@/types/Transaction';

interface MessageInputProps {
  onMessage: (message: string, accountId?: string, paymentMethod?: string) => void;
  accounts: Account[];
}

export const MessageInput = ({ onMessage, accounts }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onMessage(message.trim(), selectedAccount, selectedPaymentMethod);
      setMessage('');
      setSelectedPaymentMethod('');
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
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Add Transaction</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., 'Spent $25 on lunch' or 'Earned $500 from freelance work'"
            className="flex-1 text-base"
          />
          <Button type="submit" className="px-6">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </form>
      
      <div className="mt-3 text-sm text-muted-foreground">
        💡 Try: "Bought coffee for $5", "Received salary $3000", "Paid rent $1200"
      </div>
    </Card>
  );
};
