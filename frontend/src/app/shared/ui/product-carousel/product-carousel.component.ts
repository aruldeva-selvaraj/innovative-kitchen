import { Component, ElementRef, ViewChild, input, signal, computed } from '@angular/core';
import { Product } from '../../../features/catalog/data-access/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <section class="py-6 sm:py-8">
      <div class="flex items-center justify-between mb-4 px-1">
        <h2 class="text-lg sm:text-xl font-bold text-gray-800">{{ title() }}</h2>
        @if (viewAllLink()) {
          <a [href]="viewAllLink()" class="text-sm text-primary hover:underline flex-shrink-0">View All</a>
        }
      </div>

      <div class="relative">
        <!-- Prev button — desktop only -->
        <button
          class="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10
                 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 disabled:opacity-30
                 transition-opacity"
          (click)="prev()"
          [disabled]="atStart()"
          aria-label="Previous"
        >
          <span class="material-icons">chevron_left</span>
        </button>

        <!--
          Scroll container:
          • Mobile/tablet: native horizontal scroll + touch swipe (snap-x)
          • Desktop: programmatic scroll via prev/next buttons
          • Scrollbar hidden on all platforms
        -->
        <div
          #scrollEl
          class="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory
                 pb-2 -mx-1 px-1
                 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style="touch-action: pan-x"
          (scroll)="onScroll()"
        >
          @for (product of products(); track product.id) {
            <div class="flex-shrink-0 snap-start
                        w-[155px] xs:w-[170px] sm:w-[185px] md:w-[200px] lg:w-[220px]">
              <app-product-card [product]="product" />
            </div>
          }
        </div>

        <!-- Next button — desktop only -->
        <button
          class="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10
                 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 disabled:opacity-30
                 transition-opacity"
          (click)="next()"
          [disabled]="atEnd()"
          aria-label="Next"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>

      <!-- Dot indicators — mobile only -->
      @if (products().length > 1) {
        <div class="flex justify-center gap-1.5 mt-3 md:hidden">
          @for (p of products(); track p.id; let i = $index) {
            <button
              class="w-1.5 h-1.5 rounded-full transition-colors"
              [class.bg-primary]="activeDot() === i"
              [class.bg-gray-300]="activeDot() !== i"
              (click)="scrollToIndex(i)"
              [attr.aria-label]="'Go to item ' + (i + 1)"
            ></button>
          }
        </div>
      }
    </section>
  `,
})
export class ProductCarouselComponent {
  readonly products = input.required<Product[]>();
  readonly title = input.required<string>();
  readonly viewAllLink = input<string>();

  @ViewChild('scrollEl') scrollEl!: ElementRef<HTMLDivElement>;

  readonly atStart = signal(true);
  readonly atEnd = signal(false);
  readonly activeDot = signal(0);

  private get el(): HTMLDivElement | undefined {
    return this.scrollEl?.nativeElement;
  }

  onScroll() {
    const el = this.el;
    if (!el) return;
    this.atStart.set(el.scrollLeft <= 4);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);

    const cardWidth = this.cardPx();
    if (cardWidth > 0) {
      this.activeDot.set(Math.round(el.scrollLeft / cardWidth));
    }
  }

  prev() {
    this.el?.scrollBy({ left: -(this.cardPx() * 2), behavior: 'smooth' });
  }

  next() {
    this.el?.scrollBy({ left: this.cardPx() * 2, behavior: 'smooth' });
  }

  scrollToIndex(i: number) {
    this.el?.scrollTo({ left: i * this.cardPx(), behavior: 'smooth' });
  }

  private cardPx(): number {
    const firstCard = this.el?.children[0] as HTMLElement | undefined;
    if (!firstCard) return 220;
    return firstCard.offsetWidth + 12; // card width + gap-3 (12px)
  }
}
