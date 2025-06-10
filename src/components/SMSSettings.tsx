
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
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
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
        // Double check permissions after successful start
        if (isNative) {
          const permission = await smsService.checkPermissions();
          setHasPermission(permission);
        }
      }
    }
  };

  const requestPermissions = async () => {
    if (isRequestingPermission) return;
    
    setIsRequestingPermission(true);
    
    try {
      const granted = await smsService.requestPermissions();
      setHasPermission(granted);
      
      // If permissions were granted, also check the current permission status
      if (granted && isNative) {
        const currentPermission = await smsService.checkPermissions();
        setHasPermission(currentPermission);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request SMS permissions. Please try again or check device settings.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingPermission(false);
    }
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
              <span className="font-medium text-green-900 dark:text-green-100">SMS Detection Ready</span>
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
              <span className="font-medium text-orange-900 dark:text-orange-100">SMS Permission Required</span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Grant SMS permissions to automatically detect transactions from bank SMS messages.
            </p>
            <Button 
              onClick={requestPermissions}
              size="sm"
              variant="outline"
              className="w-full"
              disabled={isRequestingPermission}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isRequestingPermission ? 'Requesting Permission...' : 'Grant SMS Permission'}
            </Button>
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

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Privacy Note:</p>
          <p>All transaction data stays on your device. SMS permissions are only used for parsing bank notifications - no data is sent to external servers.</p>
        </div>
      </CardContent>
    </Card>
  );
};
