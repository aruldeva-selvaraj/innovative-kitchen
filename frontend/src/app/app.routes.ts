import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES),
      },
      {
        path: 'shop',
        loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES),
      },
      {
        path: 'brands',
        loadChildren: () => import('./features/brands/brands.routes').then(m => m.BRANDS_ROUTES),
      },
      {
        path: 'segment',
        loadChildren: () => import('./features/segments/segments.routes').then(m => m.SEGMENTS_ROUTES),
      },
      {
        path: 'cart',
        loadChildren: () => import('./features/cart/cart.routes').then(m => m.CART_ROUTES),
      },
      {
        path: 'wishlist',
        loadChildren: () => import('./features/wishlist/wishlist.routes').then(m => m.WISHLIST_ROUTES),
      },
      {
        path: 'compare',
        loadChildren: () => import('./features/compare/compare.routes').then(m => m.COMPARE_ROUTES),
      },
      {
        path: 'account',
        loadChildren: () => import('./features/account/account.routes').then(m => m.ACCOUNT_ROUTES),
      },
      {
        path: 'search',
        loadChildren: () => import('./features/search/search.routes').then(m => m.SEARCH_ROUTES),
      },
      {
        path: '',
        loadChildren: () => import('./features/static-pages/static-pages.routes').then(m => m.STATIC_PAGES_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
