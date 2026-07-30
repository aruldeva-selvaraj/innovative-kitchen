import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/http/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container mx-auto px-4 py-16 max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
      <p class="text-gray-500 mb-8">We're here to help. Send us a message or reach us on WhatsApp.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div class="space-y-4">
          <div>
            <p class="font-semibold text-gray-700">Email</p>
            <p class="text-gray-500 text-sm">support&#64;myshop.ae</p>
          </div>
          <div>
            <p class="font-semibold text-gray-700">WhatsApp</p>
            <p class="text-gray-500 text-sm">+971 50 000 0000</p>
          </div>
          <div>
            <p class="font-semibold text-gray-700">Location</p>
            <p class="text-gray-500 text-sm">Dubai, UAE</p>
          </div>
        </div>
      </div>

      @if (submitted()) {
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          Thank you! We'll get back to you within 24 hours.
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
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
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly submitted = signal(false);

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.api.post('/contact', this.form.value).subscribe({
      next: () => { this.submitted.set(true); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
