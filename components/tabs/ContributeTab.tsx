"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Calendar,
  MapPin,
  Upload,
  Users,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function ContributeTab() {
  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          Contribute an Event
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Share your Web3 event with the world and connect with thousands of enthusiasts
        </p>
        
        <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
          <Sparkles className="h-4 w-4 mr-1" />
          Help grow the Web3 community
        </Badge>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reach Thousands</h3>
            <p className="text-gray-600">
              Connect with Web3 enthusiasts, developers, and investors worldwide
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Submission</h3>
            <p className="text-gray-600">
              Simple form to submit your event details and get featured quickly
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Visibility</h3>
            <p className="text-gray-600">
              Your event will be discoverable by location, type, and date
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Submit New Event */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Submit New Event
              </h3>
              
              <p className="text-gray-600 mb-6">
                Host a conference, hackathon, meetup, or workshop? Share it with the community.
              </p>
              
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => {
                  // TODO: Navigate to event submission form
                  console.log("Navigate to event submission form");
                }}
              >
                <Upload className="h-5 w-5 mr-2" />
                Submit Event
              </Button>
            </div>
          </div>

          {/* Bulk Import */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Bulk Import Events
              </h3>
              
              <p className="text-gray-600 mb-6">
                Organizing multiple events? Upload a CSV file with all your events at once.
              </p>
              
              <Button 
                size="lg" 
                variant="outline"
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => {
                  // TODO: Navigate to bulk import
                  console.log("Navigate to bulk import");
                }}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Bulk Import
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Submission Guidelines
          </h3>
          
          <div className="space-y-3 text-gray-600">
            <p>• Events must be related to Web3, blockchain, or cryptocurrency</p>
            <p>• Include accurate date, time, and location information</p>
            <p>• Provide a clear description and agenda if available</p>
            <p>• Add relevant tags and categories for better discoverability</p>
            <p>• Events are reviewed within 24-48 hours before going live</p>
          </div>
          
          <div className="mt-6">
            <Button variant="outline" className="text-gray-600">
              <ArrowRight className="h-4 w-4 mr-2" />
              View Full Guidelines
            </Button>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Need help or have questions about submitting your event?
        </p>
        <Button variant="outline">
          Contact Support
        </Button>
      </div>
    </div>
  );
} 