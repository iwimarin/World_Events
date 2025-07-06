"use client";

import { ReactNode } from "react";
import MiniKitProvider from "./minikit-provider";

interface ConditionalMiniKitProviderProps {
  children: ReactNode;
}

export default function ConditionalMiniKitProvider({
  children,
}: ConditionalMiniKitProviderProps) {
  // Check if we're in Mini App mode via environment variable
  const isMiniApp = process.env.NEXT_PUBLIC_MINI_APP_MODE === "true";
  
  // If in Mini App mode, wrap with MiniKitProvider
  if (isMiniApp) {
    return <MiniKitProvider>{children}</MiniKitProvider>;
  }
  
  // Otherwise, just return children directly
  return <>{children}</>;
} 