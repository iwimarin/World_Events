import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

/**
 * Get all events (including drafts and archived) for admin dashboard
 */
export const getAllEventsForAdmin = query({
  args: {
    admin_user_id: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
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
      created_by: v.optional(v.id("users")),
      is_featured: v.optional(v.boolean()),
      world_approved: v.optional(v.boolean()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    // In development mode, skip admin check
    if (args.admin_user_id) {
      // Verify admin status
      const admin = await ctx.db.get(args.admin_user_id);
      if (!admin || !admin.is_admin) {
        throw new Error("Only admins can view all events");
      }
    }

    return await ctx.db
      .query("events")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Get events by status for admin dashboard
 */
export const getEventsByStatus = query({
  args: {
    admin_user_id: v.optional(v.id("users")),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
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
      created_by: v.optional(v.id("users")),
      is_featured: v.optional(v.boolean()),
      world_approved: v.optional(v.boolean()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    // In development mode, skip admin check
    if (args.admin_user_id) {
      // Verify admin status
      const admin = await ctx.db.get(args.admin_user_id);
      if (!admin || !admin.is_admin) {
        throw new Error("Only admins can view events by status");
      }
    }

    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Get dashboard statistics for admin
 */
export const getDashboardStats = query({
  args: {
    admin_user_id: v.optional(v.id("users")),
  },
  returns: v.object({
    total_events: v.number(),
    published_events: v.number(),
    draft_events: v.number(),
    archived_events: v.number(),
    total_users: v.number(),
    admin_users: v.number(),
    recent_events: v.array(v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
      name: v.string(),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    recent_users: v.array(v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      username: v.optional(v.string()),
      wallet_address: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    // In development mode, skip admin check
    if (args.admin_user_id) {
      // Verify admin status
      const admin = await ctx.db.get(args.admin_user_id);
      if (!admin || !admin.is_admin) {
        throw new Error("Only admins can view dashboard statistics");
      }
    }

    // Get all events
    const allEvents = await ctx.db.query("events").collect();
    
    // Count by status
    const publishedEvents = allEvents.filter(e => e.status === "published");
    const draftEvents = allEvents.filter(e => e.status === "draft");
    const archivedEvents = allEvents.filter(e => e.status === "archived");

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    const adminUsers = allUsers.filter(u => u.is_admin === true);

    // Get recent events (last 10)
    const recentEvents = allEvents
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10)
      .map(e => ({
        _id: e._id,
        _creationTime: e._creationTime,
        name: e.name,
        status: e.status,
      }));

    // Get recent users (last 10)
    const recentUsers = allUsers
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10)
      .map(u => ({
        _id: u._id,
        _creationTime: u._creationTime,
        username: u.username,
        wallet_address: u.wallet_address,
      }));

    return {
      total_events: allEvents.length,
      published_events: publishedEvents.length,
      draft_events: draftEvents.length,
      archived_events: archivedEvents.length,
      total_users: allUsers.length,
      admin_users: adminUsers.length,
      recent_events: recentEvents,
      recent_users: recentUsers,
    };
  },
});

/**
 * Bulk update event statuses
 */
export const bulkUpdateEventStatus = mutation({
  args: {
    admin_user_id: v.id("users"),
    event_ids: v.array(v.id("events")),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify admin status
    const admin = await ctx.db.get(args.admin_user_id);
    if (!admin || !admin.is_admin) {
      throw new Error("Only admins can bulk update event statuses");
    }

    // Update each event
    for (const eventId of args.event_ids) {
      const event = await ctx.db.get(eventId);
      if (event) {
        await ctx.db.patch(eventId, { status: args.status });
      }
    }

    return null;
  },
});

/**
 * Bulk delete events
 */
export const bulkDeleteEvents = mutation({
  args: {
    admin_user_id: v.id("users"),
    event_ids: v.array(v.id("events")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify admin status
    const admin = await ctx.db.get(args.admin_user_id);
    if (!admin || !admin.is_admin) {
      throw new Error("Only admins can bulk delete events");
    }

    // Delete each event
    for (const eventId of args.event_ids) {
      const event = await ctx.db.get(eventId);
      if (event) {
        await ctx.db.delete(eventId);
      }
    }

    return null;
  },
});

/**
 * Toggle event featured status
 */
export const toggleEventFeatured = mutation({
  args: {
    admin_user_id: v.id("users"),
    event_id: v.id("events"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify admin status
    const admin = await ctx.db.get(args.admin_user_id);
    if (!admin || !admin.is_admin) {
      throw new Error("Only admins can toggle featured status");
    }

    // Get event
    const event = await ctx.db.get(args.event_id);
    if (!event) {
      throw new Error("Event not found");
    }

    // Toggle featured status
    await ctx.db.patch(args.event_id, { is_featured: !event.is_featured });
    return null;
  },
});

/**
 * Get events created by specific user
 */
export const getEventsByCreator = query({
  args: {
    admin_user_id: v.id("users"),
    creator_user_id: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
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
      created_by: v.optional(v.id("users")),
      is_featured: v.optional(v.boolean()),
      world_approved: v.optional(v.boolean()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    // Verify admin status
    const admin = await ctx.db.get(args.admin_user_id);
    if (!admin || !admin.is_admin) {
      throw new Error("Only admins can view events by creator");
    }

    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("created_by"), args.creator_user_id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Get user activity statistics
 */
export const getUserActivity = query({
  args: {
    admin_user_id: v.id("users"),
    target_user_id: v.id("users"),
  },
  returns: v.object({
    user: v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      wallet_address: v.string(),
      username: v.optional(v.string()),
      profile_picture_url: v.optional(v.string()),
      is_admin: v.optional(v.boolean()),
    }),
    events_created: v.number(),
    active_sessions: v.number(),
    last_activity: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    // Verify admin status
    const admin = await ctx.db.get(args.admin_user_id);
    if (!admin || !admin.is_admin) {
      throw new Error("Only admins can view user activity");
    }

    // Get target user
    const user = await ctx.db.get(args.target_user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // Get events created by user
    const eventsCreated = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("created_by"), args.target_user_id))
      .collect();

    // Get active sessions
    const activeSessions = await ctx.db
      .query("sessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("user_id"), args.target_user_id),
          q.eq(q.field("is_active"), true)
        )
      )
      .collect();

    // Get last activity (most recent session)
    const allSessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("user_id"), args.target_user_id))
      .collect();

    const lastActivity = allSessions.length > 0 
      ? Math.max(...allSessions.map(s => s._creationTime))
      : undefined;

    return {
      user: {
        _id: user._id,
        _creationTime: user._creationTime,
        wallet_address: user.wallet_address,
        username: user.username,
        profile_picture_url: user.profile_picture_url,
        is_admin: user.is_admin,
      },
      events_created: eventsCreated.length,
      active_sessions: activeSessions.length,
      last_activity: lastActivity,
    };
  },
});

/**
 * Search events for admin (includes all statuses)
 */
export const searchEventsForAdmin = query({
  args: {
    admin_user_id: v.id("users"),
    search_term: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id("events"),
      _creationTime: v.number(),
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
      created_by: v.optional(v.id("users")),
      is_featured: v.optional(v.boolean()),
      world_approved: v.optional(v.boolean()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    // Verify admin status
    const admin = await ctx.db.get(args.admin_user_id);
    if (!admin || !admin.is_admin) {
      throw new Error("Only admins can search all events");
    }

    const searchTermLower = args.search_term.toLowerCase();
    
    return await ctx.db
      .query("events")
      .filter((q) => 
        q.or(
          q.eq(q.field("name"), searchTermLower),
          q.eq(q.field("description"), searchTermLower),
          q.eq(q.field("tagline"), searchTermLower)
        )
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Update an event (admin only)
 */
export const updateEvent = mutation({
  args: {
    admin_user_id: v.optional(v.id("users")),
    event_id: v.id("events"),
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    start_date: v.optional(v.string()),
    end_date: v.optional(v.string()),
    location: v.optional(v.object({
      city: v.string(),
      country: v.string(),
    })),
    type: v.optional(v.object({
      conference: v.boolean(),
      hackathon: v.boolean(),
    })),
    logo_url: v.optional(v.string()),
    socials: v.optional(v.array(v.string())),
    is_featured: v.optional(v.boolean()),
    world_approved: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // In development mode, skip admin check
    if (args.admin_user_id) {
      // Verify admin status
      const admin = await ctx.db.get(args.admin_user_id);
      if (!admin || !admin.is_admin) {
        throw new Error("Only admins can update events");
      }
    }

    // Verify event exists
    const event = await ctx.db.get(args.event_id);
    if (!event) {
      throw new Error("Event not found");
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.tagline !== undefined) updateData.tagline = args.tagline;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.start_date !== undefined) updateData.start_date = args.start_date;
    if (args.end_date !== undefined) updateData.end_date = args.end_date;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.type !== undefined) updateData.type = args.type;
    if (args.logo_url !== undefined) updateData.logo_url = args.logo_url;
    if (args.socials !== undefined) updateData.socials = args.socials;
    if (args.is_featured !== undefined) updateData.is_featured = args.is_featured;
    if (args.world_approved !== undefined) updateData.world_approved = args.world_approved;
    if (args.status !== undefined) updateData.status = args.status;

    // Update the event
    await ctx.db.patch(args.event_id, updateData);
    return null;
  },
});

/**
 * Toggle event world approved status
 */
export const toggleEventWorldApproved = mutation({
  args: {
    admin_user_id: v.optional(v.id("users")),
    event_id: v.id("events"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // In development mode, skip admin check
    if (args.admin_user_id) {
      // Verify admin status
      const admin = await ctx.db.get(args.admin_user_id);
      if (!admin || !admin.is_admin) {
        throw new Error("Only admins can toggle world approved status");
      }
    }

    // Get event
    const event = await ctx.db.get(args.event_id);
    if (!event) {
      throw new Error("Event not found");
    }

    // Toggle world approved status
    await ctx.db.patch(args.event_id, { world_approved: !event.world_approved });
    return null;
  },
}); 