import { describe, it, expect } from 'vitest';
import { normalizeCart, updateCart, cartTotals, validateCheckout } from './cart';
describe('cart and checkout boundaries', () => {
  it('rejects tampered products and noninteger or negative quantities', () =>
    expect(
      normalizeCart([
        { id: 'invented', quantity: 1 },
        { id: 'pen', quantity: -2 },
        { id: 'pen', quantity: 1.2 },
      ]),
    ).toEqual([]));
  it('merges duplicates and caps quantities at twenty', () =>
    expect(
      normalizeCart([
        { id: 'pen', quantity: 19 },
        { id: 'pen', quantity: 7 },
      ]),
    ).toEqual([{ id: 'pen', quantity: 20 }]));
  it('removes a line at zero', () =>
    expect(updateCart([{ id: 'pen', quantity: 1 }], 'pen', 0)).toEqual([]));
  it('computes prices from catalogue ignoring forged price', () =>
    expect(cartTotals([{ id: 'pen', quantity: 2, price: 1 } as never])).toEqual({
      subtotal: 2400,
      delivery: 1800,
      total: 4200,
    }));
  it('offers free demo delivery only at threshold', () => {
    expect(cartTotals([{ id: 'notebook', quantity: 6 }]).delivery).toBe(1800);
    expect(cartTotals([{ id: 'notebook', quantity: 7 }]).delivery).toBe(0);
    expect(cartTotals([]).total).toBe(0);
  });
  it('requires nonempty cart and a valid display name', () => {
    expect(() => validateCheckout([], 'Test')).toThrow('empty');
    expect(() => validateCheckout([{ id: 'pen', quantity: 1 }], ' ')).toThrow('name');
    expect(validateCheckout([{ id: 'pen', quantity: 1 }], '  Guest  ').name).toBe('Guest');
  });
});
