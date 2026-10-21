import { byId } from './catalogue';
export interface Order {
  id: string;
  created_at: string;
  total_cents: number;
  delivery_cents: number;
  items: Array<{ id: string; quantity: number; unit_price: number }>;
  source: 'local' | 'cloud';
}
export function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') return false;
  const o = value as Partial<Order>;
  if (
    typeof o.id !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(o.id) ||
    typeof o.created_at !== 'string' ||
    !Number.isFinite(Date.parse(o.created_at))
  )
    return false;
  if (
    !Number.isSafeInteger(o.total_cents) ||
    !Number.isSafeInteger(o.delivery_cents) ||
    ![0, 1800].includes(o.delivery_cents!)
  )
    return false;
  if (!Array.isArray(o.items) || o.items.length < 1 || o.items.length > 8) return false;
  const ids = new Set<string>();
  let subtotal = 0;
  for (const line of o.items) {
    if (
      !line ||
      !byId.has(line.id) ||
      ids.has(line.id) ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 20 ||
      !Number.isSafeInteger(line.unit_price) ||
      line.unit_price <= 0
    )
      return false;
    ids.add(line.id);
    subtotal += line.quantity * line.unit_price;
  }
  return subtotal + o.delivery_cents! === o.total_cents;
}
export function localOrders(value: unknown): Order[] {
  return Array.isArray(value)
    ? value
        .slice(0, 50)
        .filter(isOrder)
        .map((o) => ({ ...o, source: 'local' }))
    : [];
}
