"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, Users, ExternalLink, Twitter, Github, Bookmark, BookmarkCheck } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import Image from "next/image";

interface EventCardProps {
  event: {
    _id: string;
    name: string;
    tagline: string;
    description: string;
    start_date: string;
    end_date: string;
    location: {
      city: string;
      country: string;
    };
    type: {
      conference: boolean;
      hackathon: boolean;
    };
    logo_url?: string;
    socials: string[];
    is_featured?: boolean;
    world_approved?: boolean;
    status?: "draft" | "published" | "archived";
  };
  featured?: boolean;
  user?: {
    _id: string;
    wallet_address: string;
    username?: string;
    profile_picture_url?: string;
    is_admin?: boolean;
  };
  isAuthenticated?: boolean;
}

export default function EventCard({ event, featured = false, user, isAuthenticated }: EventCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Check if event is bookmarked by current user
  const bookmarkStatus = useQuery(
    api.bookmarks.isEventBookmarked,
    user && isAuthenticated && user._id ? {
      user_id: user._id as Id<"users">,
      event_id: event._id as Id<"events">
    } : "skip"
  );

  // Get bookmark count for this event
  const eventBookmarkCount = useQuery(
    api.bookmarks.getEventBookmarkCount,
    { event_id: event._id as Id<"events"> }
  );

  // Toggle bookmark mutation
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  // Update local state when bookmark status changes
  useEffect(() => {
    if (bookmarkStatus) {
      setIsBookmarked(bookmarkStatus.is_bookmarked);
    }
  }, [bookmarkStatus]);

  // Update bookmark count when it changes
  useEffect(() => {
    if (eventBookmarkCount !== undefined) {
      setBookmarkCount(eventBookmarkCount);
    }
  }, [eventBookmarkCount]);

  const handleBookmarkToggle = async () => {
    if (!user || !isAuthenticated || !user._id) {
      console.log("User must be authenticated to bookmark events");
      return;
    }

    try {
      const result = await toggleBookmark({
        user_id: user._id as Id<"users">,
        event_id: event._id as Id<"events">
      });
      
      setIsBookmarked(result.is_bookmarked);
      // Update bookmark count optimistically
      setBookmarkCount(prev => result.is_bookmarked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventTypes = () => {
    const types = [];
    if (event.type.conference) types.push("Conference");
    if (event.type.hackathon) types.push("Hackathon");
    return types;
  };

  const getSocialIcon = (url: string) => {
    if (url.includes("twitter.com") || url.includes("x.com")) {
      return <Twitter className="h-4 w-4" />;
    } else if (url.includes("github.com")) {
      return <Github className="h-4 w-4" />;
    } else {
      return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 ${
      event.is_featured 
        ? "border-l-[#3FDBED] bg-gradient-to-br from-[#D9F8FB] to-blue-50" 
        : "border-l-blue-500 hover:border-l-blue-600"
    } ${featured ? "md:col-span-2" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage src={event.logo_url} alt={event.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#66E2F1] to-[#3FDBED] text-white font-semibold">
                {event.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {event.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {event.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            {/* Bookmark button - Always visible */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 hover:bg-blue-100 ${
                  isBookmarked ? 'text-blue-600' : 'text-gray-400'
                }`}
                onClick={handleBookmarkToggle}
                disabled={!user || !isAuthenticated || !user._id}
                title={
                  !user || !isAuthenticated || !user._id
                    ? "Login to bookmark events"
                    : isBookmarked
                    ? "Remove bookmark"
                    : "Bookmark this event"
                }
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              {bookmarkCount > 0 && (
                <span className="text-xs text-gray-500">
                  {bookmarkCount}
                </span>
              )}
            </div>
            {/* Badges column */}
            <div className="flex flex-col space-y-1">
              {event.is_featured && (
                <Badge variant="secondary" className="bg-[#D9F8FB] text-[#3FDBED] border-[#66E2F1]">
                  Featured
                </Badge>
              )}
              {event.world_approved && (
                <Badge variant="secondary" className="bg-gray-100 text-black border-gray-300">
                  <span className="mr-1">✓</span>
                  World Approved
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <p className={`text-sm text-gray-700 ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
          {event.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {getEventTypes().map((type) => (
            <Badge 
              key={type} 
              variant="outline" 
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {type}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
            <span>
              {formatDate(event.start_date)} - {formatDate(event.end_date)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
            <span>
              {event.location.city}, {event.location.country}
            </span>
          </div>
        </div>

        {event.socials && event.socials.length > 0 && (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <div className="flex space-x-1">
              {event.socials.slice(0, 3).map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                  onClick={() => window.open(social, "_blank")}
                >
                  {getSocialIcon(social)}
                </Button>
              ))}
              {event.socials.length > 3 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{event.socials.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
                      className="w-full bg-gradient-to-r from-[#66E2F1] to-[#3FDBED] hover:from-[#3FDBED] hover:to-[#66E2F1] text-white"
          onClick={() => {
            // TODO: Navigate to event detail page
            console.log("Navigate to event:", event._id);
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 