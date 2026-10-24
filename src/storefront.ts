import { byId, type Product } from './catalogue';
import { normalizeCart, type CartLine } from './cart';
import type { Order } from './orders';

export type StoreRoute =
  { page: 'home' } | { page: 'product'; id: string } | { page: 'saved' } | { page: 'missing' };
export function parseStoreRoute(hash: string): StoreRoute {
  const path = hash.replace(/^#/, '').split('?')[0];
  if (path === '/saved') return { page: 'saved' };
  if (path.startsWith('/product/')) {
    const id = path.slice('/product/'.length);
    return byId.has(id) ? { page: 'product', id } : { page: 'missing' };
  }
  return path.startsWith('/') ? { page: 'missing' } : { page: 'home' };
}
export const productHref = (product: Product) => `#/product/${product.id}`;
export function savedProducts(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(value.filter((id): id is string => typeof id === 'string' && byId.has(id))),
      ].slice(0, 8)
    : [];
}
export function repeatOrder(cart: CartLine[], order: Order): CartLine[] {
  return normalizeCart([...cart, ...order.items.map(({ id, quantity }) => ({ id, quantity }))]);
}
export function quantityChoice(value: number): number {
  return Number.isFinite(value) ? Math.min(20, Math.max(1, Math.trunc(value))) : 1;
}
