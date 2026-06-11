import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // The list of known apps (seeded)
  apps: defineTable({
    name: v.string(),
    packageName: v.string(),
    category: v.string(),
  }).index("by_name", ["name"]),

  // Blocked apps
  blocklist: defineTable({
    appName: v.string(),
    packageName: v.string(),
    blocked: v.boolean(),
    dailyTimeLimitMinutes: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_app", ["packageName"]),

  // App renames (alias names)
  appRenames: defineTable({
    packageName: v.string(),
    aliasName: v.string(),
  }).index("by_package", ["packageName"]),

  // Focus sessions / usage tracking
  focusSessions: defineTable({
    packageName: v.string(),
    date: v.string(), // "YYYY-MM-DD"
    minutesUsed: v.number(),
    lastOpened: v.optional(v.number()),
  }).index("by_date_app", ["date", "packageName"]),

  // Hidden apps
  hiddenApps: defineTable({
    packageName: v.string(),
  }).index("by_package", ["packageName"]),
});