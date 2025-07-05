"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Calendar, 
  Users, 
  TrendingUp,
  Eye,
  Archive,
  Settings
} from "lucide-react";

export default function AdminPage() {
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Id<"events">[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Id<"events"> | null>(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  // Check if we're in development mode (no real authentication)
  useEffect(() => {
    const init = async () => {
      try {
        // TODO: Get actual user ID from authentication
        // For now, we'll check if we're in development mode
        const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        
        if (isDev) {
          // In development mode, we'll skip real authentication
          setIsDevelopmentMode(true);
          setCurrentUserId(null); // Don't set a fake ID
          setIsLoading(false);
        } else {
          // In production, you would get the real user ID from authentication
          // For now, this will show an error
          setError("Authentication required. Please log in to access the admin panel.");
          setIsLoading(false);
        }
      } catch (err) {
        setError("Failed to initialize admin page");
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Auto-seed database if needed
  const needsSeeding = useQuery(api.events.needsSeeding);
  const seedDatabase = useMutation(api.events.seedSampleEvents);

  useEffect(() => {
    if (needsSeeding && isDevelopmentMode) {
      seedDatabase().then((count) => {
        if (count > 0) {
          console.log(`Seeded ${count} sample events`);
        }
      });
    }
  }, [needsSeeding, isDevelopmentMode, seedDatabase]);

  // Queries - Use real Convex data, pass undefined for admin_user_id in development mode
  const dashboardStats = useQuery(
    api.admin.getDashboardStats,
    isDevelopmentMode ? { admin_user_id: undefined } : (currentUserId ? { admin_user_id: currentUserId } : "skip")
  );

  const allEvents = useQuery(
    api.admin.getAllEventsForAdmin,
    isDevelopmentMode ? { 
      admin_user_id: undefined,
      paginationOpts: { numItems: 50, cursor: null }
    } : (currentUserId ? { 
      admin_user_id: currentUserId,
      paginationOpts: { numItems: 50, cursor: null }
    } : "skip")
  );

  // Mutations
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const toggleFeatured = useMutation(api.admin.toggleEventFeatured);
  const bulkUpdateStatus = useMutation(api.admin.bulkUpdateEventStatus);
  const bulkDelete = useMutation(api.admin.bulkDeleteEvents);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button className="mt-4" onClick={() => window.location.href = "/"}>
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter events based on search and status
  const filteredEvents = allEvents?.page?.filter((event) => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleBulkStatusUpdate = async (status: "draft" | "published" | "archived") => {
    if (isDevelopmentMode) {
      alert(`Development Mode: Would update ${selectedEvents.length} event(s) to ${status} status`);
      setSelectedEvents([]);
      return;
    }
    
    if (!currentUserId || selectedEvents.length === 0) return;
    
    try {
      await bulkUpdateStatus({
        admin_user_id: currentUserId,
        event_ids: selectedEvents,
        status
      });
      setSelectedEvents([]);
    } catch (err) {
      console.error("Failed to update events:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (isDevelopmentMode) {
      if (!confirm(`Development Mode: Would delete ${selectedEvents.length} event(s)? (This is just a demo)`)) return;
      alert("Development Mode: Events would be deleted in production");
      setSelectedEvents([]);
      return;
    }
    
    if (!currentUserId || selectedEvents.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedEvents.length} event(s)?`)) return;
    
    try {
      await bulkDelete({
        admin_user_id: currentUserId,
        event_ids: selectedEvents
      });
      setSelectedEvents([]);
    } catch (err) {
      console.error("Failed to delete events:", err);
    }
  };

  const handleToggleFeatured = async (eventId: Id<"events">) => {
    if (isDevelopmentMode) {
      alert("Development Mode: Would toggle featured status");
      return;
    }
    
    if (!currentUserId) return;
    
    try {
      await toggleFeatured({
        admin_user_id: currentUserId,
        event_id: eventId
      });
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage events and monitor activity</p>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Back to Site
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats?.total_events || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats?.published_events || 0}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardStats?.draft_events || 0}
                  </p>
                </div>
                <Archive className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats?.total_users || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Events Management
              </CardTitle>
              <div className="flex items-center space-x-4">
                {selectedEvents.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedEvents.length} selected
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate("published")}
                    >
                      Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusUpdate("draft")}
                    >
                      Draft
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents([...selectedEvents, event._id]);
                        } else {
                          setSelectedEvents(selectedEvents.filter(id => id !== event._id));
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{event.name}</h3>
                        <Badge 
                          variant={event.status === "published" ? "default" : 
                                  event.status === "draft" ? "secondary" : "destructive"}
                        >
                          {event.status}
                        </Badge>
                        {event.is_featured && (
                          <Badge variant="outline" className="text-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.tagline}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.location.city}, {event.location.country} • {new Date(event.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleFeatured(event._id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingEvent(event._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this event?")) {
                          deleteEvent({ id: event._id, user_id: currentUserId! });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No events found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 