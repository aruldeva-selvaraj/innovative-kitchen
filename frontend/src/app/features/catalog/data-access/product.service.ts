import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { PaginatedProducts, Product, ProductFilters } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(filters: ProductFilters = {}) {
    return this.api.get<PaginatedProducts>('/products', filters as Record<string, string>);
  }

  getProduct(slug: string) {
    return this.api.get<Product>(`/products/${slug}`);
  }

  getFeatured() {
    return this.api.get<Product[]>('/products/featured');
  }

  getBestSellers() {
    return this.api.get<Product[]>('/products/best-sellers');
  }

  getNewArrivals() {
    return this.api.get<Product[]>('/products/new-arrivals');
  }

  getTopDeals() {
    return this.api.get<Product[]>('/products/top-deals');
  }

  getByCategory(categorySlug: string, filters: Omit<ProductFilters, 'category'> = {}) {
    return this.api.get<PaginatedProducts>(`/categories/${categorySlug}/products`, filters as Record<string, string>);
  }

  search(query: string, filters: ProductFilters = {}) {
    return this.api.get<PaginatedProducts>('/products/search', { q: query, ...filters } as Record<string, string>);
  }

  getRelated(productId: number) {
    return this.api.get<Product[]>(`/products/${productId}/related`);
  }
}
