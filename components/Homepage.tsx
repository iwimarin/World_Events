"use client";

import { useState, useEffect } from "react";
import BottomNavigation from "./BottomNavigation";
import EventsTab from "./tabs/EventsTab";
import ContributeTab from "./tabs/ContributeTab";
import BookmarksTab from "./tabs/BookmarksTab";
import ProfileTab from "./tabs/ProfileTab";

export default function Homepage() {
  const [currentTab, setCurrentTab] = useState("events");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setIsAdmin(data.user.isAdmin || false);
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  const renderCurrentTab = () => {
    switch (currentTab) {
      case "events":
        return <EventsTab />;
      case "contribute":
        return <ContributeTab />;
      case "bookmarks":
        return <BookmarksTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <EventsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Tab Content */}
      <div className="min-h-screen">
        {renderCurrentTab()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
      />
    </div>
  );
} 