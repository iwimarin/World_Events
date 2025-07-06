"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export const useMiniKit = () => {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkMiniKit = () => {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Check if World App has set the window.WorldApp object
        const isWorldApp = !!(window as any).WorldApp;
        // Also check MiniKit's detection
        const isMiniKitInstalled = MiniKit.isInstalled();
        
        console.log('World App detection:', {
          hasWorldApp: isWorldApp,
          isMiniKitInstalled,
          userAgent: navigator.userAgent,
          miniKitCommands: isMiniKitInstalled ? Object.keys(MiniKit.commandsAsync || {}) : [],
          retryCount,
        });
        
        // If we detect World App but MiniKit is not installed, try to initialize it
        if (isWorldApp && !isMiniKitInstalled) {
          try {
            // Try to install/initialize MiniKit
            MiniKit.install();
            console.log('MiniKit installed successfully');
            // Check again after installation
            setTimeout(() => {
              const stillInstalled = MiniKit.isInstalled();
              console.log('MiniKit check after install:', stillInstalled);
              setIsMiniApp(isWorldApp || stillInstalled);
            }, 100);
          } catch (error) {
            console.error('Failed to install MiniKit:', error);
          }
        }
        
        setIsMiniApp(isWorldApp || isMiniKitInstalled);
        
        // If we're in World App but commands aren't available, retry a few times
        if (isWorldApp && (!isMiniKitInstalled || !MiniKit.commandsAsync?.walletAuth) && retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(checkMiniKit, 1000);
          return;
        }
      }
      setIsLoading(false);
    };

    // Check immediately
    checkMiniKit();
    
    // Also check after a short delay to handle async loading
    const timeoutId = setTimeout(checkMiniKit, 500);
    
    return () => clearTimeout(timeoutId);
  }, [retryCount]);
  
  return {
    isMiniApp,
    isLoading,
    isInstalled: () => isMiniApp ? MiniKit.isInstalled() : false,
    user: isMiniApp ? MiniKit.user : null,
    walletAddress: isMiniApp ? MiniKit.walletAddress : null,
    commandsAsync: {
      walletAuth: isMiniApp && MiniKit.isInstalled() ? MiniKit.commandsAsync?.walletAuth : null,
      verify: isMiniApp && MiniKit.isInstalled() ? MiniKit.commandsAsync?.verify : null,
      pay: isMiniApp && MiniKit.isInstalled() ? MiniKit.commandsAsync?.pay : null,
    },
  };
}; 