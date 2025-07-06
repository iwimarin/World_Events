import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get current user by wallet address
 */
export const getCurrentUser = query({
  args: {
    wallet_address: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("wallet_address"), args.wallet_address))
      .unique();
  },
});

/**
 * Get user by username
 */
export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .unique();
  },
});

/**
 * Create or update user profile (upsert)
 */
export const upsertUser = mutation({
  args: {
    wallet_address: v.string(),
    username: v.optional(v.string()),
    profile_picture_url: v.optional(v.string()),
    permissions: v.optional(v.object({
      notifications: v.boolean(),
      contacts: v.boolean(),
    })),
    opted_into_analytics: v.optional(v.boolean()),
    world_app_version: v.optional(v.number()),
    device_os: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("wallet_address"), args.wallet_address))
      .unique();

    if (existingUser) {
      // Update existing user
      const updates: any = {};
      if (args.username !== undefined) updates.username = args.username;
      if (args.profile_picture_url !== undefined) updates.profile_picture_url = args.profile_picture_url;
      if (args.permissions !== undefined) updates.permissions = args.permissions;
      if (args.opted_into_analytics !== undefined) updates.opted_into_analytics = args.opted_into_analytics;
      if (args.world_app_version !== undefined) updates.world_app_version = args.world_app_version;
      if (args.device_os !== undefined) updates.device_os = args.device_os;

      await ctx.db.patch(existingUser._id, updates);
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        wallet_address: args.wallet_address,
        username: args.username,
        profile_picture_url: args.profile_picture_url,
        is_admin: false, // Default to false, admins are set manually
        permissions: args.permissions,
        opted_into_analytics: args.opted_into_analytics,
        world_app_version: args.world_app_version,
        device_os: args.device_os,
      });
    }
  },
});

/**
 * Create a new session for a user
 */
export const createSession = mutation({
  args: {
    user_id: v.id("users"),
    session_token: v.string(),
    expires_at: v.number(),
  },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // Deactivate any existing active sessions for this user
    const existingSessions = await ctx.db
      .query("sessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("user_id"), args.user_id),
          q.eq(q.field("is_active"), true)
        )
      )
      .collect();

    for (const session of existingSessions) {
      await ctx.db.patch(session._id, { is_active: false });
    }

    // Create new session
    return await ctx.db.insert("sessions", {
      user_id: args.user_id,
      session_token: args.session_token,
      expires_at: args.expires_at,
      is_active: true,
    });
  },
});

/**
 * Get session by token
 */
export const getSessionByToken = query({
  args: {
    session_token: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("sessions"),
      _creationTime: v.number(),
      user_id: v.id("users"),
      session_token: v.string(),
      expires_at: v.number(),
      is_active: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("session_token"), args.session_token))
      .unique();
  },
});

/**
 * Validate session and get user
 */
export const validateSession = query({
  args: {
    session_token: v.string(),
  },
  returns: v.union(
    v.object({
      user: v.object({
        _id: v.id("users"),
        _creationTime: v.number(),
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
      }),
      session: v.object({
        _id: v.id("sessions"),
        _creationTime: v.number(),
        user_id: v.id("users"),
        session_token: v.string(),
        expires_at: v.number(),
        is_active: v.boolean(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // Get session
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("session_token"), args.session_token))
      .unique();

    if (!session) {
      return null;
    }

    // Check if session is active and not expired
    const now = Date.now();
    if (!session.is_active || session.expires_at < now) {
      return null;
    }

    // Get user
    const user = await ctx.db.get(session.user_id);
    if (!user) {
      return null;
    }

    return {
      user,
      session,
    };
  },
});

/**
 * Invalidate session (logout)
 */
export const invalidateSession = mutation({
  args: {
    session_token: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("session_token"), args.session_token))
      .unique();

    if (session) {
      await ctx.db.patch(session._id, { is_active: false });
    }

    return null;
  },
});

/**
 * Clean up expired sessions (should be called periodically)
 */
export const cleanupExpiredSessions = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiredSessions = await ctx.db
      .query("sessions")
      .filter((q) => q.lt(q.field("expires_at"), now))
      .collect();

    for (const session of expiredSessions) {
      await ctx.db.patch(session._id, { is_active: false });
    }

    return null;
  },
});

/**
 * Get user's admin status
 */
export const checkAdminStatus = query({
  args: {
    user_id: v.id("users"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.user_id);
    return user?.is_admin || false;
  },
});

/**
 * Set user as admin (requires existing admin privileges)
 */
export const setUserAdmin = mutation({
  args: {
    user_id: v.id("users"),
    target_user_id: v.id("users"),
    is_admin: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if requesting user is admin
    const requestingUser = await ctx.db.get(args.user_id);
    if (!requestingUser || !requestingUser.is_admin) {
      throw new Error("Only admins can modify admin status");
    }

    // Check if target user exists
    const targetUser = await ctx.db.get(args.target_user_id);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Update admin status
    await ctx.db.patch(args.target_user_id, { is_admin: args.is_admin });
    return null;
  },
});

/**
 * Get all users (admin only)
 */
export const getAllUsers = query({
  args: {
    requesting_user_id: v.id("users"),
  },
  returns: v.array(v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
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
  })),
  handler: async (ctx, args) => {
    // Check if requesting user is admin
    const requestingUser = await ctx.db.get(args.requesting_user_id);
    if (!requestingUser || !requestingUser.is_admin) {
      throw new Error("Only admins can view all users");
    }

    return await ctx.db.query("users").collect();
  },
});

/**
 * Bootstrap the first admin user (only works if there are no existing admins)
 */
export const bootstrapFirstAdmin = mutation({
  args: {
    wallet_address: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Check if there are any existing admins
    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("is_admin"), true))
      .collect();

    if (existingAdmins.length > 0) {
      return {
        success: false,
        message: "Cannot bootstrap: Admin users already exist. Use setUserAdmin instead.",
      };
    }

    // Find the user by wallet address
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("wallet_address"), args.wallet_address))
      .unique();

    if (!user) {
      return {
        success: false,
        message: "User not found. Please authenticate first.",
      };
    }

    // Set the user as admin
    await ctx.db.patch(user._id, { is_admin: true });

    return {
      success: true,
      message: "Successfully set as first admin user!",
    };
  },
}); 