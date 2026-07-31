import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/http/api.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-16 max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
      <p class="text-gray-500 mb-8">We're here to help with commercial kitchen equipment, installation &amp; AMC. Reach us on WhatsApp for a fast quote.</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

        <!-- WhatsApp -->
        <a [href]="seo.whatsappUrl('Hello, I\'d like a quote for kitchen equipment')"
           target="_blank" rel="noopener"
           class="flex items-start gap-4 p-5 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.847L.058 23.5l5.788-1.517A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800">WhatsApp (Fastest)</p>
            <p class="text-green-700 font-medium text-sm mt-0.5">{{ seo.displayPhone }}</p>
            <p class="text-gray-500 text-xs mt-1">Tap to chat now · 9am – 6pm</p>
          </div>
        </a>

        <!-- Call -->
        <a [href]="seo.telHref"
           class="flex items-start gap-4 p-5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="material-icons text-white text-lg">phone</span>
          </div>
          <div>
            <p class="font-semibold text-gray-800">Call Us</p>
            <p class="text-blue-700 font-medium text-sm mt-0.5">{{ seo.displayPhone }}</p>
            <p class="text-gray-500 text-xs mt-1">Sun–Thu 9am–6pm, Sat 10am–3pm</p>
          </div>
        </a>

        <!-- Email -->
        <a [href]="seo.mailHref"
           class="flex items-start gap-4 p-5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
          <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="material-icons text-white text-lg">email</span>
          </div>
          <div>
            <p class="font-semibold text-gray-800">Email</p>
            <p class="text-gray-700 font-medium text-sm mt-0.5">{{ seo.email }}</p>
            <p class="text-gray-500 text-xs mt-1">We reply within 2 business hours</p>
          </div>
        </a>

        <!-- Location -->
        <div class="flex items-start gap-4 p-5 bg-gray-50 border border-gray-200 rounded-xl">
          <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="material-icons text-white text-lg">location_on</span>
          </div>
          <div>
            <p class="font-semibold text-gray-800">Location</p>
            <p class="text-gray-700 text-sm mt-0.5">Dubai, United Arab Emirates</p>
            <p class="text-gray-500 text-xs mt-1">Dubai · Abu Dhabi · Sharjah · Ajman · Ras Al Khaimah · Fujairah · Umm Al Quwain</p>
          </div>
        </div>
      </div>

      @if (submitted()) {
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          Thank you! We'll get back to you within 24 hours.
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" formControlName="name"
                     class="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" formControlName="email"
                     class="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" formControlName="subject"
                   class="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea formControlName="message" rows="5"
                      class="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none">
            </textarea>
          </div>
          <button type="submit" [disabled]="form.invalid || loading()"
                  class="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50">
            {{ loading() ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      }
    </div>
  `,
})
export class ContactComponent implements OnInit {
  private readonly fb  = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly seo = inject(SeoService);

  readonly form = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  readonly loading   = signal(false);
  readonly submitted = signal(false);

  ngOnInit() {
    this.seo.set({
      title: `Contact Innovative Kitchen UAE | Kitchen Equipment Enquiry`,
      description: `Contact Innovative Kitchen UAE for commercial kitchen equipment enquiries. WhatsApp or email us for a fast quote for restaurants, hotels & caterers in Dubai, Abu Dhabi, Sharjah & all UAE.`,
      keywords: 'contact Innovative Kitchen UAE, kitchen equipment enquiry Dubai, commercial kitchen equipment supplier contact, WhatsApp kitchen equipment UAE',
      canonical: `${this.seo.BASE_URL}/contact`,
      breadcrumbs: [{ name: 'Contact', url: '/contact' }],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.api.post('/contact', this.form.value).subscribe({
      next: () => { this.submitted.set(true); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
