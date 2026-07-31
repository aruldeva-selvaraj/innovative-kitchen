import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlaceOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_company?: string;
  delivery_address?: string;
  city: string;
  notes?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
}

export interface PlaceOrderResponse {
  order_ref: string;
  subtotal: number;
  status: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  placeOrder(payload: PlaceOrderPayload): Observable<PlaceOrderResponse> {
    return this.http.post<PlaceOrderResponse>(`${this.apiUrl}/orders`, payload);
  }
}
