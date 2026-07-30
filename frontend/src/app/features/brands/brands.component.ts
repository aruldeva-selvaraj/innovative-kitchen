import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/http/api.service';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  products_count: number;
  description?: string;
}

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-8">All Brands</h1>

      <!-- Search -->
      <input
        type="search"
        placeholder="Search brands..."
        class="border rounded-full px-4 py-2 text-sm w-full max-w-sm mb-8"
        (input)="search($event)"
      />

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        @for (brand of filtered(); track brand.id) {
          <a [routerLink]="['/brands', brand.slug]"
             class="flex flex-col items-center gap-2 p-4 border rounded-xl hover:border-primary hover:shadow-sm transition-all text-center">
            <img [src]="brand.logo" [alt]="brand.name" class="h-16 object-contain" />
            <span class="text-sm font-medium text-gray-700">{{ brand.name }}</span>
            <span class="text-xs text-gray-400">{{ brand.products_count }} products</span>
          </a>
        }
      </div>
    </div>
  `,
})
export class BrandsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly brands = signal<Brand[]>([]);
  readonly filtered = signal<Brand[]>([]);

  ngOnInit() {
    this.api.get<Brand[]>('/brands').subscribe(b => {
      this.brands.set(b);
      this.filtered.set(b);
    });
  }

  search(event: Event) {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtered.set(this.brands().filter(b => b.name.toLowerCase().includes(q)));
  }
}
