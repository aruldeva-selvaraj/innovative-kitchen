import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/http/api.service';
import { AedCurrencyPipe } from '../../shared/pipes/aed-currency.pipe';

interface Order {
  id: number;
  reference: string;
  status: string;
  total: number;
  items_count: number;
  created_at: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, AedCurrencyPipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-8">My Orders</h1>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else if (orders().length) {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="bg-white border rounded-xl p-6 flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-800">Order #{{ order.reference }}</p>
                <p class="text-sm text-gray-500 mt-1">{{ order.items_count }} items · {{ order.created_at | date }}</p>
              </div>
              <div class="text-right">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      [class]="statusClass(order.status)">
                  {{ order.status }}
                </span>
                <p class="font-bold text-primary mt-1">{{ order.total | aedCurrency }}</p>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-20">
          <span class="material-icons text-6xl text-gray-300">receipt_long</span>
          <p class="text-gray-500 mt-4 mb-6">No orders yet</p>
          <a routerLink="/shop" class="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark">
            Start Shopping
          </a>
        </div>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);

  ngOnInit() {
    this.api.get<Order[]>('/account/orders').subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }
}
