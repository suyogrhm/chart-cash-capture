
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Shield, Smartphone, Monitor, AlertTriangle, CheckCircle, Copy, Type } from 'lucide-react';
import { smsService } from '@/services/smsService';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

interface SMSSettingsProps {
  onTransactionDetected: (transaction: any) => void;
}

export const SMSSettings = ({ onTransactionDetected }: SMSSettingsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkInitialState();
    smsService.setTransactionCallback(onTransactionDetected);
  }, [onTransactionDetected]);

  const checkInitialState = async () => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    
    if (native) {
      const permission = await smsService.checkPermissions();
      setHasPermission(permission);
    }
    
    setIsListening(smsService.getListeningStatus());
  };

  const handleToggleSMSDetection = async () => {
    if (isListening) {
      smsService.stopListening();
      setIsListening(false);
    } else {
      const success = await smsService.startListening();
      if (success) {
        setIsListening(true);
        setHasPermission(true);
      }
    }
  };

  const requestPermissions = async () => {
    const granted = await smsService.requestPermissions();
    setHasPermission(granted);
  };

  const showManualInputTip = () => {
    toast({
      title: "Manual Transaction Entry",
      description: "Copy SMS text and paste it in the message input below, or type transactions like 'spent 500 on food'",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Transaction Detection
          {!isNative && <Monitor className="h-4 w-4 text-muted-foreground" />}
          {isNative && hasPermission && <CheckCircle className="h-4 w-4 text-green-500" />}
          {isNative && !hasPermission && <AlertTriangle className="h-4 w-4 text-orange-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isNative && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Web Preview Mode</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              SMS detection will work when you install this app on your Android or iOS device. 
              In web mode, you can test with a simulated SMS transaction.
            </p>
          </div>
        )}

        {isNative && hasPermission && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-900 dark:text-green-100">SMS Detection Active</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              The app can automatically detect transactions from your SMS messages.
            </p>
          </div>
        )}

        {isNative && !hasPermission && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-900 dark:text-orange-100">SMS Permission Denied</span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Don't worry! You can still use all features by manually entering transaction details.
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <Label className="text-sm font-medium">
              Automatically detect transactions from SMS
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Parse bank SMS messages to automatically add transactions
            </p>
          </div>
          <Switch
            checked={isListening}
            onCheckedChange={handleToggleSMSDetection}
            disabled={isNative && !hasPermission}
          />
        </div>

        {isNative && !hasPermission && (
          <div className="space-y-3">
            <Button 
              onClick={requestPermissions}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Try Request SMS Permission Again
            </Button>
            
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Alternative: Manual Entry
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                You can manually add transactions by typing or copy-pasting SMS text in the message input below.
              </p>
              <Button 
                onClick={showManualInputTip}
                size="sm"
                variant="ghost"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Show Manual Entry Tips
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            Manual Entry Examples:
          </h4>
          <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
            <li>• Type: "spent 500 on food" or "earned 2000 salary"</li>
            <li>• Copy-paste bank SMS: "Debited Rs 150 at McDonald's"</li>
            <li>• Simple format: "bought groceries 800"</li>
            <li>• The app will automatically parse and categorize</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Privacy Note:</p>
          <p>All transaction data stays on your device. SMS permissions are only used for parsing bank notifications - no data is sent to external servers.</p>
        </div>
      </CardContent>
    </Card>
  );
};
