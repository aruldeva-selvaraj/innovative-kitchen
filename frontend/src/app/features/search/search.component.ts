import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../catalog/data-access/product.service';
import { PaginatedProducts } from '../catalog/data-access/product.model';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-xl font-bold text-gray-800 mb-2">
        Search results for <span class="text-primary">"{{ query() }}"</span>
      </h1>
      <p class="text-sm text-gray-500 mb-8">{{ result()?.meta?.total ?? 0 }} results found</p>

      @if (loading()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="h-72 bg-gray-100 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else if (result()?.data?.length) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (product of result()!.data; track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      } @else {
        <div class="text-center py-20">
          <span class="material-icons text-6xl text-gray-300">search_off</span>
          <p class="text-gray-500 mt-4 mb-2">No products found for "{{ query() }}"</p>
          <p class="text-sm text-gray-400">Try a different search term</p>
        </div>
      }
    </div>
  `,
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  readonly query = signal('');
  readonly result = signal<PaginatedProducts | null>(null);
  readonly loading = signal(true);

  ngOnInit() {
    this.route.queryParams.subscribe(({ q }) => {
      this.query.set(q ?? '');
      if (q) {
        this.loading.set(true);
        this.productService.search(q).subscribe({
          next: r => { this.result.set(r); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      } else {
        this.loading.set(false);
      }
    });
  }
}
