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
      world_approved: v.optional(v.boolean()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
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
    world_approved: v.optional(v.boolean()),
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
      world_approved: v.optional(v.boolean()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
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
      world_approved: v.optional(v.boolean()),
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
    world_approved: v.optional(v.boolean()),
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
      world_approved: args.world_approved || false,
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
    world_approved: v.optional(v.boolean()),
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
    if (args.world_approved !== undefined) updates.world_approved = args.world_approved;
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
      world_approved: v.optional(v.boolean()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    })),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.any()),
    splitCursor: v.optional(v.union(v.string(), v.null())),
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

/**
 * Seed database with sample events (development helper)
 */
export const seedSampleEvents = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx, args) => {
    // Sample events data
    const sampleEvents = [
      {
        name: "ETH Warsaw",
        tagline: "Building the Future of Ethereum in the Heart of Europe",
        description: "Join us for the premier Ethereum event in Warsaw, bringing together developers, researchers, and enthusiasts to explore the latest in Web3 technology. Experience cutting-edge talks, hands-on workshops, and networking opportunities with the brightest minds in the Ethereum ecosystem.",
        start_date: "2024-09-05T09:00:00Z",
        end_date: "2024-09-07T18:00:00Z",
        location: {
          city: "Warsaw",
          country: "Poland"
        },
        type: {
          conference: true,
          hackathon: false
        },
        logo_url: "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/ethwarsaw",
          "https://github.com/ethwarsaw",
          "https://discord.gg/ethwarsaw"
        ],
        is_featured: true,
        status: "published" as const
      },
      {
        name: "ETH Istanbul",
        tagline: "Bridging East and West: The Ethereum Community Gathering",
        description: "Istanbul's largest Ethereum conference bringing together builders, investors, and innovators from across Europe, Asia, and the Middle East. Discover new protocols, participate in governance discussions, and connect with the global Ethereum community.",
        start_date: "2024-09-12T08:00:00Z",
        end_date: "2024-09-14T20:00:00Z",
        location: {
          city: "Istanbul",
          country: "Turkey"
        },
        type: {
          conference: true,
          hackathon: true
        },
        logo_url: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/ethistanbul",
          "https://t.me/ethistanbul",
          "https://linkedin.com/company/ethistanbul"
        ],
        is_featured: true,
        status: "published" as const
      },
      {
        name: "ETH Safari",
        tagline: "Wild Adventures in Web3 - Kenya's Premier Ethereum Event",
        description: "Experience the growing African Web3 ecosystem at ETH Safari. Join us in Kenya for an immersive experience featuring local builders, sustainable blockchain solutions, and the future of decentralized finance in emerging markets.",
        start_date: "2024-09-20T10:00:00Z",
        end_date: "2024-09-22T19:00:00Z",
        location: {
          city: "Nairobi",
          country: "Kenya"
        },
        type: {
          conference: true,
          hackathon: true
        },
        logo_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/ethsafari",
          "https://instagram.com/ethsafari",
          "https://discord.gg/ethsafari"
        ],
        is_featured: false,
        status: "published" as const
      },
      {
        name: "ETH Tokyo",
        tagline: "東京で繋がる未来のブロックチェーン - Connecting Japan's Web3 Future",
        description: "Tokyo's premier Ethereum conference showcasing Japan's unique approach to Web3 technology. Featuring presentations from leading Japanese blockchain companies, cultural workshops, and networking events in the heart of Tokyo.",
        start_date: "2024-10-01T09:00:00Z",
        end_date: "2024-10-03T17:00:00Z",
        location: {
          city: "Tokyo",
          country: "Japan"
        },
        type: {
          conference: true,
          hackathon: false
        },
        logo_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/ethtokyo",
          "https://github.com/ethtokyo",
          "https://youtube.com/ethtokyo"
        ],
        is_featured: false,
        status: "published" as const
      },
      {
        name: "Ethereum Vienna",
        tagline: "Alpine Innovation: Web3 in the Austrian Capital",
        description: "Join the Austrian Ethereum community for an elegant conference in Vienna. Experience the perfect blend of classical architecture and cutting-edge blockchain technology, with talks on DeFi protocols, NFT innovations, and sustainable Web3 solutions.",
        start_date: "2024-10-10T09:30:00Z",
        end_date: "2024-10-12T16:00:00Z",
        location: {
          city: "Vienna",
          country: "Austria"
        },
        type: {
          conference: true,
          hackathon: false
        },
        logo_url: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/ethvienna",
          "https://linkedin.com/company/ethereum-vienna",
          "https://medium.com/@ethvienna"
        ],
        is_featured: false,
        status: "published" as const
      },
      {
        name: "DeFi London",
        tagline: "Revolutionizing Finance in the City of London",
        description: "London's premier DeFi conference bringing together traditional finance and decentralized protocols. Learn from industry leaders, participate in governance discussions, and explore the future of financial infrastructure.",
        start_date: "2024-10-15T08:00:00Z",
        end_date: "2024-10-17T18:00:00Z",
        location: {
          city: "London",
          country: "United Kingdom"
        },
        type: {
          conference: true,
          hackathon: false
        },
        logo_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/defilondon",
          "https://linkedin.com/company/defi-london",
          "https://discord.gg/defilondon"
        ],
        is_featured: true,
        status: "published" as const
      },
      {
        name: "Web3 Summit Berlin",
        tagline: "Decentralized Future: Building the Next Internet",
        description: "Berlin's largest Web3 conference featuring the latest in decentralized technologies. Join developers, entrepreneurs, and thought leaders as they shape the future of the internet with blockchain, IPFS, and other Web3 protocols.",
        start_date: "2024-11-01T09:00:00Z",
        end_date: "2024-11-03T19:00:00Z",
        location: {
          city: "Berlin",
          country: "Germany"
        },
        type: {
          conference: true,
          hackathon: true
        },
        logo_url: "https://images.unsplash.com/photo-1587613757488-de7ba42ccd5f?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/web3berlin",
          "https://github.com/web3berlin",
          "https://telegram.me/web3berlin"
        ],
        is_featured: false,
        status: "published" as const
      },
      {
        name: "NFT NYC",
        tagline: "The Capital of Digital Art and Collectibles",
        description: "New York's premier NFT conference celebrating digital art, collectibles, and the creator economy. Featuring exhibitions from top artists, marketplace showcases, and discussions on the future of digital ownership.",
        start_date: "2024-11-10T10:00:00Z",
        end_date: "2024-11-12T20:00:00Z",
        location: {
          city: "New York",
          country: "United States"
        },
        type: {
          conference: true,
          hackathon: false
        },
        logo_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
        socials: [
          "https://twitter.com/nftnyc",
          "https://instagram.com/nftnyc",
          "https://discord.gg/nftnyc"
        ],
        is_featured: false,
        status: "published" as const
      }
    ];

    // Check if events already exist to avoid duplicates
    const existingEvents = await ctx.db.query("events").collect();
    if (existingEvents.length > 0) {
      return 0; // Already seeded
    }

    // Insert all sample events
    let insertedCount = 0;
    for (const event of sampleEvents) {
      await ctx.db.insert("events", event);
      insertedCount++;
    }

    return insertedCount;
  },
});

/**
 * Check if database needs seeding
 */
export const needsSeeding = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const events = await ctx.db.query("events").collect();
    return events.length === 0;
  },
}); 