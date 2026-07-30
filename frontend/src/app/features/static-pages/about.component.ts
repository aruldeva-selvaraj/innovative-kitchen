import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-16 max-w-3xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">About Us</h1>
      <div class="prose prose-gray max-w-none">
        <p class="text-gray-600 leading-relaxed mb-4">
          We are a leading e-commerce platform serving businesses and homes across the UAE.
          Our mission is to provide high-quality products at competitive prices with exceptional service.
        </p>
        <h2 class="text-xl font-semibold text-gray-800 mt-8 mb-3">Our Story</h2>
        <p class="text-gray-600 leading-relaxed mb-4">
          Founded in 2020, we started with a simple goal: make quality products accessible to everyone in the UAE.
          Today we serve restaurants, hotels, villas, and homes with thousands of products.
        </p>
        <h2 class="text-xl font-semibold text-gray-800 mt-8 mb-3">Why Choose Us</h2>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Authentic products from verified brands</li>
          <li>Fast delivery across UAE</li>
          <li>24/7 WhatsApp customer support</li>
          <li>Easy returns and refunds</li>
          <li>Competitive pricing</li>
        </ul>
      </div>
    </div>
  `,
})
export class AboutComponent {}
