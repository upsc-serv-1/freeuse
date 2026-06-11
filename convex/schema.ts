import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  apps: defineTable({
    name: v.string(),
    packageName: v.string(),
    category: v.string(),
  }).index("by_name", ["name"]),

  blocklist: defineTable({
    appName: v.string(),
    packageName: v.string(),
    blocked: v.boolean(),
    dailyTimeLimitMinutes: v.optional(v.number()),
    blockExpiresAt: v.optional(v.number()), // timestamp when block auto-expires
    createdAt: v.number(),
  }).index("by_app", ["packageName"]),

  appRenames: defineTable({
    packageName: v.string(),
    aliasName: v.string(),
  }).index("by_package", ["packageName"]),

  focusSessions: defineTable({
    packageName: v.string(),
    date: v.string(),
    minutesUsed: v.number(),
    lastOpened: v.optional(v.number()),
  }).index("by_date_app", ["date", "packageName"]),

  hiddenApps: defineTable({
    packageName: v.string(),
  }).index("by_package", ["packageName"]),

  favorites: defineTable({
    packageName: v.string(),
    position: v.number(),
  }).index("by_package", ["packageName"]),

  uninstalledApps: defineTable({
    packageName: v.string(),
  }).index("by_package", ["packageName"]),
});