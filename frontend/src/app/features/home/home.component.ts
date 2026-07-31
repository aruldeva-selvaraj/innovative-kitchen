import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { homeResource, HomeData } from './data-access/home.resource';
import { ProductCarouselComponent } from '../../shared/ui/product-carousel/product-carousel.component';
import { BrandLogoStripComponent } from '../../shared/ui/brand-logo-strip/brand-logo-strip.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCarouselComponent, BrandLogoStripComponent],
  template: `
    @if (data()) {
      <!-- Hero Banner -->
      <section class="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">Quality Products for Every Need</h1>
          <p class="text-lg mb-8 opacity-90">Serving UAE businesses and homes with the best</p>
          <a routerLink="/shop"
             class="bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-gray-100 inline-block">
            Shop Now
          </a>
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
  readonly data = signal<HomeData | null>(null);

  readonly segments = [
    { slug: 'restaurant', label: 'Restaurant', image: '/assets/segments/restaurant.jpg' },
    { slug: 'hotel', label: 'Hotel', image: '/assets/segments/hotel.jpg' },
    { slug: 'villa', label: 'Villa', image: '/assets/segments/villa.jpg' },
    { slug: 'coffee-shop', label: 'Coffee Shop', image: '/assets/segments/coffee-shop.jpg' },
  ];

  // homeResource() uses inject() internally; calling it as a field initializer
  // keeps it within the Angular injection context.
  private readonly home$ = homeResource();

  ngOnInit() {
    this.home$.subscribe(data => this.data.set(data));
  }
}
