import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { PriceComponent } from '../../shared/ui/price/price.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, PriceComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-8">My Wishlist ({{ wishlist.count() }})</h1>

      @if (wishlist.items().length) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          @for (item of wishlist.items(); track item.productId) {
            <div class="bg-white border rounded-xl p-4 relative group">
              <button
                class="absolute top-3 right-3 text-gray-300 hover:text-red-500"
                (click)="wishlist.remove(item.productId)"
              >
                <span class="material-icons">close</span>
              </button>

              <a [routerLink]="['/shop/product', item.slug]">
                <img [src]="item.image" [alt]="item.name" class="w-full h-40 object-contain mb-3" />
                <p class="font-medium text-gray-800 hover:text-primary line-clamp-2 text-sm">{{ item.name }}</p>
              </a>

              <app-price [price]="item.price" [originalPrice]="item.originalPrice" class="mt-2" />

              <button
                class="mt-3 w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"
                (click)="moveToCart(item)"
              >
                Move to Cart
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-20">
          <span class="material-icons text-6xl text-gray-300">favorite_border</span>
          <p class="text-gray-500 mt-4 mb-6">Your wishlist is empty</p>
          <a routerLink="/shop" class="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark">
            Discover Products
          </a>
        </div>
      }
    </div>
  `,
})
export class WishlistComponent {
  readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);

  moveToCart(item: any) {
    this.cart.add({ productId: item.productId, name: item.name, slug: item.slug, image: item.image, price: item.price, quantity: 1 });
    this.wishlist.remove(item.productId);
  }
}
