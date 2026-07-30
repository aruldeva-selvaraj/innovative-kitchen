import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BrandLogo {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

@Component({
  selector: 'app-brand-logo-strip',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="py-8 border-y">
      <p class="text-center text-sm text-gray-400 mb-6 font-medium tracking-widest uppercase">
        Featured Brands
      </p>
      <div class="flex items-center justify-center gap-8 flex-wrap">
        @for (brand of brands(); track brand.id) {
          <a [routerLink]="['/brands', brand.slug]" class="opacity-60 hover:opacity-100 transition-opacity">
            <img [src]="brand.logo" [alt]="brand.name" class="h-10 object-contain grayscale hover:grayscale-0 transition-all" />
          </a>
        }
      </div>
    </section>
  `,
})
export class BrandLogoStripComponent {
  readonly brands = input.required<BrandLogo[]>();
}
