import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-16 max-w-3xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">About Innovative Kitchen UAE</h1>
      <p class="text-gray-500 mb-8">UAE's Trusted Commercial Kitchen Equipment Supplier</p>

      <div class="space-y-6 text-gray-600 leading-relaxed">
        <p>
          <strong class="text-gray-800">Innovative Kitchen</strong> is a leading commercial kitchen equipment supplier
          based in Dubai, serving restaurants, hotels, cafes, catering companies, and food service businesses
          across the United Arab Emirates. We provide end-to-end kitchen solutions — from equipment supply
          and professional installation to annual maintenance contracts (AMC).
        </p>

        <h2 class="text-xl font-semibold text-gray-800 mt-8 mb-3">What We Do</h2>
        <p>
          We supply a comprehensive range of professional kitchen equipment including commercial ovens,
          refrigeration units, dishwashers, grills, fryers, food prep machinery, storage solutions,
          coffee machines, and catering supplies — all from internationally recognised brands trusted
          by leading hospitality groups across the GCC.
        </p>

        <h2 class="text-xl font-semibold text-gray-800 mt-8 mb-3">Who We Serve</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          @for (seg of segments; track seg) {
            <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
              <span class="material-icons text-primary text-base">{{ seg.icon }}</span>
              {{ seg.label }}
            </div>
          }
        </div>

        <h2 class="text-xl font-semibold text-gray-800 mt-8 mb-3">Why Choose Innovative Kitchen</h2>
        <ul class="space-y-3">
          @for (point of whyUs; track point.icon) {
            <li class="flex items-start gap-3">
              <span class="material-icons text-primary text-base mt-0.5">{{ point.icon }}</span>
              @if (point.text === 'whatsapp-support') {
                <span>24/7 WhatsApp support – reach us at <a [href]="seo.telHref" class="text-primary font-medium">{{ seo.displayPhone }}</a></span>
              } @else {
                <span>{{ point.text }}</span>
              }
            </li>
          }
        </ul>

        <h2 class="text-xl font-semibold text-gray-800 mt-8 mb-3">Our Coverage</h2>
        <p>
          We deliver and install across all seven emirates — <strong class="text-gray-800">Dubai, Abu Dhabi,
          Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah</strong>, and <strong class="text-gray-800">Fujairah</strong>.
          Our service teams are available throughout the UAE for installation, commissioning, and AMC support.
        </p>

        <!-- CTA -->
        <div class="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div class="flex-1">
            <p class="font-semibold text-gray-800">Ready to equip your kitchen?</p>
            <p class="text-sm text-gray-500 mt-1">Talk to our equipment specialists today.</p>
          </div>
          <a [href]="seo.whatsappUrl('Hello, I\'d like to know more about Innovative Kitchen')"
             target="_blank" rel="noopener"
             class="flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors text-sm whitespace-nowrap">
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.847L.058 23.5l5.788-1.517A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  `,
})
export class AboutComponent implements OnInit {
  readonly seo = inject(SeoService);

  readonly segments = [
    { icon: 'restaurant', label: 'Restaurants' },
    { icon: 'hotel', label: 'Hotels' },
    { icon: 'local_cafe', label: 'Cafes' },
    { icon: 'set_meal', label: 'Catering Co.' },
    { icon: 'school', label: 'Hospitals & Schools' },
    { icon: 'home', label: 'Villas & Homes' },
  ];

  // Phone shown in template from seo.displayPhone — no hardcoding
  readonly whyUs = [
    { icon: 'verified',        text: 'Authorised dealer for internationally recognised brands' },
    { icon: 'engineering',     text: 'Professional installation and commissioning by certified engineers' },
    { icon: 'build_circle',    text: 'Annual Maintenance Contracts (AMC) for all equipment types' },
    { icon: 'local_shipping',  text: 'Fast delivery and logistics across all UAE emirates' },
    { icon: 'support_agent',   text: 'whatsapp-support' },  // rendered specially in template
    { icon: 'price_check',     text: 'Competitive pricing with flexible payment options' },
    { icon: 'inventory_2',     text: 'Large in-stock inventory for immediate availability' },
  ];

  ngOnInit() {
    this.seo.set({
      title: 'About Innovative Kitchen UAE | Commercial Kitchen Equipment Supplier Dubai',
      description: 'Innovative Kitchen is a leading commercial kitchen equipment supplier in UAE. We offer supply, installation & AMC for restaurants, hotels & caterers across Dubai, Abu Dhabi, Sharjah & all UAE.',
      keywords: 'about Innovative Kitchen UAE, commercial kitchen equipment supplier Dubai, kitchen equipment company UAE, kitchen AMC Dubai, kitchen installation UAE',
      canonical: `${this.seo.BASE_URL}/about`,
      breadcrumbs: [{ name: 'About Us', url: '/about' }],
    });
  }
}
