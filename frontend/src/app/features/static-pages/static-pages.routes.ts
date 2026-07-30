import { Routes } from '@angular/router';

export const STATIC_PAGES_ROUTES: Routes = [
  {
    path: 'about',
    loadComponent: () => import('./about.component').then(m => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./legal-page.component').then(m => m.LegalPageComponent),
    data: { page: 'privacy-policy', title: 'Privacy Policy' },
  },
  {
    path: 'refund-policy',
    loadComponent: () => import('./legal-page.component').then(m => m.LegalPageComponent),
    data: { page: 'refund-policy', title: 'Refund Policy' },
  },
  {
    path: 'terms',
    loadComponent: () => import('./legal-page.component').then(m => m.LegalPageComponent),
    data: { page: 'terms', title: 'Terms & Conditions' },
  },
  {
    path: 'faq',
    loadComponent: () => import('./legal-page.component').then(m => m.LegalPageComponent),
    data: { page: 'faq', title: 'FAQ' },
  },
];
