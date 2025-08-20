import { z } from 'zod';

// Menu category enum
export const categoryEnum = z.enum(['Food', 'Beverage', 'Snack']);
export type Category = z.infer<typeof categoryEnum>;

// Menu item schema
export const menuItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  category: categoryEnum,
  available: z.boolean(),
  created_at: z.coerce.date()
});

export type MenuItem = z.infer<typeof menuItemSchema>;

// Cart item schema
export const cartItemSchema = z.object({
  id: z.number(),
  menu_item_id: z.number(),
  quantity: z.number().int().positive(),
  notes: z.string().nullable(),
  price_at_time: z.number(), // Store price at time of adding to cart
  created_at: z.coerce.date()
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  table_number: z.number().int().positive(),
  total_amount: z.number(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

// Order item schema
export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  menu_item_id: z.number(),
  quantity: z.number().int().positive(),
  price_at_time: z.number(),
  notes: z.string().nullable(),
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Input schemas for creating menu items
export const createMenuItemInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  category: categoryEnum,
  available: z.boolean().default(true)
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemInputSchema>;

// Input schemas for cart operations
export const addToCartInputSchema = z.object({
  menu_item_id: z.number(),
  quantity: z.number().int().positive(),
  notes: z.string().nullable()
});

export type AddToCartInput = z.infer<typeof addToCartInputSchema>;

export const updateCartItemInputSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemInputSchema>;

// Input schemas for checkout
export const checkoutInputSchema = z.object({
  customer_name: z.string().min(1),
  table_number: z.number().int().positive(),
  cart_item_ids: z.array(z.number()).min(1)
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

// Response schemas
export const cartItemWithMenuItemSchema = cartItemSchema.extend({
  menu_item: menuItemSchema
});

export type CartItemWithMenuItem = z.infer<typeof cartItemWithMenuItemSchema>;

export const orderWithItemsSchema = orderSchema.extend({
  items: z.array(orderItemSchema.extend({
    menu_item: menuItemSchema
  }))
});

export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;

export const menuByCategory = z.object({
  category: categoryEnum,
  items: z.array(menuItemSchema)
});

export type MenuByCategory = z.infer<typeof menuByCategory>;