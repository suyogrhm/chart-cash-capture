import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Account } from '@/types/Transaction';
import { AddAccountDialog } from '@/components/AddAccountDialog';
import { EditAccountDialog } from '@/components/EditAccountDialog';
import { Plus, Edit2, Trash2, CreditCard, Wallet, PiggyBank, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AccountsManagerProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onEditAccount: (id: string, updates: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountsManager = ({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount
}: AccountsManagerProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return <CreditCard className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'debit':
        return <CreditCard className="h-5 w-5" />;
      case 'cash':
        return <Wallet className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getAccountTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return 'Checking';
      case 'savings':
        return 'Savings';
      case 'credit':
        return 'Credit Card';
      case 'debit':
        return 'Debit Card';
      case 'cash':
        return 'Cash';
      default:
        return 'Unknown';
    }
  };

  const formatBalance = (balance: number) => {
    const isNegative = balance < 0;
    const absBalance = Math.abs(balance);
    return (
      <span className={isNegative ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}>
        {isNegative ? '-' : ''}${absBalance.toFixed(2)}
      </span>
    );
  };

  const handleDeleteAccount = (id: string, accountName: string) => {
    if (window.confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`)) {
      onDeleteAccount(id);
      toast({
        title: "Account deleted",
        description: `${accountName} has been removed from your accounts.`,
      });
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Account Management</h2>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        {/* Total Balance Summary */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Net Worth</p>
            <p className="text-2xl font-bold">{formatBalance(totalBalance)}</p>
          </div>
        </div>

        {/* Accounts List */}
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="p-4 bg-card border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${account.color}20`, color: account.color }}
                    >
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground">{account.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getAccountTypeLabel(account.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAccount(account)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id, account.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatBalance(account.balance)}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No accounts yet</p>
            <p className="text-sm">Add your first account to get started</p>
          </div>
        )}
      </Card>

      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddAccount={onAddAccount}
      />

      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          open={!!editingAccount}
          onOpenChange={() => setEditingAccount(null)}
          onEditAccount={onEditAccount}
        />
      )}
    </div>
  );
};
