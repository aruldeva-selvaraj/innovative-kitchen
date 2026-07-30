import { Routes } from '@angular/router';

export const WISHLIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./wishlist.component').then(m => m.WishlistComponent),
  },
];
