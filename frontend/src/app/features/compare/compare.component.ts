import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompareService } from '../../core/services/compare.service';
import { AedCurrencyPipe } from '../../shared/pipes/aed-currency.pipe';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [RouterLink, AedCurrencyPipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Compare Products ({{ compare.count() }}/4)</h1>
        @if (compare.count() > 0) {
          <button (click)="compare.clear()" class="text-sm text-red-500 hover:underline">Clear All</button>
        }
      </div>

      @if (compare.items().length > 1) {
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="w-40 p-4 text-left bg-gray-50 text-sm font-medium text-gray-500">Attribute</th>
                @for (item of compare.items(); track item.productId) {
                  <th class="p-4 text-center border-l">
                    <div class="relative">
                      <button (click)="compare.remove(item.productId)"
                              class="absolute -top-2 -right-2 text-red-400 hover:text-red-600">
                        <span class="material-icons text-sm">close</span>
                      </button>
                      <img [src]="item.image" [alt]="item.name" class="w-24 h-24 object-contain mx-auto mb-2" />
                      <a [routerLink]="['/shop/product', item.slug]"
                         class="text-sm font-medium hover:text-primary line-clamp-2">
                        {{ item.name }}
                      </a>
                    </div>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              <tr class="border-t">
                <td class="p-4 text-sm font-medium text-gray-500 bg-gray-50">Price</td>
                @for (item of compare.items(); track item.productId) {
                  <td class="p-4 text-center border-l font-bold text-primary">
                    {{ item.price | aedCurrency }}
                  </td>
                }
              </tr>
              @for (key of allSpecKeys(); track key) {
                <tr class="border-t">
                  <td class="p-4 text-sm font-medium text-gray-500 bg-gray-50">{{ key }}</td>
                  @for (item of compare.items(); track item.productId) {
                    <td class="p-4 text-center border-l text-sm">
                      {{ item.specs[key] ?? '—' }}
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="text-center py-20">
          <span class="material-icons text-6xl text-gray-300">compare_arrows</span>
          <p class="text-gray-500 mt-4 mb-2">Add at least 2 products to compare</p>
          <p class="text-sm text-gray-400 mb-6">Use the compare button on product cards</p>
          <a routerLink="/shop" class="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark">
            Browse Products
          </a>
        </div>
      }
    </div>
  `,
})
export class CompareComponent {
  readonly compare = inject(CompareService);

  readonly allSpecKeys = computed(() => {
    const keys = new Set<string>();
    this.compare.items().forEach(item => Object.keys(item.specs ?? {}).forEach(k => keys.add(k)));
    return [...keys];
  });
}
