import { inject } from '@angular/core';
import { ProductService } from '../../catalog/data-access/product.service';
import { CategoryService } from '../../catalog/data-access/category.service';
import { ApiService } from '../../../core/http/api.service';
import { forkJoin } from 'rxjs';

export interface HomeData {
  categories: any[];
  bestSellers: any[];
  newArrivals: any[];
  topDeals: any[];
  featuredBrands: any[];
}

export function homeResource() {
  const productService = inject(ProductService);
  const categoryService = inject(CategoryService);
  const api = inject(ApiService);

  return forkJoin({
    categories: categoryService.getTopCategories(),
    bestSellers: productService.getBestSellers(),
    newArrivals: productService.getNewArrivals(),
    topDeals: productService.getTopDeals(),
    featuredBrands: api.get<any[]>('/brands/featured'),
  });
}
