"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Plus,
  Bookmark,
  User,
  UserCog
} from "lucide-react";

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

const navigationItems = [
  {
    id: "events",
    label: "Events",
    icon: Calendar,
  },
  {
    id: "contribute",
    label: "Contribute", 
    icon: Plus,
  },
  {
    id: "bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
];

export default function BottomNavigation({ currentTab, onTabChange, isAdmin = false }: BottomNavigationProps) {
  const items = [
    ...navigationItems,
    ...(isAdmin ? [{
      id: "admin",
      label: "Admin",
      icon: UserCog,
    }] : [])
  ];

  const handleTabClick = (itemId: string) => {
    // All tabs now use the same navigation pattern
    onTabChange(itemId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
      {/* Safe area spacer for mobile devices */}
      <div className="safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <div className="relative">
                  <Icon 
                    className={`
                      h-6 w-6 transition-all duration-200
                      ${isActive ? 'scale-110' : 'scale-100'}
                    `}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.id === "admin" && (
                    <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 py-0 min-w-0 h-4 w-4 rounded-full flex items-center justify-center">
                      !
                    </Badge>
                  )}
                </div>
                <span 
                  className={`
                    text-xs mt-1 font-medium transition-all duration-200
                    ${isActive ? 'text-blue-600' : 'text-gray-500'}
                  `}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 