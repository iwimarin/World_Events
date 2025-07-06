import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

/**
 * Get all bookmarked events for a user
 */
export const getUserBookmarks = query({
  args: {
    user_id: v.id("users"),
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
      bookmark_id: v.id("bookmarks"),
      bookmarked_at: v.number(),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // Get bookmarks with event details
    const bookmarksResult = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
      .order("desc")
      .paginate(args.paginationOpts);

    // Get event details for each bookmark
    const eventsWithBookmarks = [];
    for (const bookmark of bookmarksResult.page) {
      const event = await ctx.db.get(bookmark.event_id);
      if (event) {
        eventsWithBookmarks.push({
          ...event,
          bookmark_id: bookmark._id,
          bookmarked_at: bookmark._creationTime,
        });
      }
    }

    return {
      page: eventsWithBookmarks,
      isDone: bookmarksResult.isDone,
      continueCursor: bookmarksResult.continueCursor,
      pageStatus: bookmarksResult.pageStatus,
      splitCursor: bookmarksResult.splitCursor,
    };
  },
});

/**
 * Check if an event is bookmarked by a user
 */
export const isEventBookmarked = query({
  args: {
    user_id: v.id("users"),
    event_id: v.id("events"),
  },
  returns: v.object({
    is_bookmarked: v.boolean(),
    bookmark_id: v.optional(v.id("bookmarks")),
  }),
  handler: async (ctx, args) => {
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_event", (q) => 
        q.eq("user_id", args.user_id).eq("event_id", args.event_id)
      )
      .unique();

    return {
      is_bookmarked: !!bookmark,
      bookmark_id: bookmark?._id,
    };
  },
});

/**
 * Get bookmark status for multiple events at once
 */
export const getBookmarkStatusForEvents = query({
  args: {
    user_id: v.id("users"),
    event_ids: v.array(v.id("events")),
  },
  returns: v.array(v.object({
    event_id: v.id("events"),
    is_bookmarked: v.boolean(),
    bookmark_id: v.optional(v.id("bookmarks")),
  })),
  handler: async (ctx, args) => {
    const results = [];
    
    for (const eventId of args.event_ids) {
      const bookmark = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_and_event", (q) => 
          q.eq("user_id", args.user_id).eq("event_id", eventId)
        )
        .unique();

      results.push({
        event_id: eventId,
        is_bookmarked: !!bookmark,
        bookmark_id: bookmark?._id,
      });
    }

    return results;
  },
});

/**
 * Add a bookmark for an event
 */
export const addBookmark = mutation({
  args: {
    user_id: v.id("users"),
    event_id: v.id("events"),
  },
  returns: v.id("bookmarks"),
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify event exists
    const event = await ctx.db.get(args.event_id);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if bookmark already exists
    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_event", (q) => 
        q.eq("user_id", args.user_id).eq("event_id", args.event_id)
      )
      .unique();

    if (existingBookmark) {
      throw new Error("Event is already bookmarked");
    }

    // Create bookmark
    return await ctx.db.insert("bookmarks", {
      user_id: args.user_id,
      event_id: args.event_id,
    });
  },
});

/**
 * Remove a bookmark for an event
 */
export const removeBookmark = mutation({
  args: {
    user_id: v.id("users"),
    event_id: v.id("events"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find the bookmark
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_event", (q) => 
        q.eq("user_id", args.user_id).eq("event_id", args.event_id)
      )
      .unique();

    if (!bookmark) {
      throw new Error("Bookmark not found");
    }

    // Delete the bookmark
    await ctx.db.delete(bookmark._id);
    return null;
  },
});

/**
 * Toggle bookmark status for an event
 */
export const toggleBookmark = mutation({
  args: {
    user_id: v.id("users"),
    event_id: v.id("events"),
  },
  returns: v.object({
    is_bookmarked: v.boolean(),
    bookmark_id: v.optional(v.id("bookmarks")),
  }),
  handler: async (ctx, args) => {
    // Check if bookmark already exists
    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_event", (q) => 
        q.eq("user_id", args.user_id).eq("event_id", args.event_id)
      )
      .unique();

    if (existingBookmark) {
      // Remove bookmark
      await ctx.db.delete(existingBookmark._id);
      return {
        is_bookmarked: false,
        bookmark_id: undefined,
      };
    } else {
      // Verify user and event exist
      const user = await ctx.db.get(args.user_id);
      if (!user) {
        throw new Error("User not found");
      }

      const event = await ctx.db.get(args.event_id);
      if (!event) {
        throw new Error("Event not found");
      }

      // Create bookmark
      const bookmarkId = await ctx.db.insert("bookmarks", {
        user_id: args.user_id,
        event_id: args.event_id,
      });

      return {
        is_bookmarked: true,
        bookmark_id: bookmarkId,
      };
    }
  },
});

/**
 * Get bookmark count for an event
 */
export const getEventBookmarkCount = query({
  args: {
    event_id: v.id("events"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_event_id", (q) => q.eq("event_id", args.event_id))
      .collect();

    return bookmarks.length;
  },
});

/**
 * Get bookmark counts for multiple events
 */
export const getBookmarkCountsForEvents = query({
  args: {
    event_ids: v.array(v.id("events")),
  },
  returns: v.array(v.object({
    event_id: v.id("events"),
    bookmark_count: v.number(),
  })),
  handler: async (ctx, args) => {
    const results = [];
    
    for (const eventId of args.event_ids) {
      const bookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_event_id", (q) => q.eq("event_id", eventId))
        .collect();

      results.push({
        event_id: eventId,
        bookmark_count: bookmarks.length,
      });
    }

    return results;
  },
}); 