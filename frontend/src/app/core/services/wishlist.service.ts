import { computed, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface WishlistItem {
  productId: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
}

const WISHLIST_KEY = 'wishlist_items';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly storage = inject(StorageService);
  private readonly _items = signal<WishlistItem[]>(this.storage.get<WishlistItem[]>(WISHLIST_KEY) ?? []);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  toggle(item: WishlistItem) {
    this._items.update(items => {
      const exists = items.some(i => i.productId === item.productId);
      const updated = exists
        ? items.filter(i => i.productId !== item.productId)
        : [...items, item];
      this.storage.set(WISHLIST_KEY, updated);
      return updated;
    });
  }

  isWishlisted(productId: number) {
    return computed(() => this._items().some(i => i.productId === productId));
  }

  remove(productId: number) {
    this._items.update(items => {
      const updated = items.filter(i => i.productId !== productId);
      this.storage.set(WISHLIST_KEY, updated);
      return updated;
    });
  }

  clear() {
    this._items.set([]);
    this.storage.remove(WISHLIST_KEY);
  }
}
