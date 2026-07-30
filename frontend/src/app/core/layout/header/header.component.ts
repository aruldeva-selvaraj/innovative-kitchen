import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../auth/auth.service';
import { MegaMenuComponent } from './mega-menu.component';
import { MiniCartComponent } from './mini-cart.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MegaMenuComponent, MiniCartComponent],
  template: `
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <!-- Top bar -->
        <div class="flex items-center justify-between py-3 border-b">
          <a routerLink="/" class="text-2xl font-bold text-primary">MyShop</a>

          <!-- Search -->
          <div class="flex-1 max-w-xl mx-8">
            <input
              type="search"
              placeholder="Search products..."
              class="w-full border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              (keyup.enter)="onSearch($event)"
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            @if (auth.isAuthenticated()) {
              <a routerLink="/account/orders" class="text-sm text-gray-600 hover:text-primary">
                My Orders
              </a>
            } @else {
              <a routerLink="/account/login" class="text-sm text-gray-600 hover:text-primary">
                Login
              </a>
            }

            <a routerLink="/wishlist" class="relative">
              <span class="material-icons">favorite_border</span>
              @if (wishlist.count() > 0) {
                <span class="badge">{{ wishlist.count() }}</span>
              }
            </a>

            <button class="relative" (click)="toggleCart()">
              <span class="material-icons">shopping_cart</span>
              @if (cart.count() > 0) {
                <span class="badge">{{ cart.count() }}</span>
              }
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <app-mega-menu />
      </div>

      @if (cartOpen()) {
        <app-mini-cart (close)="toggleCart()" />
      }
    </header>
  `,
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  readonly wishlist = inject(WishlistService);
  readonly auth = inject(AuthService);
  readonly cartOpen = signal(false);

  toggleCart() {
    this.cartOpen.update(v => !v);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    if (value) window.location.href = `/search?q=${encodeURIComponent(value)}`;
  }
}
