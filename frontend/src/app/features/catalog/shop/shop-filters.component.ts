import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductFilters } from '../data-access/product.model';
import { CategoryService } from '../data-access/category.service';
import { Category } from '../data-access/category.model';
import { ApiService } from '../../../core/http/api.service';

interface Brand { id: number; name: string; slug: string; }

@Component({
  selector: 'app-shop-filters',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-800">Filters</h3>
        <button class="text-xs text-primary hover:underline" (click)="reset()">Clear All</button>
      </div>

      <!-- Categories -->
      <div>
        <h4 class="font-medium text-sm text-gray-700 mb-2">Category</h4>
        <ul class="space-y-1">
          @for (cat of categories(); track cat.id) {
            <li>
              <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                <input type="radio" name="category" [value]="cat.slug" [(ngModel)]="selectedCategory"
                       (change)="apply()" />
                {{ cat.name }}
                @if (cat.products_count) {
                  <span class="text-xs text-gray-400">({{ cat.products_count }})</span>
                }
              </label>
            </li>
          }
        </ul>
      </div>

      <!-- Brands -->
      <div>
        <h4 class="font-medium text-sm text-gray-700 mb-2">Brand</h4>
        <ul class="space-y-1 max-h-48 overflow-y-auto">
          @for (brand of brands(); track brand.id) {
            <li>
              <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                <input type="checkbox" [value]="brand.slug"
                       [checked]="isBrandSelected(brand.slug)"
                       (change)="toggleBrand(brand.slug)" />
                {{ brand.name }}
              </label>
            </li>
          }
        </ul>
      </div>

      <!-- Price Range -->
      <div>
        <h4 class="font-medium text-sm text-gray-700 mb-2">Price (AED)</h4>
        <div class="flex gap-2">
          <input type="number" placeholder="Min" [(ngModel)]="minPrice"
                 class="w-full border rounded px-2 py-1 text-sm" (change)="apply()" />
          <input type="number" placeholder="Max" [(ngModel)]="maxPrice"
                 class="w-full border rounded px-2 py-1 text-sm" (change)="apply()" />
        </div>
      </div>

      <!-- In Stock -->
      <div>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" [(ngModel)]="inStock" (change)="apply()" />
          In Stock Only
        </label>
      </div>
    </div>
  `,
})
export class ShopFiltersComponent implements OnInit {
  readonly filters = input<ProductFilters>({});
  readonly filtersChange = output<Partial<ProductFilters>>();

  private readonly categoryService = inject(CategoryService);
  private readonly api = inject(ApiService);

  readonly categories = signal<Category[]>([]);
  readonly brands = signal<Brand[]>([]);

  selectedCategory = '';
  selectedBrands: string[] = [];
  minPrice?: number;
  maxPrice?: number;
  inStock = false;

  ngOnInit() {
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));
    this.api.get<Brand[]>('/brands').subscribe(b => this.brands.set(b));
  }

  isBrandSelected(slug: string) {
    return this.selectedBrands.includes(slug);
  }

  toggleBrand(slug: string) {
    if (this.isBrandSelected(slug)) {
      this.selectedBrands = this.selectedBrands.filter(b => b !== slug);
    } else {
      this.selectedBrands = [...this.selectedBrands, slug];
    }
    this.apply();
  }

  apply() {
    this.filtersChange.emit({
      category: this.selectedCategory || undefined,
      brand: this.selectedBrands.length ? this.selectedBrands : undefined,
      min_price: this.minPrice,
      max_price: this.maxPrice,
      in_stock: this.inStock || undefined,
    });
  }

  reset() {
    this.selectedCategory = '';
    this.selectedBrands = [];
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.inStock = false;
    this.filtersChange.emit({});
  }
}
