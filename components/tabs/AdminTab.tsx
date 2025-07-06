"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Calendar as CalendarIcon, 
  Users, 
  TrendingUp,
  Eye,
  Archive,
  Settings,
  Shield,
  Crown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, BarChart3, Clock, User } from "lucide-react";

// List of countries for the dropdown
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", 
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", 
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", 
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", 
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", 
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", 
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", 
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", 
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", 
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", 
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", 
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", 
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Define the User type based on the API response
interface User {
  id: Id<"users">;
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
  isAdmin: boolean;
  isNewUser: boolean;
}

interface AdminTabProps {
  user?: User;
  isAuthenticated: boolean;
}

// Bootstrap Admin Component
function BootstrapAdmin({ user }: { user: User }) {
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [message, setMessage] = useState("");
  const bootstrapFirstAdmin = useMutation(api.auth.bootstrapFirstAdmin);

  const handleBootstrap = async () => {
    setIsBootstrapping(true);
    setMessage("");

    try {
      const result = await bootstrapFirstAdmin({
        wallet_address: user.walletAddress,
      });

      setMessage(result.message);
      
      if (result.success) {
        // Refresh the page after successful bootstrap
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setMessage("Failed to bootstrap admin: " + (error as Error).message);
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <span>Bootstrap Admin</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Welcome!</strong> You're authenticated but not an admin yet.
            </p>
            <p className="mb-4">
              Since there are no admin users in the system, you can bootstrap yourself as the first admin.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Your wallet:</strong> {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('Successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <Button
            onClick={handleBootstrap}
            disabled={isBootstrapping}
            className="w-full"
          >
            {isBootstrapping ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Bootstrapping...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Become First Admin
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500">
            <p>
              <strong>Note:</strong> This only works if there are no existing admins in the system. 
              After the first admin is created, new admins must be set by existing admins.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminTab({ user, isAuthenticated }: AdminTabProps) {
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Id<"events">[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Id<"events"> | null>(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  // Check authentication and admin status
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're in development mode
        const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        setIsDevelopmentMode(isDev);
        
        // Check if user is authenticated and has admin privileges
        if (!isAuthenticated || !user) {
          setError("Authentication required. Please log in to access the admin panel.");
          setIsLoading(false);
          return;
        }
        
        // If user is not admin and not in development mode, show bootstrap option
        if (!user.isAdmin && !isDev) {
          setError(null); // Clear error for bootstrap flow
          setIsLoading(false);
          return;
        }
        
        // Set the current user ID
        setCurrentUserId(user.id);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to initialize admin panel");
        setIsLoading(false);
      }
    };
    init();
  }, [isAuthenticated, user]);

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
  const createEvent = useMutation(api.admin.createEvent);
  const updateEvent = useMutation(api.admin.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const toggleFeatured = useMutation(api.admin.toggleEventFeatured);
  const toggleWorldApproved = useMutation(api.admin.toggleEventWorldApproved);
  const bulkUpdateStatus = useMutation(api.admin.bulkUpdateEventStatus);
  const bulkDelete = useMutation(api.admin.bulkDeleteEvents);

  // Loading state
  if (isLoading) {
    return (
      <div className="pb-20 min-h-screen bg-gray-50 p-8">
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

  // Error state (authentication required)
  if (error) {
    return (
      <div className="pb-20 min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bootstrap admin flow (user is authenticated but not admin)
  if (isAuthenticated && user && !user.isAdmin && !isDevelopmentMode) {
    return <BootstrapAdmin user={user} />;
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

  const handleToggleWorldApproved = async (eventId: Id<"events">) => {
    try {
      await toggleWorldApproved({
        admin_user_id: isDevelopmentMode ? undefined : (currentUserId || undefined),
        event_id: eventId
      });
    } catch (err) {
      console.error("Failed to toggle world approved:", err);
    }
  };

  const handleEditSubmit = async (eventData: any) => {
    if (!editingEvent) return;
    
    try {
      await updateEvent({
        admin_user_id: isDevelopmentMode ? undefined : currentUserId,
        event_id: editingEvent,
        ...eventData
      });
      setEditingEvent(null);
    } catch (err) {
      console.error("Failed to update event:", err);
      alert("Failed to update event. Please try again.");
    }
  };

  const handleCreateSubmit = async (eventData: any) => {
    try {
      await createEvent({
        admin_user_id: isDevelopmentMode ? undefined : (currentUserId || undefined),
        ...eventData
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Failed to create event. Please try again.");
    }
  };

  // Get the event being edited
  const eventToEdit = allEvents?.page?.find(event => event._id === editingEvent);

  return (
    <div className="pb-20"> {/* Add bottom padding for navigation */}
      {/* Edit Modal */}
      {editingEvent && eventToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <EditEventForm
                event={eventToEdit}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingEvent(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <EditEventForm
                event={{}}
                onSubmit={handleCreateSubmit}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
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
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
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
                    <p className="text-2xl font-bold text-[#3FDBED]">
                      {dashboardStats?.total_users || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-[#3FDBED]" />
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
                          {event.world_approved && (
                            <Badge variant="outline" className="text-black border-black">
                              <span className="mr-1">✓</span>
                              World Approved
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
                        title="Toggle Featured"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleWorldApproved(event._id)}
                        title="Toggle World Approved"
                        className={event.world_approved ? "bg-gray-100 text-black border-black" : ""}
                      >
                        <span className="text-sm font-bold">✓</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEvent(event._id)}
                        title="Edit Event"
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
                        title="Delete Event"
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
    </div>
  );
}

// Edit Event Form Component
function EditEventForm({ event, onSubmit, onCancel }: {
  event: any;
  onSubmit: (eventData: any) => void;
  onCancel: () => void;
}) {
  const isCreating = !event._id;
  const [formData, setFormData] = useState({
    name: event.name || "",
    tagline: event.tagline || "",
    description: event.description || "",
    start_date: event.start_date || "",
    end_date: event.end_date || "",
    location: {
      city: event.location?.city || "",
      country: event.location?.country || "",
    },
    type: {
      conference: event.type?.conference || false,
      hackathon: event.type?.hackathon || false,
    },
    logo_url: event.logo_url || "",
    socials: event.socials || [],
    is_featured: event.is_featured || false,
    world_approved: event.world_approved || false,
    status: event.status || "draft",
  });

  const [socialsText, setSocialsText] = useState(
    event.socials?.join("\n") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      socials: socialsText.split("\n").filter((url: string) => url.trim().length > 0),
    };

    onSubmit(processedData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <Input
              value={formData.tagline}
              onChange={(e) => handleInputChange("tagline", e.target.value)}
              placeholder="Enter event tagline"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter event description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <Input
              value={formData.logo_url}
              onChange={(e) => handleInputChange("logo_url", e.target.value)}
              placeholder="https://example.com/logo.jpg"
              type="url"
            />
          </div>
        </div>

        {/* Location and Dates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Location & Dates</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <Input
              value={formData.location.city}
              onChange={(e) => handleNestedInputChange("location", "city", e.target.value)}
              placeholder="Enter city"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={formData.location.country}
              onChange={(e) => handleNestedInputChange("location", "country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <DateTimePicker
            label="Start Date"
            value={formData.start_date}
            onChange={(value) => handleInputChange("start_date", value)}
            required
          />

          <DateTimePicker
            label="End Date"
            value={formData.end_date}
            onChange={(value) => handleInputChange("end_date", value)}
            required
          />
        </div>
      </div>

      {/* Event Type */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Type</h3>
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.type.conference}
              onChange={(e) => handleNestedInputChange("type", "conference", e.target.checked)}
              className="mr-2"
            />
            Conference
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.type.hackathon}
              onChange={(e) => handleNestedInputChange("type", "hackathon", e.target.checked)}
              className="mr-2"
            />
            Hackathon
          </label>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Social Links (one per line)
        </label>
        <textarea
          value={socialsText}
          onChange={(e) => setSocialsText(e.target.value)}
          placeholder="https://twitter.com/example&#10;https://github.com/example"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status and Featured */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => handleInputChange("is_featured", e.target.checked)}
              className="mr-2"
            />
            Featured Event
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.world_approved}
              onChange={(e) => handleInputChange("world_approved", e.target.checked)}
              className="mr-2"
            />
            <span className="flex items-center">
              <span className="mr-1">✓</span>
              World Approved
            </span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCreating ? "Create Event" : "Update Event"}
        </Button>
      </div>
    </form>
  );
}

// DateTimeInput Component
function DateTimeInput({ 
  label, 
  value, 
  onChange, 
  required = false 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  // Helper function to safely convert date
  const formatDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      // Format: YYYY-MM-DDTHH:MM
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  // Helper function to convert back to ISO string
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      onChange("");
      return;
    }
    try {
      const date = new Date(inputValue);
      onChange(date.toISOString());
    } catch {
      onChange("");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Input
        type="datetime-local"
        value={formatDateTimeLocal(value)}
        onChange={handleChange}
        required={required}
      />
    </div>
  );
}

// Simplified DatePicker with Calendar
function DateTimePicker({ 
  label, 
  value, 
  onChange, 
  required = false 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize date from value
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      } catch {
        setSelectedDate(undefined);
      }
    }
  }, [value]);

  // Handle clicking outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Set to noon to avoid timezone issues
      date.setHours(12, 0, 0, 0);
      onChange(date.toISOString());
    } else {
      onChange("");
    }
    setShowCalendar(false);
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return "Select date";
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative" ref={calendarRef}>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayDate()}
        </Button>
        
        {/* Calendar Popup */}
        {showCalendar && (
          <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </div>
        )}
      </div>
      
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="hidden"
          value={value}
          required
        />
      )}
    </div>
  );
} 