import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CategoryService } from '../data-access/category.service';
import { ProductService } from '../data-access/product.service';
import { Category } from '../data-access/category.model';
import { PaginatedProducts, ProductFilters } from '../data-access/product.model';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { SeoService } from '../../../core/services/seo.service';
import { ApiService } from '../../../core/http/api.service';

interface Brand { id: number; name: string; slug: string; }

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [ProductCardComponent, RouterLink, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6 sm:py-8">

      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
        <a routerLink="/" class="hover:text-primary">Home</a>
        <span>/</span>
        <a routerLink="/shop" class="hover:text-primary">Shop</a>
        @if (category()) {
          <span>/</span>
          <span class="text-gray-800 font-medium">{{ category()!.name }}</span>
        }
      </nav>

      @if (category()) {
        <!-- Category header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">{{ category()!.name }}</h1>
          @if (category()!.description) {
            <p class="text-gray-500 text-sm mt-1 max-w-2xl">{{ category()!.description }}</p>
          }
        </div>

        <!-- Subcategory chips -->
        @if (category()!.children?.length) {
          <div class="flex gap-2 mb-6 flex-wrap">
            <a routerLink="."
               class="px-3 py-1.5 rounded-full text-sm border transition-colors"
               [class.bg-primary]="!activeSubSlug()"
               [class.text-white]="!activeSubSlug()"
               [class.border-primary]="!activeSubSlug()"
               [class.hover:bg-gray-50]="!!activeSubSlug()">
              All
            </a>
            @for (sub of category()!.children!; track sub.id) {
              <a [routerLink]="['/shop/category', sub.slug]"
                 class="px-3 py-1.5 rounded-full text-sm border transition-colors"
                 [class.bg-primary]="activeSubSlug() === sub.slug"
                 [class.text-white]="activeSubSlug() === sub.slug"
                 [class.border-primary]="activeSubSlug() === sub.slug"
                 [class.hover:bg-gray-50]="activeSubSlug() !== sub.slug">
                {{ sub.name }}
              </a>
            }
          </div>
        }
      }

      <!-- Mobile toolbar -->
      <div class="flex items-center justify-between gap-3 mb-4 md:hidden">
        <p class="text-sm text-gray-500">{{ result()?.meta?.total ?? 0 }} products</p>
        <div class="flex items-center gap-2">
          <select class="border rounded-lg px-3 py-2 text-sm bg-white"
                  [(ngModel)]="sortValue" (change)="applySort()">
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
          <button class="flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
                  (click)="filterOpen.set(true)">
            <span class="material-icons text-base">tune</span>Filters
          </button>
        </div>
      </div>

      <div class="flex gap-6">

        <!-- Desktop sidebar -->
        <aside class="hidden md:block w-56 shrink-0">
          <div class="space-y-5 sticky top-24">

            <!-- Sort -->
            <div>
              <h4 class="font-semibold text-sm text-gray-700 mb-2">Sort By</h4>
              <select class="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                      [(ngModel)]="sortValue" (change)="applySort()">
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <!-- Brands -->
            @if (brands().length) {
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold text-sm text-gray-700">Brand</h4>
                  @if (selectedBrands.length) {
                    <button class="text-xs text-primary hover:underline" (click)="clearBrands()">Clear</button>
                  }
                </div>
                <ul class="space-y-1 max-h-48 overflow-y-auto">
                  @for (brand of brands(); track brand.id) {
                    <li>
                      <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                        <input type="checkbox" [value]="brand.slug"
                               [checked]="selectedBrands.includes(brand.slug)"
                               (change)="toggleBrand(brand.slug)" />
                        {{ brand.name }}
                      </label>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- Price -->
            <div>
              <h4 class="font-semibold text-sm text-gray-700 mb-2">Price (AED)</h4>
              <div class="flex gap-2">
                <input type="number" placeholder="Min" [(ngModel)]="minPrice"
                       class="w-full border rounded px-2 py-1.5 text-sm" (change)="applyFilters()" />
                <input type="number" placeholder="Max" [(ngModel)]="maxPrice"
                       class="w-full border rounded px-2 py-1.5 text-sm" (change)="applyFilters()" />
              </div>
            </div>

            <!-- In Stock -->
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" [(ngModel)]="inStockOnly" (change)="applyFilters()" />
              In Stock Only
            </label>

            <!-- Clear All -->
            @if (hasActiveFilters()) {
              <button (click)="clearAll()"
                      class="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors">
                Clear All Filters
              </button>
            }

          </div>
        </aside>

        <!-- Product grid -->
        <div class="flex-1 min-w-0">

          @if (loading()) {
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="h-72 bg-gray-100 rounded-xl animate-pulse"></div>
              }
            </div>
          } @else if ((result()?.data ?? []).length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <span class="material-icons text-5xl mb-3">search_off</span>
              <p class="font-medium text-gray-600">No products found</p>
              <p class="text-sm mt-1">Try adjusting your filters</p>
              @if (hasActiveFilters()) {
                <button (click)="clearAll()"
                        class="mt-4 text-sm text-primary border border-primary rounded-lg px-5 py-2 hover:bg-primary/5">
                  Clear Filters
                </button>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              @for (product of result()!.data; track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            <!-- Pagination -->
            @if ((result()?.meta?.last_page ?? 1) > 1) {
              <div class="mt-8 flex flex-wrap justify-center gap-2">
                <button class="w-9 h-9 rounded-lg border text-sm transition-colors hover:bg-gray-50"
                        [disabled]="filters().page === 1"
                        [class.opacity-30]="filters().page === 1"
                        (click)="goToPage(filters().page! - 1)">
                  <span class="material-icons text-base">chevron_left</span>
                </button>

                @for (page of pages(); track page) {
                  <button
                    class="w-9 h-9 rounded-lg border text-sm font-medium transition-colors"
                    [class.bg-primary]="page === filters().page"
                    [class.text-white]="page === filters().page"
                    [class.border-primary]="page === filters().page"
                    [class.hover:bg-gray-50]="page !== filters().page"
                    (click)="goToPage(page)">
                    {{ page }}
                  </button>
                }

                <button class="w-9 h-9 rounded-lg border text-sm transition-colors hover:bg-gray-50"
                        [disabled]="filters().page === result()?.meta?.last_page"
                        [class.opacity-30]="filters().page === result()?.meta?.last_page"
                        (click)="goToPage(filters().page! + 1)">
                  <span class="material-icons text-base">chevron_right</span>
                </button>
              </div>
              <p class="text-center text-xs text-gray-400 mt-2">
                {{ result()!.meta.total }} products · page {{ result()!.meta.current_page }} of {{ result()!.meta.last_page }}
              </p>
            }
          }

        </div>
      </div>
    </div>

    <!-- Mobile filter bottom sheet -->
    @if (filterOpen()) {
      <div class="fixed inset-0 z-50 md:hidden" (click)="filterOpen.set(false)">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85dvh] flex flex-col overflow-hidden"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
            <h3 class="font-semibold text-gray-800">Filters</h3>
            <button (click)="filterOpen.set(false)" class="p-1 text-gray-500">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-4 py-4 space-y-5">

            <!-- Brands -->
            @if (brands().length) {
              <div>
                <h4 class="font-medium text-sm text-gray-700 mb-2">Brand</h4>
                <ul class="space-y-2">
                  @for (brand of brands(); track brand.id) {
                    <li>
                      <label class="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" [value]="brand.slug"
                               [checked]="selectedBrands.includes(brand.slug)"
                               (change)="toggleBrand(brand.slug)" />
                        {{ brand.name }}
                      </label>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- Price -->
            <div>
              <h4 class="font-medium text-sm text-gray-700 mb-2">Price (AED)</h4>
              <div class="flex gap-2">
                <input type="number" placeholder="Min" [(ngModel)]="minPrice"
                       class="w-full border rounded px-2 py-2 text-sm" />
                <input type="number" placeholder="Max" [(ngModel)]="maxPrice"
                       class="w-full border rounded px-2 py-2 text-sm" />
              </div>
            </div>

            <!-- In Stock -->
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" [(ngModel)]="inStockOnly" />
              In Stock Only
            </label>

          </div>
          <div class="px-4 py-4 border-t flex gap-3 flex-shrink-0">
            @if (hasActiveFilters()) {
              <button (click)="clearAll(); filterOpen.set(false)"
                      class="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium text-sm">
                Clear
              </button>
            }
            <button (click)="applyFilters(); filterOpen.set(false)"
                    class="flex-1 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark">
              Show {{ result()?.meta?.total ?? 0 }} Results
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);

  readonly category = signal<Category | null>(null);
  readonly result = signal<PaginatedProducts | null>(null);
  readonly loading = signal(true);
  readonly filterOpen = signal(false);
  readonly brands = signal<Brand[]>([]);
  readonly activeSubSlug = signal<string | null>(null);

  readonly filters = signal<ProductFilters>({ page: 1, per_page: 24, sort: 'popular' });

  readonly pages = computed(() => {
    const meta = this.result()?.meta;
    if (!meta) return [];
    const total = meta.last_page;
    const current = meta.current_page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    // Show window around current page
    const start = Math.max(1, current - 2);
    const end   = Math.min(total, current + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  sortValue: ProductFilters['sort'] = 'popular';
  selectedBrands: string[] = [];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly = false;

  hasActiveFilters = computed(() =>
    this.selectedBrands.length > 0 ||
    !!this.minPrice ||
    !!this.maxPrice ||
    this.inStockOnly
  );

  private subs = new Subscription();

  ngOnInit() {
    this.api.get<Brand[]>('/brands').subscribe(b => this.brands.set(b));

    this.subs.add(
      this.route.params.subscribe(({ slug, subSlug }) => {
        this.activeSubSlug.set(subSlug ?? null);
        this.filters.set({ page: 1, per_page: 24, sort: this.sortValue });
        this.loadCategory(subSlug ?? slug);
        this.loadProducts(subSlug ?? slug);
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private loadCategory(slug: string) {
    this.categoryService.getCategory(slug).subscribe(cat => {
      this.category.set(cat);
      if (cat) {
        this.seo.set({
          title: `${cat.name} – Commercial Kitchen Equipment UAE | Innovative Kitchen`,
          description: cat.description
            ?? `Shop ${cat.name} in UAE. Professional grade equipment for restaurants, hotels & catering. Fast delivery across Dubai, Abu Dhabi & Sharjah.`,
          keywords: `${cat.name} UAE, buy ${cat.name} Dubai, commercial ${cat.name} price UAE`,
          canonical: `https://www.innovativekitchen.ae/shop/category/${cat.slug}`,
          breadcrumbs: [
            { name: 'Shop', url: '/shop' },
            { name: cat.name, url: `/shop/category/${cat.slug}` },
          ],
        });
      }
    });
  }

  private loadProducts(slug: string) {
    this.loading.set(true);
    const f = this.filters();
    this.productService.getByCategory(slug, f).subscribe({
      next: res => { this.result.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private currentSlug(): string {
    const p = this.route.snapshot.params;
    return p['subSlug'] ?? p['slug'];
  }

  applySort() {
    this.filters.update(f => ({ ...f, sort: this.sortValue, page: 1 }));
    this.loadProducts(this.currentSlug());
  }

  applyFilters() {
    this.filters.update(f => ({
      ...f,
      page: 1,
      sort: this.sortValue,
      brand: this.selectedBrands.length ? this.selectedBrands : undefined,
      min_price: this.minPrice || undefined,
      max_price: this.maxPrice || undefined,
      in_stock: this.inStockOnly || undefined,
    }));
    this.loadProducts(this.currentSlug());
  }

  toggleBrand(slug: string) {
    if (this.selectedBrands.includes(slug)) {
      this.selectedBrands = this.selectedBrands.filter(b => b !== slug);
    } else {
      this.selectedBrands = [...this.selectedBrands, slug];
    }
    this.applyFilters();
  }

  clearBrands() {
    this.selectedBrands = [];
    this.applyFilters();
  }

  clearAll() {
    this.selectedBrands = [];
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.inStockOnly = false;
    this.sortValue = 'popular';
    this.filters.set({ page: 1, per_page: 24, sort: 'popular' });
    this.loadProducts(this.currentSlug());
  }

  goToPage(page: number) {
    this.filters.update(f => ({ ...f, page }));
    this.loadProducts(this.currentSlug());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
