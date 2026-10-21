import { byId } from './catalogue';
export interface CartLine {
  id: string;
  quantity: number;
}
export function normalizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const counts = new Map<string, number>();
  for (const line of value) {
    if (
      line &&
      typeof line.id === 'string' &&
      byId.has(line.id) &&
      Number.isInteger(line.quantity) &&
      line.quantity > 0
    )
      counts.set(line.id, Math.min(20, (counts.get(line.id) || 0) + line.quantity));
  }
  return [...counts].map(([id, quantity]) => ({ id, quantity }));
}
export function updateCart(cart: CartLine[], id: string, quantity: number) {
  return normalizeCart([...cart.filter((l) => l.id !== id), { id, quantity }]);
}
export function cartTotals(cart: CartLine[]) {
  const subtotal = normalizeCart(cart).reduce((s, l) => s + byId.get(l.id)!.price * l.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 20000 ? 0 : 1800;
  return { subtotal, delivery, total: subtotal + delivery };
}
export function validateCheckout(cart: CartLine[], name: string) {
  if (!normalizeCart(cart).length) throw new Error('empty');
  if (name.trim().length < 2 || name.trim().length > 80) throw new Error('name');
  return { name: name.trim(), ...cartTotals(cart) };
}
export function readStorage<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
