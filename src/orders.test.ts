import { describe, it, expect } from 'vitest';
import { isOrder, localOrders } from './orders';
const order = {
  id: '00000000-0000-4000-8000-000000000001',
  created_at: '2026-10-21T00:00:00Z',
  items: [{ id: 'pen', quantity: 2, unit_price: 4500 }],
  delivery_cents: 1800,
  total_cents: 10800,
  source: 'local',
};
describe('stored order boundaries', () => {
  it('accepts a consistent order and rejects malformed item collections', () => {
    expect(isOrder(order)).toBe(true);
    expect(isOrder({ ...order, items: null })).toBe(false);
    expect(isOrder({ ...order, items: [null] })).toBe(false);
  });
  it('rejects invalid dates, totals, and duplicate items', () => {
    expect(isOrder({ ...order, created_at: 'broken' })).toBe(false);
    expect(isOrder({ ...order, total_cents: 1 })).toBe(false);
    expect(isOrder({ ...order, items: [...order.items, ...order.items] })).toBe(false);
  });
  it('recovers valid local orders without trusting a stored cloud label', () => {
    expect(localOrders(null)).toEqual([]);
    expect(localOrders([{}, null, { ...order, source: 'cloud' }])).toEqual([order]);
  });
});
