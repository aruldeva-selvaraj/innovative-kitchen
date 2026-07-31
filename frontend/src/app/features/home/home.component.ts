import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { homeResource, HomeData } from './data-access/home.resource';
import { ProductCarouselComponent } from '../../shared/ui/product-carousel/product-carousel.component';
import { BrandLogoStripComponent } from '../../shared/ui/brand-logo-strip/brand-logo-strip.component';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCarouselComponent, BrandLogoStripComponent],
  template: `
    @if (data()) {
      <!-- Hero Banner -->
      <section class="bg-gradient-to-r from-primary to-primary-dark text-white py-16 sm:py-20">
        <div class="container mx-auto px-4 text-center">
          <p class="text-sm font-medium uppercase tracking-widest opacity-75 mb-3">UAE's Trusted Kitchen Equipment Supplier</p>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Innovative Kitchen<br class="sm:hidden"> Equipment UAE
          </h1>
          <p class="text-base sm:text-lg mb-2 opacity-90 max-w-2xl mx-auto">
            Complete commercial kitchen solutions for restaurants, hotels, cafes &amp; caterers
          </p>
          <p class="text-sm mb-6 opacity-75">Supply · Installation · Annual Maintenance (AMC)</p>
          <p class="text-sm mb-8 opacity-75">Dubai &nbsp;·&nbsp; Abu Dhabi &nbsp;·&nbsp; Sharjah &nbsp;·&nbsp; All UAE</p>
          <div class="flex flex-wrap justify-center gap-3">
            <a routerLink="/shop"
               class="bg-white text-primary font-semibold px-7 py-3 rounded-full hover:bg-gray-100 inline-block transition-colors">
              Browse Equipment
            </a>
            <a [href]="seo.whatsappUrl('Hello, I\'d like a quote for commercial kitchen equipment')"
               target="_blank" rel="noopener"
               class="bg-green-500 text-white font-semibold px-7 py-3 rounded-full hover:bg-green-600 inline-flex items-center gap-2 transition-colors">
              <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.847L.058 23.5l5.788-1.517A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
              WhatsApp Quote
            </a>
            <a routerLink="/contact"
               class="border-2 border-white text-white font-semibold px-7 py-3 rounded-full hover:bg-white/10 inline-block transition-colors">
              Get a Quote
            </a>
          </div>
          <!-- Trust badges -->
          <div class="flex flex-wrap justify-center gap-6 mt-10 opacity-80 text-sm">
            <span class="flex items-center gap-1.5"><span class="material-icons text-base">verified</span> Authorised Brands</span>
            <span class="flex items-center gap-1.5"><span class="material-icons text-base">local_shipping</span> UAE-Wide Delivery</span>
            <span class="flex items-center gap-1.5"><span class="material-icons text-base">build</span> Installation &amp; AMC</span>
            <span class="flex items-center gap-1.5"><span class="material-icons text-base">support_agent</span> 24/7 WhatsApp Support</span>
          </div>
        </div>
      </section>

      <!-- Category Grid -->
      <section class="container mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Shop by Category</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          @for (cat of data()!.categories; track cat.id) {
            <a [routerLink]="['/shop/category', cat.slug]"
               class="flex flex-col items-center gap-2 p-4 border rounded-xl hover:border-primary hover:shadow-sm transition-all">
              @if (cat.image) {
                <img [src]="cat.image" [alt]="cat.name" class="w-14 h-14 object-contain" />
              } @else {
                <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <span class="material-icons text-primary">category</span>
                </div>
              }
              <span class="text-xs font-medium text-center text-gray-700">{{ cat.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Brand Strip -->
      <div class="container mx-auto px-4">
        <app-brand-logo-strip [brands]="data()!.featuredBrands" />
      </div>

      <!-- Best Sellers -->
      <div class="container mx-auto px-4">
        <app-product-carousel
          title="Best Sellers"
          [products]="data()!.bestSellers"
          viewAllLink="/shop?sort=popular"
        />
      </div>

      <!-- Top Deals -->
      <div class="container mx-auto px-4 bg-red-50 py-4 rounded-2xl my-4">
        <app-product-carousel
          title="Top Deals"
          [products]="data()!.topDeals"
          viewAllLink="/shop?sort=price_asc"
        />
      </div>

      <!-- New Arrivals -->
      <div class="container mx-auto px-4">
        <app-product-carousel
          title="New Arrivals"
          [products]="data()!.newArrivals"
          viewAllLink="/shop?sort=newest"
        />
      </div>

      <!-- Segments Banner -->
      <section class="container mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Shop by Segment</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (seg of segments; track seg.slug) {
            <a [routerLink]="['/segment', seg.slug]"
               class="relative overflow-hidden rounded-2xl h-40 flex items-end p-4"
               [style.background-image]="'url(' + seg.image + ')'"
               [style.background-size]="'cover'">
              <div class="absolute inset-0 bg-black/40"></div>
              <span class="relative text-white font-bold text-lg">{{ seg.label }}</span>
            </a>
          }
        </div>
      </section>
    } @else {
      <!-- Skeleton -->
      <div class="h-64 bg-gray-100 animate-pulse mb-8"></div>
      <div class="container mx-auto px-4 space-y-8">
        <div class="h-8 w-48 bg-gray-100 rounded animate-pulse mx-auto"></div>
        <div class="grid grid-cols-6 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
          }
        </div>
      </div>
    }
  `,
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly data = signal<HomeData | null>(null);

  readonly segments = [
    { slug: 'restaurant', label: 'Restaurant', image: '/assets/segments/restaurant.jpg' },
    { slug: 'hotel', label: 'Hotel', image: '/assets/segments/hotel.jpg' },
    { slug: 'villa', label: 'Villa', image: '/assets/segments/villa.jpg' },
    { slug: 'coffee-shop', label: 'Coffee Shop', image: '/assets/segments/coffee-shop.jpg' },
  ];

  private readonly home$ = homeResource();

  ngOnInit() {
    this.seo.set({
      title: 'Innovative Kitchen | Commercial Kitchen Equipment UAE – Dubai, Abu Dhabi, Sharjah',
      description: "Innovative Kitchen – UAE's trusted supplier of commercial kitchen equipment. Complete solutions for restaurants, hotels, cafes & caterers. Supply, installation & AMC across all UAE emirates.",
      keywords: 'Innovative Kitchen UAE, commercial kitchen equipment UAE, kitchen equipment Dubai, restaurant equipment UAE, hotel kitchen equipment Abu Dhabi, catering equipment Sharjah, commercial kitchen supplier, kitchen installation UAE, kitchen AMC UAE, professional kitchen appliances UAE',
      canonical: 'https://www.innovativekitchen.ae/',
    });
    this.home$.subscribe(data => this.data.set(data));
  }
}
