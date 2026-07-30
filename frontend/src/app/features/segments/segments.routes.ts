import { Routes } from '@angular/router';

export const SEGMENTS_ROUTES: Routes = [
  {
    path: ':segment',
    loadComponent: () => import('./segment-landing.component').then(m => m.SegmentLandingComponent),
    data: {},
  },
];
