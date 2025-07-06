"use client";
import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import Homepage from "@/components/Homepage";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const isMiniApp = process.env.NEXT_PUBLIC_MINI_APP_MODE === "true";

  useEffect(() => {
    // If not in Mini App mode, skip MiniKit check
    if (!isMiniApp) {
      setIsLoading(false);
      return;
    }

    const checkMiniKit = async () => {
      const isInstalled = MiniKit.isInstalled();
      if (isInstalled) {
        setIsLoading(false);
      } else {
        setTimeout(checkMiniKit, 500);
      }
    };

    checkMiniKit();
  }, [isMiniApp]);

  if (isLoading) {
    const loadingMessage = isMiniApp ? "Connecting to MiniKit" : "Loading Web3 Events...";
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Loading Web3 Events...</p>
          <p className="text-sm text-gray-600 mt-2">{loadingMessage}</p>
        </div>
      </main>
    );
  }

  return <Homepage />;
}
