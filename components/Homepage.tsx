"use client";

import { useState, useEffect } from "react";
import BottomNavigation from "./BottomNavigation";
import EventsTab from "./tabs/EventsTab";
import ContributeTab from "./tabs/ContributeTab";
import BookmarksTab from "./tabs/BookmarksTab";
import ProfileTab from "./tabs/ProfileTab";
import AdminTab from "./tabs/AdminTab";

export default function Homepage() {
  const [currentTab, setCurrentTab] = useState("events");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setIsAuthenticated(true);
            setUser(data.user);
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
        return <EventsTab user={user} isAuthenticated={isAuthenticated} />;
      case "contribute":
        return <ContributeTab />;
      case "bookmarks":
        return <BookmarksTab user={user} isAuthenticated={isAuthenticated} />;
      case "profile":
        return <ProfileTab />;
      case "admin":
        return <AdminTab user={user} isAuthenticated={isAuthenticated} />;
      default:
        return <EventsTab user={user} isAuthenticated={isAuthenticated} />;
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