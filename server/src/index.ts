import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createMenuItemInputSchema, 
  addToCartInputSchema, 
  updateCartItemInputSchema, 
  checkoutInputSchema,
  categoryEnum
} from './schema';

// Import handlers
import { getMenu, getMenuByCategory } from './handlers/get_menu';
import { createMenuItem } from './handlers/create_menu_item';
import { 
  addToCart, 
  getCartItems, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from './handlers/cart_operations';
import { checkout } from './handlers/checkout';
import { getOrder, getOrders, updateOrderStatus } from './handlers/orders';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Menu operations
  getMenu: publicProcedure
    .query(() => getMenu()),
  
  getMenuByCategory: publicProcedure
    .input(z.object({ category: categoryEnum }))
    .query(({ input }) => getMenuByCategory(input.category)),

  createMenuItem: publicProcedure
    .input(createMenuItemInputSchema)
    .mutation(({ input }) => createMenuItem(input)),

  // Cart operations
  addToCart: publicProcedure
    .input(addToCartInputSchema)
    .mutation(({ input }) => addToCart(input)),

  getCartItems: publicProcedure
    .query(() => getCartItems()),

  updateCartItem: publicProcedure
    .input(updateCartItemInputSchema)
    .mutation(({ input }) => updateCartItem(input)),

  removeFromCart: publicProcedure
    .input(z.object({ cartItemId: z.number() }))
    .mutation(({ input }) => removeFromCart(input.cartItemId)),

  clearCart: publicProcedure
    .mutation(() => clearCart()),

  // Checkout
  checkout: publicProcedure
    .input(checkoutInputSchema)
    .mutation(({ input }) => checkout(input)),

  // Order operations
  getOrder: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .query(({ input }) => getOrder(input.orderId)),

  getOrders: publicProcedure
    .query(() => getOrders()),

  updateOrderStatus: publicProcedure
    .input(z.object({ 
      orderId: z.number(), 
      status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
    }))
    .mutation(({ input }) => updateOrderStatus(input.orderId, input.status))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();