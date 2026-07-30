import { computed, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  sku?: string;
}

const CART_KEY = 'cart_items';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storage = inject(StorageService);
  private readonly _items = signal<CartItem[]>(this.storage.get<CartItem[]>(CART_KEY) ?? []);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  add(item: CartItem) {
    this._items.update(items => {
      const existing = items.find(i => i.productId === item.productId);
      const updated = existing
        ? items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i)
        : [...items, item];
      this.persist(updated);
      return updated;
    });
  }

  remove(productId: number) {
    this._items.update(items => {
      const updated = items.filter(i => i.productId !== productId);
      this.persist(updated);
      return updated;
    });
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) { this.remove(productId); return; }
    this._items.update(items => {
      const updated = items.map(i => i.productId === productId ? { ...i, quantity } : i);
      this.persist(updated);
      return updated;
    });
  }

  clear() {
    this._items.set([]);
    this.storage.remove(CART_KEY);
  }

  private persist(items: CartItem[]) {
    this.storage.set(CART_KEY, items);
  }
}
