
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Shield, Smartphone, Monitor, AlertTriangle, CheckCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react';
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
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const [pluginError, setPluginError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkInitialState();
    smsService.setTransactionCallback(onTransactionDetected);
  }, [onTransactionDetected]);

  const checkInitialState = async () => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    
    if (native) {
      console.log('Checking initial permission state...');
      try {
        const permission = await smsService.checkPermissions();
        console.log('Initial permission state:', permission);
        setHasPermission(permission);
        setPluginError(null);
      } catch (error) {
        console.error('Error checking initial permissions:', error);
        if (error.message && error.message.includes('not implemented')) {
          setPluginError('not_implemented');
        } else {
          setPluginError('unknown');
        }
      }
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
      console.log('Requesting SMS permissions...');
      const granted = await smsService.requestPermissions();
      console.log('Permission request completed, granted:', granted);
      setHasPermission(granted);
      setPluginError(null);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      if (error.message && error.message.includes('not implemented')) {
        setPluginError('not_implemented');
        toast({
          title: "Platform Not Supported",
          description: "SMS detection requires plugin setup. Run 'npx cap sync' and rebuild the app.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Permission Error",
          description: "Failed to request SMS permissions. Please try again or check plugin setup.",
          variant: "destructive",
        });
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const recheckPermissions = async () => {
    if (isCheckingPermission) return;
    
    setIsCheckingPermission(true);
    
    try {
      console.log('Manually rechecking permissions...');
      const permission = await smsService.checkPermissions();
      console.log('Manual permission recheck result:', permission);
      setHasPermission(permission);
      setPluginError(null);
      
      if (permission) {
        toast({
          title: "Permissions Updated",
          description: "SMS permissions are now active.",
        });
      } else {
        toast({
          title: "No SMS Permissions",
          description: "Please grant SMS permissions in your device settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error rechecking permissions:', error);
      if (error.message && error.message.includes('not implemented')) {
        setPluginError('not_implemented');
      }
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const forceRefreshPermissions = async () => {
    if (isForceRefreshing) return;
    
    setIsForceRefreshing(true);
    
    try {
      console.log('Force refreshing permissions...');
      const permission = await smsService.forceRefreshPermissions();
      console.log('Force refresh result:', permission);
      setHasPermission(permission);
      setPluginError(null);
      
      if (permission) {
        toast({
          title: "Permissions Detected!",
          description: "SMS permissions are now working correctly.",
        });
      }
    } catch (error) {
      console.error('Error force refreshing permissions:', error);
      if (error.message && error.message.includes('not implemented')) {
        setPluginError('not_implemented');
      }
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh permission status.",
        variant: "destructive",
      });
    } finally {
      setIsForceRefreshing(false);
    }
  };

  const openDeviceSettings = () => {
    toast({
      title: "Open Device Settings",
      description: "Go to Settings > Apps > chart-cash-capture > Permissions > SMS and enable it.",
    });
  };

  const openSetupInstructions = () => {
    toast({
      title: "Setup Instructions",
      description: "Run 'npx cap sync' in your project, then rebuild and reinstall the app to enable SMS detection.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Transaction Detection
          {!isNative && <Monitor className="h-4 w-4 text-muted-foreground" />}
          {isNative && hasPermission && !pluginError && <CheckCircle className="h-4 w-4 text-green-500" />}
          {isNative && (!hasPermission || pluginError) && <AlertTriangle className="h-4 w-4 text-orange-500" />}
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

        {isNative && hasPermission && !pluginError && (
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

        {isNative && pluginError === 'not_implemented' && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-900 dark:text-red-100">Plugin Setup Required</span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">
              The SMS plugin is not properly installed or synced. This requires rebuilding the app with proper plugin configuration.
            </p>
            <Button 
              onClick={openSetupInstructions}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Setup Instructions
            </Button>
          </div>
        )}

        {isNative && !hasPermission && !pluginError && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-900 dark:text-orange-100">SMS Permission Required</span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Grant SMS permissions to automatically detect transactions from bank SMS messages.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={requestPermissions}
                size="sm"
                variant="outline"
                disabled={isRequestingPermission}
                className="text-xs"
              >
                <Shield className="h-3 w-3 mr-1" />
                {isRequestingPermission ? 'Requesting...' : 'Request Permission'}
              </Button>
              <Button 
                onClick={openDeviceSettings}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Device Settings
              </Button>
              <Button 
                onClick={recheckPermissions}
                size="sm"
                variant="outline"
                disabled={isCheckingPermission}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isCheckingPermission ? 'animate-spin' : ''}`} />
                {isCheckingPermission ? 'Checking...' : 'Recheck'}
              </Button>
              <Button 
                onClick={forceRefreshPermissions}
                size="sm"
                variant="outline"
                disabled={isForceRefreshing}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isForceRefreshing ? 'animate-spin' : ''}`} />
                {isForceRefreshing ? 'Refreshing...' : 'Force Refresh'}
              </Button>
            </div>
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
            disabled={isNative && (!hasPermission || pluginError === 'not_implemented')}
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
