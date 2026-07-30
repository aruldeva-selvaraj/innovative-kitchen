import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shop/shop.component').then(m => m.ShopComponent),
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./category-page/category-page.component').then(m => m.CategoryPageComponent),
  },
  {
    path: 'category/:slug/:subSlug',
    loadComponent: () => import('./category-page/category-page.component').then(m => m.CategoryPageComponent),
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
];
