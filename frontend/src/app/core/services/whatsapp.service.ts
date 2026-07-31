import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly businessNumber = environment.whatsappNumber;

  buildProductLink(productName: string, productUrl: string, sku?: string): string {
    const skuLine = sku ? `\nProduct Code: ${sku}` : '';
    const message = encodeURIComponent(
      `Hi! I'm interested in the following product:${skuLine}\n${productName}\n${productUrl}\n\nPlease share availability and best price. Thank you!`
    );
    return `https://wa.me/${this.businessNumber}?text=${message}`;
  }

  buildCheckoutEnquiryLink(
    items: { name: string; quantity: number; price: number; sku?: string }[],
    customer: { name: string; phone: string; email?: string; company?: string; address?: string; city?: string; notes?: string },
    orderRef?: string
  ): string {
    const lines = items.map(i => {
      const skuPart = i.sku ? ` [${i.sku}]` : '';
      return `• ${i.name}${skuPart} × ${i.quantity} — AED ${(i.price * i.quantity).toFixed(2)}`;
    });
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const customerLines = [
      `Name: ${customer.name}`,
      `Phone: ${customer.phone}`,
      customer.email    ? `Email: ${customer.email}`       : '',
      customer.company  ? `Company: ${customer.company}`   : '',
      customer.address  ? `Address: ${customer.address}`   : '',
      customer.city     ? `City: ${customer.city}`         : '',
      customer.notes    ? `Notes: ${customer.notes}`       : '',
    ].filter(Boolean);

    const refLine = orderRef ? [`Order Ref: ${orderRef}`, ''] : [];

    const message = [
      'Hello! I would like to request a quote for the following items:',
      '',
      ...refLine,
      ...lines,
      '',
      `Estimated Total: AED ${total.toFixed(2)}`,
      '',
      '--- Customer Details ---',
      ...customerLines,
      '',
      'Please confirm availability, pricing, and delivery. Thank you!',
    ].join('\n');

    return `https://wa.me/${this.businessNumber}?text=${encodeURIComponent(message)}`;
  }

  buildOrderLink(orderId: string): string {
    const message = encodeURIComponent(`Hi! I have a question about order #${orderId}`);
    return `https://wa.me/${this.businessNumber}?text=${message}`;
  }

  buildGeneralLink(message: string): string {
    return `https://wa.me/${this.businessNumber}?text=${encodeURIComponent(message)}`;
  }

  buildQuoteLink(items: { name: string; quantity: number; price: number }[]): string {
    const lines = items.map(
      i => `• ${i.name} × ${i.quantity} — د.إ ${(i.price * i.quantity).toFixed(2)}`
    );
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const message = [
      'Hello! I would like to request a quote for the following items:',
      '',
      ...lines,
      '',
      `Total: د.إ ${total.toFixed(2)}`,
      '',
      'Please confirm availability and best price. Thank you!',
    ].join('\n');
    return `https://wa.me/${this.businessNumber}?text=${encodeURIComponent(message)}`;
  }

  openChat(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
