"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "./EventCard";
import FilterBar from "./FilterBar";
import { 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  Sparkles,
  Globe,
  Settings,
  Shield
} from "lucide-react";

// For now, using sample data. Later this will be replaced with Convex queries
// const events = useQuery(api.events.listEvents, { paginationOpts: { numItems: 20, cursor: null } });
// const featuredEvents = useQuery(api.events.getFeaturedEvents);

export default function Homepage() {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    location: "",
    date: "",
  });
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  // Load events from Convex
  const eventsQuery = useQuery(api.events.listEvents, { 
    paginationOpts: { numItems: 50, cursor: null } 
  });
  const featuredEventsQuery = useQuery(api.events.getFeaturedEvents);
  
  // Auto-seed database if needed
  const needsSeeding = useQuery(api.events.needsSeeding);
  const seedDatabase = useMutation(api.events.seedSampleEvents);

  useEffect(() => {
    if (needsSeeding) {
      seedDatabase().then((count) => {
        if (count > 0) {
          console.log(`Seeded ${count} sample events`);
        }
      });
    }
  }, [needsSeeding, seedDatabase]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // TODO: Replace with actual authentication check
        // For now, we'll simulate admin detection
        // In production, this would check the user's wallet address and query the database
        const isAdminUser = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Use real events data
  const allEvents = eventsQuery?.page || [];

  // Filter the events based on current filters
  const filteredEvents = useMemo(() => {
    let filtered = [...allEvents];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.tagline.toLowerCase().includes(searchLower) ||
          `${event.location.city}, ${event.location.country}`.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((event) => {
        if (filters.type === "Conference") return event.type.conference;
        if (filters.type === "Hackathon") return event.type.hackathon;
        return true;
      });
    }

    // Location filter (simplified - just matching city)
    if (filters.location && filters.location !== "All Locations") {
      filtered = filtered.filter((event) =>
        `${event.location.city}, ${event.location.country}` === filters.location
      );
    }

    // Date filter (simplified for demo)
    if (filters.date && filters.date !== "All Dates") {
      // For demo purposes, just return current results
      // In real app, this would filter by actual dates
    }

    return filtered;
  }, [filters, allEvents]);

  const featuredEvents = filteredEvents.filter((event) => event.is_featured);
  const regularEvents = filteredEvents.filter((event) => !event.is_featured);

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleFilterByType = (type: string) => {
    setFilters((prev) => ({ ...prev, type }));
  };

  const handleFilterByLocation = (location: string) => {
    setFilters((prev) => ({ ...prev, location }));
  };

  const handleFilterByDate = (date: string) => {
    setFilters((prev) => ({ ...prev, date }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: "",
      location: "",
      date: "",
    });
  };

  // Development helper - toggle admin status for testing
  const toggleAdminStatus = () => {
    const newAdminStatus = !isAdmin;
    setIsAdmin(newAdminStatus);
    localStorage.setItem('isAdmin', newAdminStatus.toString());
  };

  const stats = {
    totalEvents: allEvents.length,
    featuredEvents: allEvents.filter(e => e.is_featured).length,
    countries: new Set(allEvents.map(e => e.location.country)).size,
    upcomingEvents: allEvents.filter(e => new Date(e.start_date) > new Date()).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-1">
                <Sparkles className="h-4 w-4 mr-1" />
                Web3 Events Hub
              </Badge>
            </div>
            
            {/* Development Helper - Remove in production */}
            <div className="flex justify-center mb-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                onClick={toggleAdminStatus}
              >
                <Shield className="h-4 w-4 mr-2" />
                {isAdmin ? 'Disable Admin' : 'Enable Admin'} (Dev)
              </Button>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Discover Amazing
              <br />
              Web3 Events
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Connect with the global Web3 community. Find conferences, hackathons, and meetups happening around the world.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
                <div className="text-3xl font-bold">{stats.totalEvents}</div>
                <div className="text-blue-200">Total Events</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Star className="h-8 w-8 text-purple-200" />
                </div>
                <div className="text-3xl font-bold">{stats.featuredEvents}</div>
                <div className="text-blue-200">Featured</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Globe className="h-8 w-8 text-indigo-200" />
                </div>
                <div className="text-3xl font-bold">{stats.countries}</div>
                <div className="text-blue-200">Countries</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
                <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
                <div className="text-blue-200">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar
            onSearch={handleSearch}
            onFilterByType={handleFilterByType}
            onFilterByLocation={handleFilterByLocation}
            onFilterByDate={handleFilterByDate}
            onClearFilters={handleClearFilters}
            activeFilters={filters}
          />
        </div>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Star className="h-6 w-6 mr-2 text-purple-600" />
                  Featured Events
                </h2>
                <p className="text-gray-600 mt-1">
                  Hand-picked events you shouldn't miss
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} featured />
              ))}
            </div>
          </section>
        )}

        {/* All Events Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                All Events
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredEvents.length > 0 ? regularEvents : filteredEvents).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No events found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria to find more events.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Load More Button (for future pagination) */}
        {filteredEvents.length >= 9 && (
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="px-8">
              Load More Events
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Hosting a Web3 Event?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join our platform and reach thousands of Web3 enthusiasts. List your event and connect with the community.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => {
                // TODO: Navigate to admin page or event submission
                console.log("Navigate to event submission");
              }}
            >
              Submit Your Event
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Panel Link */}
      {isAdmin && (
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-medium">Admin Panel</span>
                <Badge className="bg-yellow-500 text-black">
                  Administrator
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                onClick={() => {
                  window.location.href = '/admin';
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Events
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 