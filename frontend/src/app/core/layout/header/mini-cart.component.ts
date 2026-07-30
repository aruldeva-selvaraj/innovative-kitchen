import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AedCurrencyPipe } from '../../../shared/pipes/aed-currency.pipe';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [RouterLink, AedCurrencyPipe],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end" (click)="close.emit()">
      <div class="bg-white w-96 h-full shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="font-semibold text-lg">Cart ({{ cart.count() }})</h2>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          @for (item of cart.items(); track item.productId) {
            <div class="flex gap-3">
              <img [src]="item.image" [alt]="item.name" class="w-16 h-16 object-cover rounded" />
              <div class="flex-1">
                <p class="text-sm font-medium line-clamp-2">{{ item.name }}</p>
                <p class="text-sm text-primary font-semibold">{{ item.price | aedCurrency }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <button (click)="cart.updateQuantity(item.productId, item.quantity - 1)"
                          class="w-6 h-6 border rounded text-sm">-</button>
                  <span class="text-sm">{{ item.quantity }}</span>
                  <button (click)="cart.updateQuantity(item.productId, item.quantity + 1)"
                          class="w-6 h-6 border rounded text-sm">+</button>
                </div>
              </div>
              <button (click)="cart.remove(item.productId)" class="text-red-400 hover:text-red-600">
                <span class="material-icons text-sm">delete</span>
              </button>
            </div>
          } @empty {
            <p class="text-center text-gray-400 py-8">Your cart is empty</p>
          }
        </div>

        <div class="p-4 border-t">
          <div class="flex justify-between font-semibold mb-4">
            <span>Subtotal</span>
            <span>{{ cart.subtotal() | aedCurrency }}</span>
          </div>
          <a routerLink="/cart" (click)="close.emit()"
             class="block w-full text-center bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark">
            View Cart & Checkout
          </a>
        </div>
      </div>
    </div>
  `,
})
export class MiniCartComponent {
  readonly cart = inject(CartService);
  readonly close = output<void>();
}
