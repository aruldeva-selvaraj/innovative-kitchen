import { Component, input, signal, computed } from '@angular/core';
import { Product } from '../../../features/catalog/data-access/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <section class="py-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800">{{ title() }}</h2>
        @if (viewAllLink()) {
          <a [href]="viewAllLink()" class="text-sm text-primary hover:underline">View All</a>
        }
      </div>

      <div class="relative">
        <button
          class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 disabled:opacity-30"
          (click)="prev()"
          [disabled]="currentIndex() === 0"
        >
          <span class="material-icons">chevron_left</span>
        </button>

        <div class="overflow-hidden">
          <div
            class="flex gap-4 transition-transform duration-300"
            [style.transform]="'translateX(-' + (currentIndex() * slideWidth()) + 'px)'"
          >
            @for (product of products(); track product.id) {
              <div class="flex-shrink-0 w-56">
                <app-product-card [product]="product" />
              </div>
            }
          </div>
        </div>

        <button
          class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 disabled:opacity-30"
          (click)="next()"
          [disabled]="currentIndex() >= maxIndex()"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </section>
  `,
})
export class ProductCarouselComponent {
  readonly products = input.required<Product[]>();
  readonly title = input.required<string>();
  readonly viewAllLink = input<string>();
  readonly itemsVisible = input(5);

  readonly currentIndex = signal(0);
  readonly slideWidth = computed(() => 232); // 56*4 + gap

  readonly maxIndex = computed(() =>
    Math.max(0, this.products().length - this.itemsVisible())
  );

  prev() { this.currentIndex.update(i => Math.max(0, i - 1)); }
  next() { this.currentIndex.update(i => Math.min(this.maxIndex(), i + 1)); }
}
