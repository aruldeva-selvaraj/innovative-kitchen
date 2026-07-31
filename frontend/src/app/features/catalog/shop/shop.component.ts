import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../data-access/product.service';
import { ProductFilters, PaginatedProducts } from '../data-access/product.model';
import { ShopFiltersComponent } from './shop-filters.component';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ShopFiltersComponent, ProductCardComponent],
  template: `
    <div class="container mx-auto px-4 py-6 sm:py-8">

      <!-- ── Mobile toolbar (filters button + sort) ── -->
      <div class="flex items-center justify-between gap-3 mb-4 md:hidden">
        <p class="text-sm text-gray-500">{{ result()?.meta?.total ?? 0 }} products</p>
        <div class="flex items-center gap-2">
          <select
            class="border rounded-lg px-3 py-2 text-sm bg-white"
            (change)="onSortChange($event)"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
          <button
            class="flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
            (click)="filterOpen.set(true)"
          >
            <span class="material-icons text-base">tune</span>Filters
          </button>
        </div>
      </div>

      <div class="flex gap-6">

        <!-- ── Desktop sidebar ── -->
        <aside class="hidden md:block w-64 shrink-0">
          <app-shop-filters [filters]="filters()" (filtersChange)="onFiltersChange($event)" />
        </aside>

        <!-- ── Product grid ── -->
        <div class="flex-1 min-w-0">

          <!-- Desktop toolbar -->
          <div class="hidden md:flex items-center justify-between mb-4">
            <p class="text-sm text-gray-500">{{ result()?.meta?.total ?? 0 }} products found</p>
            <select
              class="border rounded-lg px-3 py-1.5 text-sm"
              (change)="onSortChange($event)"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          @if (loading()) {
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="h-64 sm:h-72 bg-gray-100 rounded-xl animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              @for (product of result()?.data ?? []; track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            @if ((result()?.meta?.last_page ?? 1) > 1) {
              <div class="mt-8 flex flex-wrap justify-center gap-2">
                @for (page of pages(); track page) {
                  <button
                    class="w-9 h-9 rounded-lg border text-sm transition-colors"
                    [class.bg-primary]="page === filters().page"
                    [class.text-white]="page === filters().page"
                    [class.border-primary]="page === filters().page"
                    (click)="goToPage(page)"
                  >{{ page }}</button>
                }
              </div>
            }
          }

        </div>
      </div>
    </div>

    <!-- ── Mobile filters bottom sheet ── -->
    @if (filterOpen()) {
      <div
        class="fixed inset-0 z-50 md:hidden"
        (click)="filterOpen.set(false)"
      >
        <div class="absolute inset-0 bg-black/40"></div>
        <div
          class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl
                 max-h-[85dvh] flex flex-col overflow-hidden slide-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Sheet handle + title -->
          <div class="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
            <h3 class="font-semibold text-gray-800">Filters</h3>
            <button (click)="filterOpen.set(false)" class="p-1 text-gray-500">
              <span class="material-icons">close</span>
            </button>
          </div>

          <!-- Scrollable filter content -->
          <div class="flex-1 overflow-y-auto px-4 py-4">
            <app-shop-filters
              [filters]="filters()"
              (filtersChange)="onFiltersChange($event)"
            />
          </div>

          <!-- Apply button -->
          <div class="px-4 py-4 border-t flex-shrink-0">
            <button
              (click)="filterOpen.set(false)"
              class="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark"
            >
              Show {{ result()?.meta?.total ?? 0 }} Results
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShopComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  readonly filters = signal<ProductFilters>({ page: 1, per_page: 24, sort: 'popular' });
  readonly result = signal<PaginatedProducts | null>(null);
  readonly loading = signal(true);
  readonly filterOpen = signal(false);

  readonly pages = computed(() => {
    const meta = this.result()?.meta;
    if (!meta) return [];
    return Array.from({ length: meta.last_page }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.seo.set({
      title: 'Shop Commercial Kitchen Equipment UAE | Innovative Kitchen – All Products',
      description: 'Browse our full range of commercial kitchen equipment at Innovative Kitchen UAE. Ovens, refrigeration, dishwashers, grills, fryers & catering supplies. Best prices with fast delivery across all UAE emirates.',
      keywords: 'commercial kitchen equipment UAE, buy kitchen equipment Dubai, restaurant equipment online UAE, catering supplies UAE, Innovative Kitchen shop, professional kitchen products Abu Dhabi',
      canonical: 'https://www.innovativekitchen.ae/shop',
      breadcrumbs: [{ name: 'Shop', url: '/shop' }],
    });
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
