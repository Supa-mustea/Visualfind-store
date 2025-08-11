import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  specifications: text("specifications").array(),
  inStock: boolean("in_stock").default(true),
});

export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  searchDate: text("search_date").notNull(),
  resultsFound: integer("results_found").default(0),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const dropshipOrders = pgTable("dropship_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: text("product_id").notNull(),
  customerEmail: text("customer_email").notNull(),
  productName: text("product_name").notNull(),
  customerPrice: decimal("customer_price", { precision: 10, scale: 2 }).notNull(),
  supplierPrice: decimal("supplier_price", { precision: 10, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(),
  supplierUrl: text("supplier_url").notNull(),
  orderStatus: text("order_status").notNull().default("pending"),
  trackingNumber: text("tracking_number"),
  orderDate: text("order_date").notNull(),
  expectedDelivery: text("expected_delivery"),
  notes: text("notes"),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  apiKey: text("api_key"),
  baseUrl: text("base_url").notNull(),
  country: text("country").notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  avgDeliveryDays: integer("avg_delivery_days").default(7),
  isActive: boolean("is_active").default(true),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
});

export const insertDropshipOrderSchema = createInsertSchema(dropshipOrders).omit({
  id: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertDropshipOrder = z.infer<typeof insertDropshipOrderSchema>;
export type DropshipOrder = typeof dropshipOrders.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
