
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Send, MessageCircle, Wallet, CreditCard, Plus, Lightbulb, ChevronDown } from 'lucide-react';
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
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
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
    <div className="space-y-4">
      {/* Quick Examples Dropdown */}
      <Card className="bg-muted/30 border-muted-foreground/20">
        <Collapsible open={isExamplesOpen} onOpenChange={setIsExamplesOpen}>
          <CollapsibleTrigger asChild>
            <div className={`${isMobile ? 'p-3' : 'p-4'} cursor-pointer hover:bg-muted/50 transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-amber-500`} />
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-foreground`}>
                    Quick Examples
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExamplesOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'} pt-0`}>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground space-y-2`}>
                <p className="mb-2">Try these example formats:</p>
                <div className="grid gap-2">
                  <div className="bg-background px-3 py-2 rounded-lg border font-mono text-xs">
                    "Bought coffee for ₹150"
                  </div>
                  <div className="bg-background px-3 py-2 rounded-lg border font-mono text-xs">
                    "Received salary ₹30000"
                  </div>
                  <div className="bg-background px-3 py-2 rounded-lg border font-mono text-xs">
                    "Paid rent ₹12000"
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Enhanced Add Transaction Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg ring-1 ring-primary/10">
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <div className="p-3 bg-primary/15 rounded-xl shadow-sm">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>
                Add Transaction
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
                Describe your expense or income in natural language
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-auto hover:bg-primary/10"
            >
              <Plus className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`} />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '5'}`}>
            <div className={`flex gap-${isMobile ? '3' : '4'}`}>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., 'Spent ₹150 on coffee' or 'Earned ₹5000 salary'"
                className={`flex-1 ${isMobile ? 'text-base h-12' : 'text-lg h-14'} border-primary/30 focus:border-primary bg-background/80 backdrop-blur-sm shadow-sm`}
              />
              <Button 
                type="submit" 
                className={`${isMobile ? 'px-6 h-12' : 'px-8 h-14'} bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200`}
              >
                <Send className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
              </Button>
            </div>

            {/* Expanded Options */}
            {isExpanded && (
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-${isMobile ? '4' : '5'} pt-${isMobile ? '4' : '5'} border-t border-primary/20`}>
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-primary" />
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="w-full border-primary/30 focus:border-primary">
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
                  <CreditCard className="h-5 w-5 text-primary" />
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger className="w-full border-primary/30 focus:border-primary">
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
    </div>
  );
};
