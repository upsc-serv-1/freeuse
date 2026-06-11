import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Seed the known distracting apps (names only, no icons)
export const seedApps = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("apps").first();
    if (existing) return null;

    const apps = [
      { name: "Instagram", packageName: "com.instagram.android", category: "Social" },
      { name: "TikTok", packageName: "com.zhiliaoapp.musically", category: "Social" },
      { name: "Twitter X", packageName: "com.twitter.android", category: "Social" },
      { name: "Facebook", packageName: "com.facebook.katana", category: "Social" },
      { name: "YouTube", packageName: "com.google.android.youtube", category: "Entertainment" },
      { name: "Snapchat", packageName: "com.snapchat.android", category: "Social" },
      { name: "WhatsApp", packageName: "com.whatsapp", category: "Messaging" },
      { name: "Telegram", packageName: "org.telegram.messenger", category: "Messaging" },
      { name: "Reddit", packageName: "com.reddit.frontpage", category: "Social" },
      { name: "LinkedIn", packageName: "com.linkedin.android", category: "Professional" },
      { name: "Netflix", packageName: "com.netflix.mediaclient", category: "Entertainment" },
      { name: "Spotify", packageName: "com.spotify.music", category: "Music" },
      { name: "Pinterest", packageName: "com.pinterest", category: "Social" },
      { name: "Amazon", packageName: "com.amazon.mShop.android.shopping", category: "Shopping" },
      { name: "Flipkart", packageName: "com.flipkart.android", category: "Shopping" },
      { name: "Chrome", packageName: "com.android.chrome", category: "Browser" },
      { name: "Gmail", packageName: "com.google.android.gm", category: "Productivity" },
      { name: "Maps", packageName: "com.google.android.apps.maps", category: "Navigation" },
      { name: "Phone", packageName: "com.android.dialer", category: "System" },
      { name: "Messages", packageName: "com.android.mms", category: "Messaging" },
    ];

    for (const app of apps) {
      await ctx.db.insert("apps", app);
    }
    return null;
  },
});

// Get all apps
export const getAllApps = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("apps"),
    _creationTime: v.number(),
    name: v.string(),
    packageName: v.string(),
    category: v.string(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("apps").order("asc").collect();
  },
});

// Get blocklist
export const getBlocklist = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("blocklist"),
    _creationTime: v.number(),
    appName: v.string(),
    packageName: v.string(),
    blocked: v.boolean(),
    dailyTimeLimitMinutes: v.optional(v.number()),
    createdAt: v.number(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("blocklist").collect();
  },
});

// Toggle block an app
export const toggleBlockApp = mutation({
  args: {
    appName: v.string(),
    packageName: v.string(),
    blocked: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("blocklist")
      .withIndex("by_app", (q) => q.eq("packageName", args.packageName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { blocked: args.blocked });
    } else {
      await ctx.db.insert("blocklist", {
        appName: args.appName,
        packageName: args.packageName,
        blocked: args.blocked,
        createdAt: Date.now(),
      });
    }
    return null;
  },
});

// Set daily time limit for an app
export const setTimeLimit = mutation({
  args: {
    packageName: v.string(),
    minutes: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("blocklist")
      .withIndex("by_app", (q) => q.eq("packageName", args.packageName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { dailyTimeLimitMinutes: args.minutes });
    } else {
      await ctx.db.insert("blocklist", {
        appName: "",
        packageName: args.packageName,
        blocked: false,
        dailyTimeLimitMinutes: args.minutes,
        createdAt: Date.now(),
      });
    }
    return null;
  },
});

// Remove from blocklist
export const removeFromBlocklist = mutation({
  args: { id: v.id("blocklist") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

// Rename an app
export const renameApp = mutation({
  args: {
    packageName: v.string(),
    aliasName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("appRenames")
      .withIndex("by_package", (q) => q.eq("packageName", args.packageName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { aliasName: args.aliasName });
    } else {
      await ctx.db.insert("appRenames", {
        packageName: args.packageName,
        aliasName: args.aliasName,
      });
    }
    return null;
  },
});

// Get app renames
export const getAppRenames = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("appRenames"),
    _creationTime: v.number(),
    packageName: v.string(),
    aliasName: v.string(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("appRenames").collect();
  },
});

// Hide an app
export const toggleHiddenApp = mutation({
  args: {
    packageName: v.string(),
    hidden: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("hiddenApps")
      .withIndex("by_package", (q) => q.eq("packageName", args.packageName))
      .first();

    if (args.hidden && !existing) {
      await ctx.db.insert("hiddenApps", { packageName: args.packageName });
    } else if (!args.hidden && existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});

// Get hidden apps
export const getHiddenApps = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("hiddenApps"),
    _creationTime: v.number(),
    packageName: v.string(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("hiddenApps").collect();
  },
});

// Record app usage (call when user opens a blocked/time-limited app)
export const recordAppUsage = mutation({
  args: {
    packageName: v.string(),
    date: v.string(), // "YYYY-MM-DD"
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("focusSessions")
      .withIndex("by_date_app", (q) => q.eq("date", args.date).eq("packageName", args.packageName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        minutesUsed: existing.minutesUsed + 1,
        lastOpened: Date.now(),
      });
    } else {
      await ctx.db.insert("focusSessions", {
        packageName: args.packageName,
        date: args.date,
        minutesUsed: 1,
        lastOpened: Date.now(),
      });
    }
    return null;
  },
});

// Get today's usage for all apps
export const getTodaysUsage = query({
  args: { date: v.string() },
  returns: v.array(v.object({
    _id: v.id("focusSessions"),
    _creationTime: v.number(),
    packageName: v.string(),
    date: v.string(),
    minutesUsed: v.number(),
    lastOpened: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("focusSessions")
      .withIndex("by_date_app", (q) => q.eq("date", args.date))
      .collect();
  },
});