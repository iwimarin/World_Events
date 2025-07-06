"use client";

import { useState, useEffect, useCallback } from "react";
import { WalletAuthInput, MiniKit } from "@worldcoin/minikit-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMiniKit } from "@/hooks/useMiniKit";
import { 
  Shield, 
  Globe, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

const walletAuthInput = (nonce: string): WalletAuthInput => {
  return {
    nonce,
    requestId: "0",
    expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    statement: "Authenticate to access Attend the World - your Web3 events hub",
  };
};

type User = {
  id: string;
  walletAddress: string;
  username?: string | null;
  profilePictureUrl?: string | null;
  isNewUser?: boolean;
};

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isMiniApp, isLoading: miniKitLoading, commandsAsync } = useMiniKit();

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Debug logging
  useEffect(() => {
    console.log('AuthGuard state:', {
      isMiniApp,
      miniKitLoading,
      loading,
      user: !!user,
      hasWalletAuth: !!commandsAsync.walletAuth,
      windowWorldApp: typeof window !== 'undefined' ? !!(window as any).WorldApp : 'undefined',
    });
  }, [isMiniApp, miniKitLoading, loading, user, commandsAsync]);

  const handleLogin = async () => {
    console.log('handleLogin called:', { 
      isMiniApp, 
      commandsAsync: !!commandsAsync.walletAuth,
      miniKitInstalled: MiniKit.isInstalled(),
      availableCommands: Object.keys(commandsAsync || {})
    });
    
    if (!isMiniApp) {
      setError("World ID authentication is only available in the World App");
      return;
    }

    if (!commandsAsync.walletAuth) {
      setError("Wallet authentication is not available. Please update your World App to the latest version.");
      return;
    }

    try {
      setAuthenticating(true);
      setError(null);

      // Get nonce from server
      const nonceResponse = await fetch('/api/nonce');
      if (!nonceResponse.ok) {
        throw new Error('Failed to get authentication nonce');
      }
      const { nonce } = await nonceResponse.json();

      // Perform wallet authentication
      const { finalPayload } = await commandsAsync.walletAuth(walletAuthInput(nonce));

      if (finalPayload.status === 'error') {
        throw new Error('Authentication was cancelled or failed');
      }

      // Send authentication data to server
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const loginData = await loginResponse.json();
      
      if (loginData.status === 'success' && loginData.user) {
        setUser(loginData.user);
      } else {
        throw new Error('Authentication failed');
      }

    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setAuthenticating(false);
    }
  };

  // Loading state
  if (loading || miniKitLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">
            {miniKitLoading ? "Detecting World App..." : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (user) {
    return <>{children}</>;
  }

  // Show login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <GridPattern
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
          [10, 15],
          [20, 5],
          [3, 12],
          [18, 8],
        ]}
        coloredSquares={[
          [2, 2, "#D9F8FB"],
          [6, 1, "#66E2F1"],
          [3, 4, "#D9F8FB"],
          [8, 3, "#66E2F1"],
          [11, 2, "#D9F8FB"],
          [14, 4, "#66E2F1"],
          [1, 8, "#D9F8FB"],
          [16, 6, "#66E2F1"],
          [9, 12, "#D9F8FB"],
          [13, 8, "#66E2F1"],
        ]}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Welcome to Attend the World
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your gateway to Web3 events around the globe
            </p>
            
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 mb-8">
              <Shield className="h-4 w-4 mr-1" />
              Secure Authentication Required
            </Badge>
          </div>

          {/* Authentication Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Authenticate with World ID
                </h2>
                <p className="text-gray-600 text-sm">
                  Connect your World ID wallet to access exclusive Web3 events and features
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {!isMiniApp ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-yellow-700 text-sm">
                      This app requires the World App to authenticate
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      To continue, please:
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 text-left">
                      <li>1. Download the World App</li>
                      <li>2. Create your World ID</li>
                      <li>3. Open this app within World App</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <p className="text-green-700 text-sm">
                      World App detected - Ready to authenticate
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleLogin}
                    disabled={authenticating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {authenticating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Authenticate with World ID
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Exclusive Access</p>
                  <p className="text-gray-600 text-xs">Discover curated Web3 events worldwide</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Secure & Private</p>
                  <p className="text-gray-600 text-xs">Your identity is protected with World ID</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 