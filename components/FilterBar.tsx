"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Calendar, MapPin, Tag } from "lucide-react";

interface FilterBarProps {
  onSearch: (searchTerm: string) => void;
  onFilterByType: (type: string) => void;
  onFilterByLocation: (location: string) => void;
  onFilterByDate: (date: string) => void;
  onClearFilters: () => void;
  activeFilters: {
    search: string;
    type: string;
    location: string;
    date: string;
  };
}

export default function FilterBar({
  onSearch,
  onFilterByType,
  onFilterByLocation,
  onFilterByDate,
  onClearFilters,
  activeFilters,
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState(activeFilters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const hasActiveFilters = Object.values(activeFilters).some(filter => filter !== "");

  const eventTypes = ["All Types", "Conference", "Hackathon"];
  const locations = [
    "All Locations",
    "Warsaw, Poland",
    "Istanbul, Turkey",
    "Nairobi, Kenya",
    "Tokyo, Japan",
    "Vienna, Austria",
    "London, United Kingdom",
    "Berlin, Germany",
    "New York, United States",
  ];
  const dates = [
    "All Dates",
    "This Week",
    "This Month",
    "Next Month",
    "This Quarter",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search events"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-20 h-12 text-base"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Event Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            Event Type
          </label>
          <Select 
            value={activeFilters.type || "All Types"} 
            onValueChange={(value) => onFilterByType(value === "All Types" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Location
          </label>
          <Select 
            value={activeFilters.location || "All Locations"} 
            onValueChange={(value) => onFilterByLocation(value === "All Locations" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            When
          </label>
          <Select 
            value={activeFilters.date || "All Dates"} 
            onValueChange={(value) => onFilterByDate(value === "All Dates" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              {dates.map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 opacity-0">
            Clear
          </label>
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full h-10 text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-600 mr-2">Active filters:</span>
          {activeFilters.search && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Search: "{activeFilters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                onClick={() => {
                  setSearchTerm("");
                  onSearch("");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {activeFilters.type && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Type: {activeFilters.type}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-green-200"
                onClick={() => onFilterByType("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {activeFilters.location && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Location: {activeFilters.location}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-purple-200"
                onClick={() => onFilterByLocation("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {activeFilters.date && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              When: {activeFilters.date}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-orange-200"
                onClick={() => onFilterByDate("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 