import { Component, inject, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../features/catalog/data-access/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CompareService } from '../../../core/services/compare.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { PriceComponent } from '../price/price.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, PriceComponent],
  template: `
    <div class="group relative bg-white rounded-xl border hover:shadow-lg transition-shadow duration-200">
      <!-- Badges -->
      <div class="absolute top-2 left-2 flex flex-col gap-1 z-10">
        @if (product().is_new) {
          <span class="bg-green-500 text-white text-xs px-2 py-0.5 rounded">New</span>
        }
        @if (discountPct() > 0) {
          <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded">-{{ discountPct() }}%</span>
        }
      </div>

      <!-- Wishlist -->
      <button
        class="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
        (click)="toggleWishlist()"
      >
        <span class="material-icons text-sm" [class.text-red-500]="isWishlisted()">
          {{ isWishlisted() ? 'favorite' : 'favorite_border' }}
        </span>
      </button>

      <!-- Image -->
      <a [routerLink]="['/shop/product', product().slug]" class="block overflow-hidden rounded-t-xl">
        <img
          [src]="product().thumbnail"
          [alt]="product().name"
          class="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </a>

      <!-- Info -->
      <div class="p-3">
        <p class="text-xs text-gray-400 mb-1">{{ product().brand?.name }}</p>
        <a [routerLink]="['/shop/product', product().slug]"
           class="text-sm font-medium text-gray-800 hover:text-primary line-clamp-2 block">
          {{ product().name }}
        </a>

        <div class="mt-2">
          <app-price [price]="product().price" [originalPrice]="product().original_price" />
        </div>

        <!-- Actions -->
        <div class="mt-3 flex gap-2">
          <button
            class="flex-1 bg-primary text-white text-sm py-2 rounded-lg hover:bg-primary-dark transition-colors"
            (click)="addToCart()"
          >
            Add to Cart
          </button>
          <button
            class="p-2 border rounded-lg hover:bg-green-50 text-green-600"
            (click)="openWhatsapp()"
            title="Enquire on WhatsApp"
          >
            <span class="material-icons text-sm">chat</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly cartAdded = output<Product>();

  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly compareService = inject(CompareService);
  private readonly whatsapp = inject(WhatsappService);

  readonly isWishlisted = computed(() =>
    this.wishlistService.items().some(i => i.productId === this.product().id)
  );

  readonly discountPct = computed(() => {
    const p = this.product();
    if (!p.original_price || p.original_price <= p.price) return 0;
    return Math.round(((p.original_price - p.price) / p.original_price) * 100);
  });

  addToCart() {
    const p = this.product();
    this.cartService.add({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: p.thumbnail,
      price: p.price,
      quantity: 1,
      sku: p.sku,
    });
    this.cartAdded.emit(p);
  }

  toggleWishlist() {
    const p = this.product();
    this.wishlistService.toggle({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: p.thumbnail,
      price: p.price,
      originalPrice: p.original_price,
    });
  }

  openWhatsapp() {
    const p = this.product();
    const url = this.whatsapp.buildProductLink(p.name, `${window.location.origin}/shop/product/${p.slug}`);
    this.whatsapp.openChat(url);
  }
}
