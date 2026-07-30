import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../data-access/product.service';
import { ProductFilters, PaginatedProducts } from '../data-access/product.model';
import { ShopFiltersComponent } from './shop-filters.component';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ShopFiltersComponent, ProductCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex gap-6">
        <!-- Sidebar Filters -->
        <aside class="w-64 shrink-0">
          <app-shop-filters
            [filters]="filters()"
            (filtersChange)="onFiltersChange($event)"
          />
        </aside>

        <!-- Product Grid -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-500">
              {{ result()?.meta?.total ?? 0 }} products found
            </p>
            <select class="border rounded px-3 py-1.5 text-sm" (change)="onSortChange($event)">
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          @if (loading()) {
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="h-72 bg-gray-100 rounded-xl animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              @for (product of result()?.data ?? []; track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            <!-- Pagination -->
            @if ((result()?.meta?.last_page ?? 1) > 1) {
              <div class="mt-8 flex justify-center gap-2">
                @for (page of pages(); track page) {
                  <button
                    class="w-9 h-9 rounded-lg border text-sm"
                    [class.bg-primary]="page === filters().page"
                    [class.text-white]="page === filters().page"
                    (click)="goToPage(page)"
                  >{{ page }}</button>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class ShopComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  readonly filters = signal<ProductFilters>({ page: 1, per_page: 24, sort: 'popular' });
  readonly result = signal<PaginatedProducts | null>(null);
  readonly loading = signal(true);

  readonly pages = computed(() => {
    const meta = this.result()?.meta;
    if (!meta) return [];
    return Array.from({ length: meta.last_page }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters.update(f => ({ ...f, ...params, page: 1 }));
      this.loadProducts();
    });
  }

  private loadProducts() {
    this.loading.set(true);
    this.productService.getProducts(this.filters()).subscribe({
      next: res => { this.result.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onFiltersChange(f: Partial<ProductFilters>) {
    this.filters.update(current => ({ ...current, ...f, page: 1 }));
    this.loadProducts();
  }

  onSortChange(event: Event) {
    const sort = (event.target as HTMLSelectElement).value as ProductFilters['sort'];
    this.filters.update(f => ({ ...f, sort, page: 1 }));
    this.loadProducts();
  }

  goToPage(page: number) {
    this.filters.update(f => ({ ...f, page }));
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
