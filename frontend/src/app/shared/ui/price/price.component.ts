import { Component, input, computed } from '@angular/core';
import { AedCurrencyPipe } from '../../pipes/aed-currency.pipe';

@Component({
  selector: 'app-price',
  standalone: true,
  imports: [AedCurrencyPipe],
  template: `
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-primary font-bold" [class]="sizeClass()">
        {{ price() | aedCurrency }}
      </span>
      @if (originalPrice() && originalPrice()! > price()) {
        <span class="text-gray-400 line-through text-sm">
          {{ originalPrice() | aedCurrency }}
        </span>
        <span class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
          -{{ discount() }}%
        </span>
      }
    </div>
  `,
})
export class PriceComponent {
  readonly price = input.required<number>();
  readonly originalPrice = input<number | undefined>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly sizeClass = computed(() => ({
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }[this.size()]));

  readonly discount = computed(() => {
    const orig = this.originalPrice();
    if (!orig || orig <= this.price()) return 0;
    return Math.round(((orig - this.price()) / orig) * 100);
  });
}
