import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'aedCurrency', standalone: true })
export class AedCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, showSymbol = true): string {
    if (value == null) return '';
    const formatted = new Intl.NumberFormat('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return showSymbol ? `AED ${formatted}` : formatted;
  }
}
