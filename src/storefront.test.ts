import { describe, expect, it } from 'vitest';
import { parseStoreRoute, savedProducts, repeatOrder, quantityChoice } from './storefront';
import { cartTotals } from './cart';
import { isOrder, type Order } from './orders';

describe('expanded storefront boundaries', () => {
  it('resolves durable product links and safely rejects missing or encoded unknown IDs', () => {
    expect(parseStoreRoute('#/product/notebook')).toEqual({ page: 'product', id: 'notebook' });
    expect(parseStoreRoute('#/product/missing')).toEqual({ page: 'missing' });
    expect(parseStoreRoute('#/product/%3Cscript%3E')).toEqual({ page: 'missing' });
    expect(parseStoreRoute('#/saved')).toEqual({ page: 'saved' });
    expect(parseStoreRoute('#collection')).toEqual({ page: 'home' });
  });
  it('restores only known distinct wishlist IDs from malformed or stale storage', () => {
    expect(savedProducts(null)).toEqual([]);
    expect(savedProducts({ notebook: true })).toEqual([]);
    expect(savedProducts(['notebook', 'notebook', 'invented', null, 'pen', {}])).toEqual([
      'notebook',
      'pen',
    ]);
  });
  it('bounds quantity choices to the existing checkout contract', () => {
    expect([0, -1, Infinity, NaN, 2.7, 30].map(quantityChoice)).toEqual([1, 1, 1, 1, 2, 20]);
  });
  it('preserves old order prices while repeating at current canonical catalogue prices', () => {
    const order: Order = {
      id: '00000000-0000-4000-8000-000000000001',
      created_at: '2026-10-21T00:00:00Z',
      items: [{ id: 'notebook', quantity: 2, unit_price: 5000 }],
      total_cents: 11800,
      delivery_cents: 1800,
      source: 'local',
    };
    expect(isOrder(order)).toBe(true);
    const before = JSON.stringify(order);
    const next = repeatOrder([{ id: 'notebook', quantity: 19 }], order);
    expect(next).toEqual([{ id: 'notebook', quantity: 20 }]);
    expect(cartTotals(next).subtotal).toBe(58000);
    expect(JSON.stringify(order)).toBe(before);
    expect(order.total_cents).toBe(11800);
  });
});
