
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { SmsPlugin, SMSPermissionResult } from '@/types/SMSTypes';

export class SMSPermissionManager {
  private smsPlugin?: SmsPlugin;
  private cachedPermissionStatus?: boolean;
  private lastPermissionCheck = 0;
  private readonly CACHE_DURATION = 5000; // 5 seconds

  constructor(smsPlugin?: SmsPlugin) {
    this.smsPlugin = smsPlugin;
  }

  // Clear cached permission status to force fresh check
  private clearPermissionCache() {
    this.cachedPermissionStatus = undefined;
    this.lastPermissionCheck = 0;
  }

  async requestPermissions(): Promise<boolean> {
    this.clearPermissionCache(); // Clear cache before requesting
    
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
          this.cachedPermissionStatus = true;
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
            // Force multiple fresh checks since permission might have been granted outside the app
            console.log('Initial check failed, starting fresh permission verification...');
            
            const recheckAttempts = [
              { delay: 1000, name: 'Quick recheck' },
              { delay: 2000, name: 'Medium delay recheck' },
              { delay: 3000, name: 'Final recheck' }
            ];
            
            for (const attempt of recheckAttempts) {
              console.log(`${attempt.name} - waiting ${attempt.delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, attempt.delay));
              
              // Force fresh check by clearing cache
              this.clearPermissionCache();
              const recheckResult = await this.checkPermissions();
              console.log(`${attempt.name} result:`, recheckResult);
              
              if (recheckResult) {
                this.cachedPermissionStatus = true;
                toast({
                  title: "SMS Permission Detected",
                  description: "SMS permissions are now active! You can start SMS detection.",
                });
                return true;
              }
            }
            
            toast({
              title: "SMS Permissions Required",
              description: "Please ensure SMS permissions are enabled in your device settings, then tap 'Refresh Status'.",
              variant: "destructive",
            });
          }
          return false;
        }
      } catch (pluginError) {
        console.error('SMS plugin method failed:', pluginError);
        this.clearPermissionCache();
        
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
      this.clearPermissionCache();
      
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
    // Use cache if recent and valid
    const now = Date.now();
    if (this.cachedPermissionStatus !== undefined && 
        now - this.lastPermissionCheck < this.CACHE_DURATION) {
      console.log('Using cached permission status:', this.cachedPermissionStatus);
      return this.cachedPermissionStatus;
    }

    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Not on native platform, returning false');
        return false;
      }

      if (!this.smsPlugin) {
        console.log('❌ SMS plugin not available for permission check');
        return false;
      }
      
      console.log('=== Checking SMS permissions (fresh check) ===');
      console.log('Plugin available for check:', !!this.smsPlugin);
      
      try {
        const result = await this.smsPlugin.checkPermissions();
        console.log('=== SMS permission check completed ===');
        console.log('Raw check result:', JSON.stringify(result, null, 2));
        
        const hasPermission = this.parsePermissionStatus(result);
        console.log('Final permission check result:', hasPermission);
        
        // Cache the result
        this.cachedPermissionStatus = hasPermission;
        this.lastPermissionCheck = now;
        
        return hasPermission;
      } catch (pluginError) {
        console.error('SMS plugin check method failed:', pluginError);
        this.clearPermissionCache();
        
        if (pluginError.message && pluginError.message.includes('not implemented')) {
          console.log('SMS plugin not implemented on this platform');
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      this.clearPermissionCache();
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

  // Enhanced force refresh with cache clearing
  async forceRefreshPermissions(): Promise<boolean> {
    console.log('=== FORCE REFRESH PERMISSIONS STARTING ===');
    
    // Clear any cached permission status
    this.clearPermissionCache();
    
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
      // Strategy 1: Fresh permission check
      console.log('Strategy 1: Fresh permission check (cache cleared)');
      const currentPermissions = await this.checkPermissions();
      console.log('Fresh permission check result:', currentPermissions);
      
      if (currentPermissions) {
        console.log('✓ Permissions detected as granted');
        toast({
          title: "SMS Permissions Active",
          description: "SMS detection is ready to use!",
        });
        return true;
      }
      
      // Strategy 2: Request permissions if not detected
      console.log('Strategy 2: Requesting permissions since they are not detected');
      const requestResult = await this.requestPermissions();
      console.log('Permission request result:', requestResult);
      
      if (requestResult) {
        console.log('✓ Permissions granted after request');
        return true;
      }
      
      console.log('=== FORCE REFRESH COMPLETED - NO PERMISSIONS DETECTED ===');
      
      toast({
        title: "Manual Permission Check Required",
        description: "If you've granted SMS permissions in settings, please restart the app to detect them properly.",
        variant: "destructive",
      });
      
      return false;
      
    } catch (error) {
      console.error('Force refresh error:', error);
      this.clearPermissionCache();
      
      if (error.message && error.message.includes('not implemented')) {
        toast({
          title: "Platform Not Supported",
          description: "SMS detection is not available on this device platform.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Permission Check Failed",
          description: "Unable to check SMS permissions. Try restarting the app.",
          variant: "destructive",
        });
      }
      
      return false;
    }
  }
}
