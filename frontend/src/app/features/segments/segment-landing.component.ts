import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../catalog/data-access/product.service';
import { CategoryService } from '../catalog/data-access/category.service';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';

interface SegmentMeta {
  label: string;
  description: string;
  banner: string;
  icon: string;
}

const SEGMENT_META: Record<string, SegmentMeta> = {
  restaurant: {
    label: 'Restaurant',
    description: 'Professional-grade equipment for your restaurant',
    banner: '/assets/segments/restaurant-banner.jpg',
    icon: 'restaurant',
  },
  hotel: {
    label: 'Hotel',
    description: 'Premium supplies for hospitality excellence',
    banner: '/assets/segments/hotel-banner.jpg',
    icon: 'hotel',
  },
  villa: {
    label: 'Villa',
    description: 'Luxury home and villa essentials',
    banner: '/assets/segments/villa-banner.jpg',
    icon: 'villa',
  },
  'coffee-shop': {
    label: 'Coffee Shop',
    description: 'Everything you need for the perfect coffee experience',
    banner: '/assets/segments/coffee-shop-banner.jpg',
    icon: 'local_cafe',
  },
};

@Component({
  selector: 'app-segment-landing',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    @if (meta()) {
      <!-- Hero -->
      <div class="relative h-64 overflow-hidden flex items-center justify-center"
           [style.background-image]="'url(' + meta()!.banner + ')'"
           [style.background-size]="'cover'"
           [style.background-position]="'center'">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative text-center text-white">
          <span class="material-icons text-5xl mb-2 block">{{ meta()!.icon }}</span>
          <h1 class="text-3xl font-bold">{{ meta()!.label }}</h1>
          <p class="mt-2 text-white/80">{{ meta()!.description }}</p>
        </div>
      </div>

      <!-- Categories for this segment -->
      <div class="container mx-auto px-4 py-8">
        <div class="flex gap-3 mb-8 flex-wrap">
          @for (cat of categories(); track cat.id) {
            <a [routerLink]="['/shop/category', cat.slug]"
               class="px-4 py-2 border rounded-full text-sm hover:bg-primary hover:text-white hover:border-primary transition-colors">
              {{ cat.name }}
            </a>
          }
        </div>

        <!-- Products -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      </div>
    }
  `,
})
export class SegmentLandingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  readonly segmentSlug = signal('');
  readonly meta = computed(() => SEGMENT_META[this.segmentSlug()] ?? null);
  readonly products = signal<any[]>([]);
  readonly categories = signal<any[]>([]);

  ngOnInit() {
    this.route.params.subscribe(({ segment }) => {
      this.segmentSlug.set(segment);
      this.productService.getProducts({ category: segment, per_page: 24 }).subscribe(r => this.products.set(r.data));
      this.categoryService.getAll().subscribe(cats => this.categories.set(cats.slice(0, 8)));
    });
  }
}
