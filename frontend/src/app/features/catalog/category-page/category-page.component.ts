import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../data-access/category.service';
import { ProductService } from '../data-access/product.service';
import { Category } from '../data-access/category.model';
import { PaginatedProducts } from '../data-access/product.model';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-500 mb-6">
        <a routerLink="/" class="hover:text-primary">Home</a>
        <span class="mx-2">/</span>
        <a routerLink="/shop" class="hover:text-primary">Shop</a>
        @if (category()) {
          <span class="mx-2">/</span>
          <span class="text-gray-800">{{ category()!.name }}</span>
        }
      </nav>

      @if (category()) {
        <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ category()!.name }}</h1>
        @if (category()!.description) {
          <p class="text-gray-500 mb-6 text-sm">{{ category()!.description }}</p>
        }

        <!-- Subcategories -->
        @if (category()!.children?.length) {
          <div class="flex gap-3 mb-8 flex-wrap">
            @for (sub of category()!.children!; track sub.id) {
              <a [routerLink]="['/shop/category', sub.slug]"
                 class="px-4 py-2 border rounded-full text-sm hover:bg-primary hover:text-white hover:border-primary transition-colors">
                {{ sub.name }}
              </a>
            }
          </div>
        }
      }

      @if (loading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="h-72 bg-gray-100 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (product of result()?.data ?? []; track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </div>
  `,
})
export class CategoryPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  readonly category = signal<Category | null>(null);
  readonly result = signal<PaginatedProducts | null>(null);
  readonly loading = signal(true);

  ngOnInit() {
    this.route.params.subscribe(({ slug }) => {
      this.loading.set(true);
      this.categoryService.getCategory(slug).subscribe(cat => this.category.set(cat));
      this.productService.getByCategory(slug).subscribe({
        next: res => { this.result.set(res); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    });
  }
}
