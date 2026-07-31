import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/http/api.service';
import { ProductService } from '../catalog/data-access/product.service';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-brand-detail',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      @if (brand()) {
        <div class="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
          <img [src]="brand()!.logo" [alt]="brand()!.name" class="h-20 object-contain" />
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ brand()!.name }}</h1>
            @if (brand()!.description) {
              <p class="text-gray-500 text-sm mt-1">{{ brand()!.description }}</p>
            }
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </div>
  `,
})
export class BrandDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly productService = inject(ProductService);
  private readonly seo = inject(SeoService);

  readonly brand = signal<any>(null);
  readonly products = signal<any[]>([]);

  ngOnInit() {
    this.route.params.subscribe(({ slug }) => {
      this.api.get<any>(`/brands/${slug}`).subscribe(b => {
        this.brand.set(b);
        if (b) {
          this.seo.set({
            title: `${b.name} Kitchen Equipment – Buy Online UAE`,
            description: b.description
              ?? `Shop all ${b.name} commercial kitchen equipment in UAE. Authorised dealer with best prices and fast delivery across Dubai, Abu Dhabi & Sharjah.`,
            keywords: `${b.name} UAE, ${b.name} kitchen equipment Dubai, buy ${b.name} online UAE`,
            image: b.logo,
            canonical: `https://www.innovativekitchen.ae/brands/${slug}`,
            breadcrumbs: [{ name: b.name, url: `/brands/${slug}` }],
          });
        }
      });
      this.productService.getProducts({ brand: slug }).subscribe(r => this.products.set(r.data));
    });
  }
}
