import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Create enum for menu categories
export const categoryEnum = pgEnum('category', ['Food', 'Beverage', 'Snack']);

// Create enum for order status
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']);

// Menu items table
export const menuItemsTable = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: categoryEnum('category').notNull(),
  available: boolean('available').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Cart items table
export const cartItemsTable = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  menu_item_id: integer('menu_item_id').notNull().references(() => menuItemsTable.id),
  quantity: integer('quantity').notNull(),
  notes: text('notes'), // Nullable by default
  price_at_time: numeric('price_at_time', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Orders table
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  table_number: integer('table_number').notNull(),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Order items table
export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').notNull().references(() => ordersTable.id),
  menu_item_id: integer('menu_item_id').notNull().references(() => menuItemsTable.id),
  quantity: integer('quantity').notNull(),
  price_at_time: numeric('price_at_time', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const menuItemsRelations = relations(menuItemsTable, ({ many }) => ({
  cartItems: many(cartItemsTable),
  orderItems: many(orderItemsTable),
}));

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  menuItem: one(menuItemsTable, {
    fields: [cartItemsTable.menu_item_id],
    references: [menuItemsTable.id],
  }),
}));

export const ordersRelations = relations(ordersTable, ({ many }) => ({
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
  menuItem: one(menuItemsTable, {
    fields: [orderItemsTable.menu_item_id],
    references: [menuItemsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type MenuItem = typeof menuItemsTable.$inferSelect;
export type NewMenuItem = typeof menuItemsTable.$inferInsert;

export type CartItem = typeof cartItemsTable.$inferSelect;
export type NewCartItem = typeof cartItemsTable.$inferInsert;

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;

export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  menuItems: menuItemsTable,
  cartItems: cartItemsTable,
  orders: ordersTable,
  orderItems: orderItemsTable
};