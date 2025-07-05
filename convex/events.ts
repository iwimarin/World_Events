import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

/**
 * Get all published events, ordered by start date (upcoming first)
 */
export const listEvents = query({
  args: {
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
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Get featured events (for homepage highlights)
 */
export const getFeaturedEvents = query({
  args: {},
  returns: v.array(v.object({
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
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter((q) => 
        q.and(
          q.eq(q.field("is_featured"), true),
          q.eq(q.field("status"), "published")
        )
      )
      .order("asc")
      .take(6);
  },
});

/**
 * Get events by location/country
 */
export const getEventsByCountry = query({
  args: {
    country: v.string(),
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
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .filter((q) => 
        q.and(
          q.eq(q.field("location.country"), args.country),
          q.eq(q.field("status"), "published")
        )
      )
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

/**
 * Get a single event by ID
 */
export const getEvent = query({
  args: {
    id: v.id("events"),
  },
  returns: v.union(
    v.object({
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
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new event (requires authentication)
 */
export const createEvent = mutation({
  args: {
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
    created_by: v.id("users"),
    is_featured: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.created_by);
    if (!user) {
      throw new Error("User not found");
    }

    // Only admins can create events
    if (!user.is_admin) {
      throw new Error("Only admins can create events");
    }

    return await ctx.db.insert("events", {
      name: args.name,
      tagline: args.tagline,
      description: args.description,
      start_date: args.start_date,
      end_date: args.end_date,
      location: args.location,
      type: args.type,
      logo_url: args.logo_url,
      socials: args.socials,
      created_by: args.created_by,
      is_featured: args.is_featured || false,
      status: args.status || "draft",
    });
  },
});

/**
 * Update an existing event (requires authentication and admin rights)
 */
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
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
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    user_id: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify user exists and is admin
    const user = await ctx.db.get(args.user_id);
    if (!user || !user.is_admin) {
      throw new Error("Only admins can update events");
    }

    // Verify event exists
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.tagline !== undefined) updates.tagline = args.tagline;
    if (args.description !== undefined) updates.description = args.description;
    if (args.start_date !== undefined) updates.start_date = args.start_date;
    if (args.end_date !== undefined) updates.end_date = args.end_date;
    if (args.location !== undefined) updates.location = args.location;
    if (args.type !== undefined) updates.type = args.type;
    if (args.logo_url !== undefined) updates.logo_url = args.logo_url;
    if (args.socials !== undefined) updates.socials = args.socials;
    if (args.is_featured !== undefined) updates.is_featured = args.is_featured;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

/**
 * Delete an event (requires authentication and admin rights)
 */
export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
    user_id: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify user exists and is admin
    const user = await ctx.db.get(args.user_id);
    if (!user || !user.is_admin) {
      throw new Error("Only admins can delete events");
    }

    // Verify event exists
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

/**
 * Search events by name or description
 */
export const searchEvents = query({
  args: {
    searchTerm: v.string(),
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
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const searchTermLower = args.searchTerm.toLowerCase();
    
    return await ctx.db
      .query("events")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "published"),
          q.or(
            q.eq(q.field("name"), searchTermLower),
            q.eq(q.field("description"), searchTermLower),
            q.eq(q.field("tagline"), searchTermLower)
          )
        )
      )
      .order("asc")
      .paginate(args.paginationOpts);
  },
}); 