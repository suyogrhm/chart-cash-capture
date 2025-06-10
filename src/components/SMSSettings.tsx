
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Shield, Smartphone, Monitor, AlertTriangle, CheckCircle } from 'lucide-react';
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
    if (granted) {
      toast({
        title: "Permission Granted",
        description: "You can now enable SMS detection for automatic transaction tracking.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Auto-Detection
          {!isNative && <Monitor className="h-4 w-4 text-muted-foreground" />}
          {isNative && hasPermission && <CheckCircle className="h-4 w-4 text-green-500" />}
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

        {isNative && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-900 dark:text-green-100">Production Ready</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              SMS plugin is installed and configured. The app can detect transactions from SMS messages.
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
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="font-medium">SMS Permission Required</span>
            </div>
            <p className="text-xs text-muted-foreground">
              To automatically detect transactions from SMS messages, we need permission to read your SMS. 
              This permission is only used to detect bank and payment notifications.
            </p>
            <Button 
              onClick={requestPermissions}
              size="sm"
              variant="outline"
              className="w-full"
            >
              Grant SMS Permission
            </Button>
          </div>
        )}

        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            How SMS Detection Works:
          </h4>
          <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
            <li>• Monitors SMS from banks and payment services</li>
            <li>• Automatically extracts amount and transaction type</li>
            <li>• Creates transactions with smart category detection</li>
            <li>• Your SMS data stays private and secure</li>
            {!isNative && <li>• Test mode available in web browser</li>}
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Supported Sources:</p>
          <p>Bank SMS, UPI notifications (GPay, PhonePe, Paytm), Payment gateways, and other financial services</p>
        </div>

        {!isNative && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>To use in production:</strong> Run 'npx cap sync' after pulling the latest changes, 
              then build and deploy to your mobile device.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
