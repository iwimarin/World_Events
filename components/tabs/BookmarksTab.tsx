"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "../EventCard";
import { 
  Bookmark,
  Calendar,
  MapPin,
  Filter,
  Search,
  Heart,
  Share2,
  ArrowRight
} from "lucide-react";

interface BookmarksTabProps {
  user?: {
    _id: string;
    wallet_address: string;
    username?: string;
    profile_picture_url?: string;
    is_admin?: boolean;
  };
  isAuthenticated?: boolean;
}

export default function BookmarksTab({ user, isAuthenticated }: BookmarksTabProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Get user's bookmarked events
  const bookmarkedEventsQuery = useQuery(
    api.bookmarks.getUserBookmarks,
    user && isAuthenticated ? {
      user_id: user._id as Id<"users">,
      paginationOpts: { numItems: 50, cursor: null }
    } : "skip"
  );

  const bookmarkedEvents = bookmarkedEventsQuery?.page || [];

  // Filter events based on date
  const filteredEvents = useMemo(() => {
    return bookmarkedEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filter === 'upcoming') return eventDate >= today;
      if (filter === 'past') return eventDate < today;
      return true;
    });
  }, [bookmarkedEvents, filter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = bookmarkedEvents.length;
    const upcoming = bookmarkedEvents.filter(event => {
      const eventDate = new Date(event.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }).length;
    
    return { total, upcoming, past: total - upcoming };
  }, [bookmarkedEvents]);

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Bookmark className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          Your Bookmarks
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Keep track of events you're interested in attending
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-4 py-2">
            <Heart className="h-4 w-4 mr-1" />
            {stats.total} Saved
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
            <Calendar className="h-4 w-4 mr-1" />
            {stats.upcoming} Upcoming
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                filter === 'upcoming' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                filter === 'past' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past ({stats.past})
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarked Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Show authentication required message */}
        {(!user || !isAuthenticated) && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bookmark className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-6">
                Please log in to view your bookmarked events
              </p>
              <Button 
                onClick={() => {
                  // TODO: Navigate to login
                  console.log("Navigate to login");
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                Login to Continue
              </Button>
            </div>
          </div>
        )}

        {/* Show bookmarked events */}
        {user && isAuthenticated && (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    user={user} 
                    isAuthenticated={isAuthenticated} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bookmark className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookmarks yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start exploring events and save the ones you're interested in
                  </p>
                  <Button 
                    onClick={() => {
                      // TODO: Navigate to events tab
                      console.log("Navigate to events tab");
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Explore Events
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // TODO: Export bookmarks
                console.log("Export bookmarks");
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Export Bookmarks
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // TODO: Create calendar
                console.log("Create calendar");
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 