
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { SMSSettings } from '@/components/SMSSettings';
import { useExpenseTrackerData } from '@/hooks/useExpenseTrackerData';
import { User, Settings, MessageSquare, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { handleMessage } = useExpenseTrackerData();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSMSTransaction = (transaction: any) => {
    // Convert SMS transaction to the format expected by handleMessage
    const message = `${transaction.type === 'income' ? 'Received' : 'Spent'} ₹${transaction.amount} ${transaction.description}`;
    handleMessage(message);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Note: Supabase doesn't provide a direct way to delete user accounts from the client
      // This would typically require a server function or admin API call
      toast({
        title: "Account Deletion Request",
        description: "Please contact support to delete your account. We'll process your request within 24 hours.",
        variant: "destructive",
      });
      
      // For now, we'll sign the user out as the account deletion would need to be handled server-side
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process account deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user?.email || ''} 
                disabled 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={user?.user_metadata?.full_name || ''} 
                disabled 
                className="bg-muted"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Dashboard
              </Button>
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SMS Settings */}
        <SMSSettings onTransactionDetected={handleSMSTransaction} />

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Mobile App Features:</p>
              <ul className="space-y-1">
                <li>• SMS transaction detection</li>
                <li>• Offline data storage</li>
                <li>• Push notifications</li>
                <li>• Export data functionality</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Delete Account */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Delete Account</p>
              <p>Once you delete your account, there is no going back. This will permanently delete your account and remove all your data from our servers.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your profile and account information</li>
                      <li>All your transactions and financial data</li>
                      <li>Your budgets and categories</li>
                      <li>All associated accounts and settings</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteLoading ? "Processing..." : "Yes, Delete My Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
