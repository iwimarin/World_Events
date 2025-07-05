"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// For now, we'll use a placeholder URL. In production, this should be set via environment variables
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud";

const convex = new ConvexReactClient(CONVEX_URL);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
} 