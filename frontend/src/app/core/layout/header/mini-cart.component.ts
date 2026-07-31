import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WhatsappService } from '../../services/whatsapp.service';
import { AedCurrencyPipe } from '../../../shared/pipes/aed-currency.pipe';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [RouterLink, AedCurrencyPipe],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex justify-end" (click)="close.emit()">
      <!-- Panel: full width on mobile, 384px on sm+ -->
      <div
        class="bg-white w-full sm:w-96 h-full shadow-2xl flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="font-semibold text-lg">Cart ({{ cart.count() }})</h2>
          <button (click)="close.emit()" class="p-1 text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          @for (item of cart.items(); track item.productId) {
            <div class="flex gap-3">
              <img [src]="item.image" [alt]="item.name"
                   class="w-16 h-16 object-cover rounded flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium line-clamp-2">{{ item.name }}</p>
                <p class="text-sm text-primary font-semibold">{{ item.price | aedCurrency }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <button
                    (click)="cart.updateQuantity(item.productId, item.quantity - 1)"
                    class="w-7 h-7 border rounded text-sm flex items-center justify-center hover:bg-gray-50">−
                  </button>
                  <span class="text-sm w-5 text-center">{{ item.quantity }}</span>
                  <button
                    (click)="cart.updateQuantity(item.productId, item.quantity + 1)"
                    class="w-7 h-7 border rounded text-sm flex items-center justify-center hover:bg-gray-50">+
                  </button>
                </div>
              </div>
              <button (click)="cart.remove(item.productId)"
                      class="flex-shrink-0 text-red-400 hover:text-red-600 p-1">
                <span class="material-icons text-sm">delete</span>
              </button>
            </div>
          } @empty {
            <p class="text-center text-gray-400 py-8">Your cart is empty</p>
          }
        </div>

        <div class="p-4 border-t space-y-2">
          <div class="flex justify-between font-semibold mb-1">
            <span>Subtotal</span>
            <span>{{ cart.subtotal() | aedCurrency }}</span>
          </div>
          <button
            (click)="requestQuote()"
            class="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600
                   text-white py-3 rounded-lg font-semibold transition-colors text-sm">
            <span class="material-icons text-base">chat</span>
            Request Quote via WhatsApp
          </button>
          <a routerLink="/cart" (click)="close.emit()"
             class="block w-full text-center text-primary text-sm py-2 hover:underline">
            View Full Quote List
          </a>
        </div>
      </div>
    </div>
  `,
})
export class MiniCartComponent {
  readonly cart = inject(CartService);
  readonly close = output<void>();
  private readonly whatsapp = inject(WhatsappService);

  requestQuote(): void {
    const url = this.whatsapp.buildQuoteLink(
      this.cart.items().map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
    );
    this.whatsapp.openChat(url);
    this.close.emit();
  }
}
