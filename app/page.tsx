"use client";
import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import Homepage from "@/components/Homepage";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMiniKit = async () => {
      // Debug logging
      console.log('Home page MiniKit check:', {
        windowWorldApp: typeof window !== 'undefined' ? !!(window as any).WorldApp : 'undefined',
        miniKitInstalled: MiniKit.isInstalled(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'undefined',
      });
      
      const isInstalled = MiniKit.isInstalled();
      const hasWorldApp = typeof window !== 'undefined' && !!(window as any).WorldApp;
      
      if (isInstalled || hasWorldApp) {
        setIsLoading(false);
      } else {
        setTimeout(checkMiniKit, 500);
      }
    };

    checkMiniKit();
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-blue-50 via-white to-[#D9F8FB]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Loading Web3 Events...</p>
          <p className="text-sm text-gray-600 mt-2">Connecting to MiniKit</p>
        </div>
      </main>
    );
  }

  return (
    <AuthGuard>
      <Homepage />
    </AuthGuard>
  );
}
