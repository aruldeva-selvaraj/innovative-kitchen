import { Component, inject, input, output } from '@angular/core';
import { Product } from '../../../features/catalog/data-access/product.model';
import { CartService } from '../../../core/services/cart.service';
import { PriceComponent } from '../price/price.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-view-dialog',
  standalone: true,
  imports: [PriceComponent, RouterLink],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         (click)="close.emit()">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <div class="flex justify-end p-4">
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-8 p-6 pt-0">
          <div>
            <img [src]="product().thumbnail" [alt]="product().name"
                 class="w-full object-contain h-64" />
          </div>

          <div class="space-y-4">
            <p class="text-sm text-gray-400">{{ product().brand?.name }}</p>
            <h2 class="text-xl font-bold text-gray-800">{{ product().name }}</h2>
            <app-price [price]="product().price" [originalPrice]="product().original_price" size="lg" />

            <p class="text-sm text-gray-600 line-clamp-4">{{ product().short_description }}</p>

            <button
              class="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark"
              (click)="addToCart()"
            >
              Add to Cart
            </button>

            <a [routerLink]="['/shop/product', product().slug]"
               class="block text-center text-sm text-primary hover:underline">
              View Full Details
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class QuickViewDialogComponent {
  readonly product = input.required<Product>();
  readonly close = output<void>();

  private readonly cart = inject(CartService);

  addToCart() {
    const p = this.product();
    this.cart.add({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      image: p.thumbnail,
      price: p.price,
      quantity: 1,
    });
    this.close.emit();
  }
}
