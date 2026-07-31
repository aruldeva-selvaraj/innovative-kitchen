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
        class="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow
               opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
          class="w-full h-36 xs:h-40 sm:h-44 md:h-48 object-contain p-3 group-hover:scale-105 transition-transform duration-300"
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
        <div class="mt-3 flex flex-col gap-2">
          <div class="flex gap-2">
            <button
              class="flex-1 bg-primary text-white text-sm py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
              (click)="addToCart()"
            >
              Add to Cart
            </button>
          </div>
          <button
            class="flex items-center justify-center gap-1.5 w-full border border-green-500 text-green-600 text-sm py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
            (click)="openWhatsapp()"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.847L.058 23.5l5.788-1.517A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            Enquire on WhatsApp
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
    const url = this.whatsapp.buildProductLink(
      p.name,
      `${window.location.origin}/shop/product/${p.slug}`,
      p.sku
    );
    this.whatsapp.openChat(url);
  }
}
