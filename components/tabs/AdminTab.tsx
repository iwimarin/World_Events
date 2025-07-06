"use client";

import { useEffect } from "react";
import { UserCog, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminTab() {
  useEffect(() => {
    // Redirect to admin page
    window.location.href = '/admin';
  }, []);

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCog className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Admin Panel...</h2>
        <p className="text-gray-600 mb-4">Taking you to the admin dashboard</p>
        <Button 
          onClick={() => window.location.href = '/admin'}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Go to Admin Panel
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 