import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { OrderService, PlaceOrderPayload } from '../../core/services/order.service';
import { AedCurrencyPipe } from '../../shared/pipes/aed-currency.pipe';

interface EnquiryForm {
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  city: string;
  notes: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, AedCurrencyPipe],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-6xl">

      <!-- ── Order Confirmed State ── -->
      @if (confirmedRef()) {
        <div class="max-w-lg mx-auto text-center py-12 space-y-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span class="material-icons text-4xl text-green-500">check_circle</span>
          </div>

          <div>
            <h1 class="text-2xl font-bold text-gray-800">Enquiry Received!</h1>
            <p class="text-gray-500 mt-2">Our team will contact you within 2 business hours.</p>
          </div>

          <div class="bg-gray-50 border rounded-2xl p-6 space-y-1">
            <p class="text-xs text-gray-400 uppercase tracking-widest">Order Reference</p>
            <p class="text-3xl font-mono font-bold text-primary tracking-widest">{{ confirmedRef() }}</p>
            <p class="text-xs text-gray-400 mt-1">Please quote this number in all communications</p>
          </div>

          <!-- WhatsApp CTA -->
          <button
            (click)="sendWhatsApp()"
            class="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600
                   text-white py-3.5 rounded-xl font-semibold transition-colors">
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.847L.058 23.5l5.788-1.517A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            Also Send via WhatsApp
          </button>

          <a routerLink="/shop" class="block text-sm text-primary hover:underline">
            Continue Shopping
          </a>
        </div>

      <!-- ── Empty Cart ── -->
      } @else if (cart.items().length === 0) {
        <div class="text-center py-20">
          <span class="material-icons text-6xl text-gray-300">shopping_cart</span>
          <p class="text-gray-500 mt-4 mb-6">Your quote list is empty</p>
          <a routerLink="/shop"
             class="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark">
            Browse Products
          </a>
        </div>

      <!-- ── Enquiry Form ── -->
      } @else {
        <!-- Breadcrumb -->
        <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <a routerLink="/cart" class="hover:text-primary">Quote List</a>
          <span class="material-icons text-xs">chevron_right</span>
          <span class="text-gray-700 font-medium">Your Details</span>
        </nav>

        <h1 class="text-2xl font-bold text-gray-800 mb-8">Complete Your Enquiry</h1>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <!-- Order Summary -->
          <div class="lg:col-span-2 space-y-4">
            <h2 class="font-semibold text-gray-700 text-lg border-b pb-2">Order Summary</h2>

            <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              @for (item of cart.items(); track item.productId) {
                <div class="flex gap-3 bg-white border rounded-xl p-3">
                  <img [src]="item.image" [alt]="item.name"
                       class="w-14 h-14 object-contain rounded-lg flex-shrink-0 bg-gray-50" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 line-clamp-2">{{ item.name }}</p>
                    @if (item.sku) {
                      <p class="text-xs text-gray-400">SKU: {{ item.sku }}</p>
                    }
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-xs text-gray-500">Qty: {{ item.quantity }}</span>
                      <span class="text-sm font-semibold text-primary">
                        {{ item.price * item.quantity | aedCurrency }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Items ({{ cart.count() }})</span>
                <span>{{ cart.subtotal() | aedCurrency }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span class="text-green-600 font-medium">TBD on quote</span>
              </div>
              <div class="flex justify-between font-bold text-base border-t pt-2">
                <span>Estimated Total</span>
                <span class="text-primary">{{ cart.subtotal() | aedCurrency }}</span>
              </div>
            </div>

            <a routerLink="/cart" class="flex items-center gap-1 text-sm text-primary hover:underline">
              <span class="material-icons text-sm">edit</span>
              Edit quote list
            </a>
          </div>

          <!-- Form -->
          <div class="lg:col-span-3">
            <h2 class="font-semibold text-gray-700 text-lg border-b pb-2 mb-4">Your Details</h2>

            <form (ngSubmit)="submitOrder()" class="space-y-4">

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    [ngModel]="form().name"
                    (ngModelChange)="updateField('name', $event)"
                    placeholder="Ahmed Al Mansouri"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    [class.border-red-400]="submitted() && !form().name.trim()"
                  />
                  @if (submitted() && !form().name.trim()) {
                    <p class="text-red-500 text-xs mt-1">Full name is required</p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Phone / WhatsApp <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    [ngModel]="form().phone"
                    (ngModelChange)="updateField('phone', $event)"
                    placeholder="+971 50 123 4567"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    [class.border-red-400]="submitted() && !form().phone.trim()"
                  />
                  @if (submitted() && !form().phone.trim()) {
                    <p class="text-red-500 text-xs mt-1">Phone number is required</p>
                  }
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  [ngModel]="form().email"
                  (ngModelChange)="updateField('email', $event)"
                  placeholder="ahmed@restaurant.ae"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Company / Business Name
                </label>
                <input
                  type="text"
                  name="company"
                  [ngModel]="form().company"
                  (ngModelChange)="updateField('company', $event)"
                  placeholder="Al Basha Restaurant LLC"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  [ngModel]="form().address"
                  (ngModelChange)="updateField('address', $event)"
                  placeholder="123 Sheikh Zayed Road, Near Mall of Emirates"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  City / Emirate <span class="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  [ngModel]="form().city"
                  (ngModelChange)="updateField('city', $event)"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  [class.border-red-400]="submitted() && !form().city"
                >
                  <option value="">Select city</option>
                  <option>Dubai</option>
                  <option>Abu Dhabi</option>
                  <option>Sharjah</option>
                  <option>Ajman</option>
                  <option>Ras Al Khaimah</option>
                  <option>Fujairah</option>
                  <option>Umm Al Quwain</option>
                  <option>Al Ain</option>
                </select>
                @if (submitted() && !form().city) {
                  <p class="text-red-500 text-xs mt-1">Please select your city</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements / Notes
                </label>
                <textarea
                  name="notes"
                  [ngModel]="form().notes"
                  (ngModelChange)="updateField('notes', $event)"
                  rows="3"
                  placeholder="e.g. Need installation, delivery by specific date, alternative models acceptable..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                ></textarea>
              </div>

              @if (apiError()) {
                <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {{ apiError() }}
                </div>
              }

              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="loading()"
                  class="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark
                         disabled:opacity-60 disabled:cursor-not-allowed
                         text-white py-3.5 rounded-xl font-semibold transition-colors text-base"
                >
                  @if (loading()) {
                    <span class="material-icons animate-spin text-base">sync</span>
                    Placing Order…
                  } @else {
                    <span class="material-icons text-base">assignment_turned_in</span>
                    Place Order
                  }
                </button>

                <p class="text-xs text-gray-400 text-center mt-3">
                  Your order reference will be generated instantly.
                  You can also send your enquiry via WhatsApp after placing the order.
                </p>
              </div>
            </form>
          </div>

        </div>
      }
    </div>
  `,
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly orderService = inject(OrderService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly confirmedRef = signal<string | null>(null);

  private savedForm: EnquiryForm | null = null;
  private savedItems: Array<{ name: string; quantity: number; price: number; sku?: string }> = [];

  readonly form = signal<EnquiryForm>({
    name: '', phone: '', email: '', company: '', address: '', city: '', notes: '',
  });

  updateField<K extends keyof EnquiryForm>(field: K, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  readonly isValid = computed(() => {
    const f = this.form();
    return f.name.trim().length > 0 && f.phone.trim().length > 0 && f.city.trim().length > 0;
  });

  submitOrder(): void {
    this.submitted.set(true);
    this.apiError.set(null);

    if (!this.isValid()) {
      return;
    }

    const f = this.form();
    this.savedForm = { ...f };
    this.savedItems = this.cart.items().map(i => ({
      name: i.name, quantity: i.quantity, price: i.price, sku: i.sku,
    }));

    const payload: PlaceOrderPayload = {
      customer_name:    f.name.trim(),
      customer_phone:   f.phone.trim(),
      customer_email:   f.email.trim() || undefined,
      customer_company: f.company.trim() || undefined,
      delivery_address: f.address.trim() || undefined,
      city:             f.city,
      notes:            f.notes.trim() || undefined,
      items:            this.cart.items().map(i => ({
        name:     i.name,
        quantity: i.quantity,
        price:    i.price,
        sku:      i.sku,
      })),
    };

    this.loading.set(true);

    this.orderService.placeOrder(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.confirmedRef.set(res.order_ref);
        this.cart.clear();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Something went wrong. Please try again.';
        this.apiError.set(msg);
      },
    });
  }

  sendWhatsApp(): void {
    const f = this.savedForm;
    if (!f) { return; }

    const url = this.whatsapp.buildCheckoutEnquiryLink(
      this.savedItems,
      {
        name:    f.name.trim(),
        phone:   f.phone.trim(),
        email:   f.email.trim() || undefined,
        company: f.company.trim() || undefined,
        address: f.address.trim() || undefined,
        city:    f.city || undefined,
        notes:   f.notes.trim() || undefined,
      },
      this.confirmedRef() ?? undefined
    );
    this.whatsapp.openChat(url);
  }
}
