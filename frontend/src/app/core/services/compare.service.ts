import { computed, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface CompareItem {
  productId: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  specs: Record<string, string>;
}

const COMPARE_KEY = 'compare_items';
const MAX_COMPARE = 4;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly storage = inject(StorageService);
  private readonly _items = signal<CompareItem[]>(this.storage.get<CompareItem[]>(COMPARE_KEY) ?? []);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly canAdd = computed(() => this._items().length < MAX_COMPARE);

  add(item: CompareItem): boolean {
    if (!this.canAdd()) return false;
    if (this._items().some(i => i.productId === item.productId)) return false;
    this._items.update(items => {
      const updated = [...items, item];
      this.storage.set(COMPARE_KEY, updated);
      return updated;
    });
    return true;
  }

  remove(productId: number) {
    this._items.update(items => {
      const updated = items.filter(i => i.productId !== productId);
      this.storage.set(COMPARE_KEY, updated);
      return updated;
    });
  }

  isCompared(productId: number) {
    return computed(() => this._items().some(i => i.productId === productId));
  }

  clear() {
    this._items.set([]);
    this.storage.remove(COMPARE_KEY);
  }
}
