
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { SmsPlugin, SMSPermissionResult } from '@/types/SMSTypes';

export class SMSPermissionManager {
  private smsPlugin?: SmsPlugin;

  constructor(smsPlugin?: SmsPlugin) {
    this.smsPlugin = smsPlugin;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: "SMS Detection Available on Mobile",
          description: "SMS auto-detection works when the app is installed on Android/iOS devices.",
        });
        return false;
      }

      if (!this.smsPlugin) {
        console.log('❌ SMS plugin not available for permission request');
        toast({
          title: "SMS Plugin Setup Required",
          description: "Please follow the setup instructions to enable SMS detection on this device.",
          variant: "destructive",
        });
        return false;
      }

      console.log('=== Starting SMS permission request ===');
      
      // Show toast to prepare user for permission dialog
      toast({
        title: "Permission Request",
        description: "Please allow SMS permissions when prompted to enable transaction detection.",
      });

      try {
        const result = await this.smsPlugin.requestPermissions();
        console.log('=== SMS permission request completed ===');
        console.log('Raw result:', JSON.stringify(result, null, 2));
        
        // Parse the result to check if permissions were granted
        const hasPermission = this.parsePermissionStatus(result);
        console.log('Parsed permission status after request:', hasPermission);
        
        if (hasPermission) {
          toast({
            title: "SMS Permission Granted",
            description: "The app can now detect transactions from SMS messages.",
          });
          return true;
        } else {
          // Check if user denied the permission
          if (result.receive === 'denied' || result.send === 'denied') {
            toast({
              title: "SMS Permissions Denied",
              description: "SMS detection requires permission to read SMS messages. You can grant this in your device settings under App Permissions.",
              variant: "destructive",
            });
          } else {
            // Wait and recheck multiple times with different strategies
            console.log('Initial check failed, starting comprehensive recheck...');
            
            const recheckStrategies = [
              { delay: 1000, name: 'Quick recheck' },
              { delay: 3000, name: 'Medium delay recheck' },
              { delay: 5000, name: 'Long delay recheck' }
            ];
            
            for (const strategy of recheckStrategies) {
              console.log(`${strategy.name} - waiting ${strategy.delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, strategy.delay));
              
              const recheckResult = await this.checkPermissions();
              console.log(`${strategy.name} result:`, recheckResult);
              
              if (recheckResult) {
                toast({
                  title: "SMS Permission Granted",
                  description: "The app can now detect transactions from SMS messages.",
                });
                return true;
              }
            }
            
            toast({
              title: "SMS Permissions Required",
              description: "Please grant SMS permissions in your device settings to enable transaction detection.",
              variant: "destructive",
            });
          }
          return false;
        }
      } catch (pluginError) {
        console.error('SMS plugin method failed:', pluginError);
        
        // Check for specific error types
        if (pluginError.message && pluginError.message.includes('not implemented')) {
          toast({
            title: "SMS Plugin Not Supported",
            description: "SMS detection is not available on this platform. Please run 'npx cap sync' to install required plugins.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "SMS Permission Error",
            description: "Unable to request SMS permissions. Plugin may need to be properly installed.",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Provide specific guidance based on error type
      if (error.message && error.message.includes('not implemented')) {
        toast({
          title: "Plugin Setup Required",
          description: "SMS plugin needs to be synced with 'npx cap sync' and the app rebuilt.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "SMS Setup Issue",
          description: "SMS plugin installation may be incomplete. Check console for details.",
          variant: "destructive",
        });
      }
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Not on native platform, returning false');
        return false;
      }

      if (!this.smsPlugin) {
        console.log('❌ SMS plugin not available for permission check');
        return false;
      }
      
      console.log('=== Checking SMS permissions ===');
      console.log('Plugin available for check:', !!this.smsPlugin);
      
      try {
        const result = await this.smsPlugin.checkPermissions();
        console.log('=== SMS permission check completed ===');
        console.log('Raw check result:', JSON.stringify(result, null, 2));
        
        const hasPermission = this.parsePermissionStatus(result);
        console.log('Final permission check result:', hasPermission);
        
        return hasPermission;
      } catch (pluginError) {
        console.error('SMS plugin check method failed:', pluginError);
        
        if (pluginError.message && pluginError.message.includes('not implemented')) {
          console.log('SMS plugin not implemented on this platform');
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return false;
    }
  }

  private parsePermissionStatus(result: SMSPermissionResult): boolean {
    if (!result) {
      console.log('No permission result to parse');
      return false;
    }

    console.log('=== Parsing permission status ===');
    console.log('Input result:', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result || {}));
    
    // Check if permissions are granted based on the actual type structure
    const hasReceivePermission = result.receive === 'granted';
    const hasSendPermission = result.send === 'granted';
    
    console.log('Parsed permissions:');
    console.log('- receive:', result.receive, '→', hasReceivePermission);
    console.log('- send:', result.send, '→', hasSendPermission);
    
    // For SMS detection, we primarily need receive permission
    const finalResult = hasReceivePermission;
    console.log('Final permission result:', finalResult);
    
    return finalResult;
  }

  // Enhanced force refresh with better error handling
  async forceRefreshPermissions(): Promise<boolean> {
    console.log('=== FORCE REFRESH PERMISSIONS STARTING ===');
    
    if (!this.smsPlugin) {
      console.log('❌ No SMS plugin available for force refresh');
      
      toast({
        title: "Plugin Setup Required",
        description: "SMS plugin needs to be installed and synced. Run 'npx cap sync' and rebuild the app.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log('✓ SMS plugin is available for force refresh');
    
    try {
      // Strategy 1: Check current permissions first
      console.log('Strategy 1: Checking current permissions');
      const currentPermissions = await this.checkPermissions();
      console.log('Current permissions:', currentPermissions);
      
      if (currentPermissions) {
        console.log('✓ Permissions already granted');
        toast({
          title: "SMS Permissions Already Granted",
          description: "SMS detection is ready to use.",
        });
        return true;
      }
      
      // Strategy 2: Request permissions if not granted
      console.log('Strategy 2: Requesting permissions since they are not granted');
      const requestResult = await this.requestPermissions();
      console.log('Permission request result:', requestResult);
      
      if (requestResult) {
        console.log('✓ Permissions granted after request');
        return true;
      }
      
      console.log('=== FORCE REFRESH COMPLETED - NO PERMISSIONS DETECTED ===');
      
      toast({
        title: "Manual Permission Required",
        description: "Please go to Settings > Apps > [App Name] > Permissions and manually enable SMS permissions.",
        variant: "destructive",
      });
      
      return false;
      
    } catch (error) {
      console.error('Force refresh error:', error);
      
      if (error.message && error.message.includes('not implemented')) {
        toast({
          title: "Platform Not Supported",
          description: "SMS detection is not available on this device platform.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Permission Check Failed",
          description: "Unable to check SMS permissions. Plugin may need to be reinstalled.",
          variant: "destructive",
        });
      }
      
      return false;
    }
  }
}
