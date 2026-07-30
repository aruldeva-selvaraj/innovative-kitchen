import { Routes } from '@angular/router';

export const BRANDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./brands.component').then(m => m.BrandsComponent),
  },
  {
    path: ':slug',
    loadComponent: () => import('./brand-detail.component').then(m => m.BrandDetailComponent),
  },
];
