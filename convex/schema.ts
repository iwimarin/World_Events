import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Events table based on the provided JSON schema
  events: defineTable({
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    location: v.object({
      city: v.string(),
      country: v.string(),
    }),
    type: v.object({
      conference: v.boolean(),
      hackathon: v.boolean(),
    }),
    logo_url: v.optional(v.string()),
    socials: v.array(v.string()),
    // Additional fields for admin management
    created_by: v.optional(v.id("users")),
    is_featured: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  })
    .index("by_start_date", ["start_date"])
    .index("by_location_country", ["location.country"])
    .index("by_status", ["status"])
    .index("by_created_by", ["created_by"])
    .index("by_featured", ["is_featured"]),

  // Users table for World ID authentication
  users: defineTable({
    wallet_address: v.string(),
    username: v.optional(v.string()),
    profile_picture_url: v.optional(v.string()),
    is_admin: v.optional(v.boolean()),
    permissions: v.optional(v.object({
      notifications: v.boolean(),
      contacts: v.boolean(),
    })),
    opted_into_analytics: v.optional(v.boolean()),
    world_app_version: v.optional(v.number()),
    device_os: v.optional(v.string()),
  })
    .index("by_wallet_address", ["wallet_address"])
    .index("by_username", ["username"])
    .index("by_is_admin", ["is_admin"]),

  // Sessions table for authentication management
  sessions: defineTable({
    user_id: v.id("users"),
    session_token: v.string(),
    expires_at: v.number(),
    is_active: v.boolean(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_session_token", ["session_token"])
    .index("by_expires_at", ["expires_at"]),
}); 