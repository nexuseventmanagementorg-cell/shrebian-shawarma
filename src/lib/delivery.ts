import type { Product } from '@/types';

export const FIXED_DELIVERY_FEE = 250;
export const MIN_DELIVERY_SHAWARMA_COUNT = 2;

export function getShawarmaCount(
  items: ReadonlyArray<{ product: Pick<Product, 'category'>; quantity: number }>
): number {
  return items.reduce(
    (count, item) => count + (item.product.category === 'shawarma' ? item.quantity : 0),
    0
  );
}
