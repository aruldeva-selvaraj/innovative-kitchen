import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { PriceComponent } from '../../shared/ui/price/price.component';
import { AedCurrencyPipe } from '../../shared/pipes/aed-currency.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, PriceComponent, AedCurrencyPipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-8">Quote Request</h1>

      @if (cart.items().length) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cart.items(); track item.productId) {
              <div class="flex gap-4 bg-white border rounded-xl p-4">
                <img [src]="item.image" [alt]="item.name"
                     class="w-20 h-20 object-contain rounded-lg flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <a [routerLink]="['/shop/product', item.slug]"
                     class="font-medium text-gray-800 hover:text-primary line-clamp-2 block">
                    {{ item.name }}
                  </a>
                  @if (item.sku) {
                    <p class="text-xs text-gray-400 mt-0.5">SKU: {{ item.sku }}</p>
                  }
                  <app-price [price]="item.price" class="mt-1" />

                  <div class="flex items-center gap-3 mt-2">
                    <button (click)="cart.updateQuantity(item.productId, item.quantity - 1)"
                            class="w-8 h-8 border rounded text-sm hover:bg-gray-50">−</button>
                    <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                    <button (click)="cart.updateQuantity(item.productId, item.quantity + 1)"
                            class="w-8 h-8 border rounded text-sm hover:bg-gray-50">+</button>
                    <button (click)="cart.remove(item.productId)"
                            class="ml-auto text-red-400 hover:text-red-600 text-sm">
                      Remove
                    </button>
                  </div>
                </div>
                <div class="text-right font-semibold text-primary whitespace-nowrap">
                  {{ item.price * item.quantity | aedCurrency }}
                </div>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="bg-white border rounded-xl p-6 h-fit space-y-4">
            <h2 class="font-bold text-lg">Order Summary</h2>

            <div class="flex justify-between text-sm">
              <span>Subtotal ({{ cart.count() }} items)</span>
              <span>{{ cart.subtotal() | aedCurrency }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Shipping</span>
              <span class="text-green-600">TBD on quote</span>
            </div>

            <div class="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Estimated Total</span>
              <span class="text-primary">{{ cart.subtotal() | aedCurrency }}</span>
            </div>

            <!-- Proceed to Checkout CTA -->
            <a
              routerLink="/checkout"
              class="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark
                     text-white py-3 rounded-xl font-semibold transition-colors text-center">
              <span class="material-icons text-base">arrow_forward</span>
              Proceed to Checkout
            </a>

            <a routerLink="/shop" class="block text-center text-sm text-primary hover:underline">
              Continue Shopping
            </a>

            <p class="text-xs text-gray-400 text-center">
              You'll fill in your details on the next step and send your enquiry via WhatsApp.
            </p>
          </div>
        </div>
      } @else {
        <div class="text-center py-20">
          <span class="material-icons text-6xl text-gray-300">shopping_cart</span>
          <p class="text-gray-500 mt-4 mb-6">Your quote list is empty</p>
          <a routerLink="/shop"
             class="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark">
            Browse Products
          </a>
        </div>
      }
    </div>
  `,
})
export class CartComponent {
  readonly cart = inject(CartService);
}
