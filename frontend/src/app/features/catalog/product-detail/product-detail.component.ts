import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../data-access/product.service';
import { Product } from '../data-access/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { PriceComponent } from '../../../shared/ui/price/price.component';
import { ProductCarouselComponent } from '../../../shared/ui/product-carousel/product-carousel.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, PriceComponent, ProductCarouselComponent],
  template: `
    @if (loading()) {
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-2 gap-8 animate-pulse">
          <div class="h-96 bg-gray-100 rounded-xl"></div>
          <div class="space-y-4">
            <div class="h-6 bg-gray-100 rounded w-3/4"></div>
            <div class="h-10 bg-gray-100 rounded w-1/2"></div>
            <div class="h-24 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    } @else if (product()) {
      <div class="container mx-auto px-4 py-8">
        <!-- Breadcrumb -->
        <nav class="text-sm text-gray-500 mb-6">
          <a routerLink="/" class="hover:text-primary">Home</a>
          <span class="mx-2">/</span>
          @if (product()!.category) {
            <a [routerLink]="['/shop/category', product()!.category!.slug]" class="hover:text-primary">
              {{ product()!.category!.name }}
            </a>
            <span class="mx-2">/</span>
          }
          <span class="text-gray-800">{{ product()!.name }}</span>
        </nav>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <!-- Images -->
          <div>
            <div class="border rounded-xl overflow-hidden mb-3">
              <img [src]="activeImage()" [alt]="product()!.name" class="w-full h-96 object-contain p-4" />
            </div>
            <div class="flex gap-2">
              @for (img of product()!.images; track img) {
                <button class="border rounded-lg overflow-hidden w-16 h-16"
                        [class.border-primary]="activeImage() === img"
                        (click)="activeImage.set(img)">
                  <img [src]="img" [alt]="product()!.name" class="w-full h-full object-contain" />
                </button>
              }
            </div>
          </div>

          <!-- Info -->
          <div class="space-y-4">
            @if (product()!.brand) {
              <a [routerLink]="['/brands', product()!.brand!.slug]"
                 class="text-sm text-gray-400 hover:text-primary">
                {{ product()!.brand!.name }}
              </a>
            }
            <h1 class="text-2xl font-bold text-gray-800">{{ product()!.name }}</h1>
            <app-price [price]="product()!.price" [originalPrice]="product()!.original_price" size="lg" />

            <p class="text-sm text-gray-600 leading-relaxed">{{ product()!.short_description }}</p>

            <!-- Stock -->
            <div>
              @if (product()!.in_stock) {
                <span class="text-green-600 text-sm font-medium">In Stock</span>
              } @else {
                <span class="text-red-500 text-sm font-medium">Out of Stock</span>
              }
            </div>

            <!-- Quantity -->
            <div class="flex items-center gap-3">
              <button (click)="qty.set(Math.max(1, qty() - 1))"
                      class="w-9 h-9 border rounded-lg">-</button>
              <span class="w-12 text-center font-medium">{{ qty() }}</span>
              <button (click)="qty.set(qty() + 1)" class="w-9 h-9 border rounded-lg">+</button>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                class="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50"
                [disabled]="!product()!.in_stock"
                (click)="addToCart()"
              >
                Add to Cart
              </button>
              <button
                class="p-3 border rounded-xl hover:bg-gray-50"
                (click)="toggleWishlist()"
              >
                <span class="material-icons" [class.text-red-500]="isWishlisted()">
                  {{ isWishlisted() ? 'favorite' : 'favorite_border' }}
                </span>
              </button>
              <button
                class="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
                (click)="openWhatsapp()"
              >
                <span class="material-icons">chat</span>
              </button>
            </div>

            <!-- Specs -->
            @if (product()!.specs && objectKeys(product()!.specs!).length) {
              <div class="border rounded-xl p-4 mt-4">
                <h3 class="font-semibold mb-3">Specifications</h3>
                <dl class="grid grid-cols-2 gap-2 text-sm">
                  @for (key of objectKeys(product()!.specs!); track key) {
                    <dt class="text-gray-500">{{ key }}</dt>
                    <dd class="font-medium">{{ product()!.specs![key] }}</dd>
                  }
                </dl>
              </div>
            }
          </div>
        </div>

        <!-- Related Products -->
        @if (related().length) {
          <div class="mt-16">
            <app-product-carousel title="Related Products" [products]="related()" />
          </div>
        }
      </div>
    }
  `,
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly whatsapp = inject(WhatsappService);

  readonly product = signal<Product | null>(null);
  readonly related = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly activeImage = signal('');
  readonly qty = signal(1);
  readonly Math = Math;
  readonly objectKeys = Object.keys;

  readonly isWishlisted = () =>
    this.wishlist.items().some(i => i.productId === this.product()?.id);

  ngOnInit() {
    this.route.params.subscribe(({ slug }) => {
      this.loading.set(true);
      this.productService.getProduct(slug).subscribe({
        next: p => {
          this.product.set(p);
          this.activeImage.set(p.thumbnail);
          this.loading.set(false);
          this.productService.getRelated(p.id).subscribe(r => this.related.set(r));
        },
        error: () => this.loading.set(false),
      });
    });
  }

  addToCart() {
    const p = this.product()!;
    this.cart.add({ productId: p.id, name: p.name, slug: p.slug, image: p.thumbnail, price: p.price, quantity: this.qty() });
  }

  toggleWishlist() {
    const p = this.product()!;
    this.wishlist.toggle({ productId: p.id, name: p.name, slug: p.slug, image: p.thumbnail, price: p.price, originalPrice: p.original_price });
  }

  openWhatsapp() {
    const p = this.product()!;
    const url = this.whatsapp.buildProductLink(p.name, `${window.location.origin}/shop/product/${p.slug}`);
    this.whatsapp.openChat(url);
  }
}
