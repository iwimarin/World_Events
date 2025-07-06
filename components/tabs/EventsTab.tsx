"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "../EventCard";
import FilterBar from "../FilterBar";
import { 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  Sparkles,
  Globe
} from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

export default function EventsTab() {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    location: "",
    date: "",
  });

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

  const stats = {
    totalEvents: allEvents.length,
    featuredEvents: allEvents.filter(e => e.is_featured).length,
    countries: new Set(allEvents.map(e => e.location.country)).size,
    upcomingEvents: allEvents.filter(e => new Date(e.start_date) > new Date()).length,
  };

  return (
    <div className="pb-20"> {/* Add bottom padding for navigation */}
      {/* Hero Section */}
      <div className="relative bg-white text-gray-900 overflow-hidden">
        {/* Grid Pattern Background */}
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [20, 5],
            [3, 12],
            [18, 8],
          ]}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
          )}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-4 py-1">
                <Sparkles className="h-4 w-4 mr-1" />
                Web3 Events Hub
              </Badge>
            </div>
            

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Attend the World
              
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Find web3 happenings all around the globe.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Calendar className="h-8 w-8 text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
                <div className="text-gray-500">Total Events</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Star className="h-8 w-8 text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.featuredEvents}</div>
                <div className="text-gray-500">Featured</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Globe className="h-8 w-8 text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.countries}</div>
                <div className="text-gray-500">Countries</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-gray-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</div>
                <div className="text-gray-500">Upcoming</div>
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
              {filteredEvents.map((event) => (
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
                // TODO: Navigate to contribute tab
                console.log("Navigate to contribute tab");
              }}
            >
              Submit Your Event
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 