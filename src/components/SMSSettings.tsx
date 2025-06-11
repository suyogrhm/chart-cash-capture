
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, Play, Square } from 'lucide-react';
import { smsService } from '@/services/smsService';
import { TransactionCallback } from '@/types/SMSTypes';

interface SMSSettingsProps {
  onTransactionDetected?: TransactionCallback;
}

export const SMSSettings: React.FC<SMSSettingsProps> = ({ onTransactionDetected }) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    checkInitialPermissions();
    if (onTransactionDetected) {
      smsService.setTransactionCallback(onTransactionDetected);
    }
  }, [onTransactionDetected]);

  const checkInitialPermissions = async () => {
    const permission = await smsService.checkPermissions();
    setHasPermission(permission);
    setIsListening(smsService.getListeningStatus());
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    try {
      const granted = await smsService.requestPermissions();
      setHasPermission(granted);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartListening = async () => {
    setIsLoading(true);
    try {
      const success = await smsService.startListening();
      if (success) {
        setIsListening(true);
        setHasPermission(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopListening = () => {
    smsService.stopListening();
    setIsListening(false);
  };

  const handleRefreshPermissions = async () => {
    setIsLoading(true);
    try {
      const permission = await smsService.forceRefreshPermissions();
      setHasPermission(permission);
      setIsListening(smsService.getListeningStatus());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Transaction Detection
        </CardTitle>
        <CardDescription>
          Automatically detect and add transactions from SMS messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="text-sm">Permission Status:</span>
          <Badge variant={hasPermission ? "default" : "destructive"}>
            {hasPermission ? "Granted" : "Not Granted"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">Detection Status:</span>
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          {!hasPermission && (
            <Button 
              onClick={handleRequestPermissions} 
              disabled={isLoading}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Request SMS Permissions
            </Button>
          )}

          {hasPermission && !isListening && (
            <Button 
              onClick={handleStartListening} 
              disabled={isLoading}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Start SMS Detection
            </Button>
          )}

          {isListening && (
            <Button 
              onClick={handleStopListening} 
              variant="outline"
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop SMS Detection
            </Button>
          )}

          <Button 
            onClick={handleRefreshPermissions} 
            variant="ghost" 
            disabled={isLoading}
            className="w-full"
          >
            Refresh Status
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            This feature automatically detects bank transaction SMS messages and adds them to your expense tracker.
            {!hasPermission && " Please grant SMS permissions to enable this feature."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
