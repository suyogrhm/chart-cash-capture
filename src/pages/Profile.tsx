
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { SMSSettings } from '@/components/SMSSettings';
import { useExpenseTrackerData } from '@/hooks/useExpenseTrackerData';
import { User, Settings, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { handleMessage } = useExpenseTrackerData();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSMSTransaction = (transaction: any) => {
    // Convert SMS transaction to the format expected by handleMessage
    const message = `${transaction.type === 'income' ? 'Received' : 'Spent'} ₹${transaction.amount} ${transaction.description}`;
    handleMessage(message);
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
      </div>
    </div>
  );
};

export default Profile;
