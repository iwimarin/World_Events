"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function BookmarksTab() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Mock bookmarked events data
  const bookmarkedEvents = [
    {
      id: 1,
      name: "DevConnect Istanbul 2024",
      date: "2024-11-15",
      location: "Istanbul, Turkey",
      type: "Conference",
      image: "/api/placeholder/300/200",
      saved: true,
      isUpcoming: true
    },
    {
      id: 2,
      name: "ETHGlobal Bangkok",
      date: "2024-12-01",
      location: "Bangkok, Thailand", 
      type: "Hackathon",
      image: "/api/placeholder/300/200",
      saved: true,
      isUpcoming: true
    },
    {
      id: 3,
      name: "Consensus 2024",
      date: "2024-05-29",
      location: "Austin, Texas",
      type: "Conference",
      image: "/api/placeholder/300/200",
      saved: true,
      isUpcoming: false
    }
  ];

  const filteredEvents = bookmarkedEvents.filter(event => {
    if (filter === 'upcoming') return event.isUpcoming;
    if (filter === 'past') return !event.isUpcoming;
    return true;
  });

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-[#D9F8FB] via-white to-blue-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#66E2F1] to-[#3FDBED] rounded-full flex items-center justify-center">
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
          <Badge className="bg-[#D9F8FB] text-[#3FDBED] border-[#66E2F1] px-4 py-2">
            <Heart className="h-4 w-4 mr-1" />
            {bookmarkedEvents.length} Saved
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
            <Calendar className="h-4 w-4 mr-1" />
            {bookmarkedEvents.filter(e => e.isUpcoming).length} Upcoming
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
                  ? 'bg-[#3FDBED] text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({bookmarkedEvents.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                filter === 'upcoming' 
                  ? 'bg-[#3FDBED] text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming ({bookmarkedEvents.filter(e => e.isUpcoming).length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                filter === 'past' 
                  ? 'bg-[#3FDBED] text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past ({bookmarkedEvents.filter(e => !e.isUpcoming).length})
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarked Events */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredEvents.length > 0 ? (
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="md:flex">
                  {/* Event Image */}
                  <div className="md:w-1/3">
                    <div className="h-48 md:h-full bg-gradient-to-br from-[#66E2F1] to-[#3FDBED] flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-[#D9F8FB] text-[#3FDBED] border-[#66E2F1]">
                            {event.type}
                          </Badge>
                          {event.isUpcoming && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {event.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                          <Bookmark className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Saved {Math.floor(Math.random() * 30) + 1} days ago
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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
                className="bg-[#3FDBED] hover:bg-[#66E2F1]"
              >
                <Search className="h-4 w-4 mr-2" />
                Explore Events
              </Button>
            </div>
          </div>
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