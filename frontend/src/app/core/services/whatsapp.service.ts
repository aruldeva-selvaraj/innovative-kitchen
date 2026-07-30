import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly businessNumber = environment.whatsappNumber;

  buildProductLink(productName: string, productUrl: string): string {
    const message = encodeURIComponent(
      `Hi! I'm interested in: ${productName}\n${productUrl}`
    );
    return `https://wa.me/${this.businessNumber}?text=${message}`;
  }

  buildOrderLink(orderId: string): string {
    const message = encodeURIComponent(`Hi! I have a question about order #${orderId}`);
    return `https://wa.me/${this.businessNumber}?text=${message}`;
  }

  buildGeneralLink(message: string): string {
    return `https://wa.me/${this.businessNumber}?text=${encodeURIComponent(message)}`;
  }

  openChat(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
