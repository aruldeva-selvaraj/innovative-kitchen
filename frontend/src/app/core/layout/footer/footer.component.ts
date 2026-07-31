import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-16">
      <div class="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        <!-- Brand + contact -->
        <div>
          <h3 class="text-white font-bold text-lg mb-4">Innovative Kitchen</h3>
          <p class="text-sm leading-relaxed">
            UAE's trusted commercial kitchen equipment supplier. Supply, installation &amp; AMC for restaurants, hotels &amp; caterers.
          </p>
          <div class="mt-4 space-y-1.5 text-sm">
            <a [href]="seo.whatsappUrl()" target="_blank" rel="noopener" class="flex items-center gap-2 hover:text-white">
              <span class="material-icons text-base text-green-400">phone</span>{{ seo.displayPhone }}
            </a>
            <a [href]="seo.mailHref" class="flex items-center gap-2 hover:text-white">
              <span class="material-icons text-base text-primary">email</span>{{ seo.email }}
            </a>
          </div>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-3">Quick Links</h4>
          <ul class="space-y-2 text-sm">
            <li><a routerLink="/shop"    class="hover:text-white">Shop</a></li>
            <li><a routerLink="/brands"  class="hover:text-white">Brands</a></li>
            <li><a routerLink="/about"   class="hover:text-white">About Us</a></li>
            <li><a routerLink="/contact" class="hover:text-white">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-3">Segments</h4>
          <ul class="space-y-2 text-sm">
            <li><a routerLink="/segment/restaurant"  class="hover:text-white">Restaurant</a></li>
            <li><a routerLink="/segment/hotel"       class="hover:text-white">Hotel</a></li>
            <li><a routerLink="/segment/villa"       class="hover:text-white">Villa</a></li>
            <li><a routerLink="/segment/coffee-shop" class="hover:text-white">Coffee Shop</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold mb-3">Help</h4>
          <ul class="space-y-2 text-sm">
            <li><a routerLink="/faq"            class="hover:text-white">FAQ</a></li>
            <li><a routerLink="/refund-policy"  class="hover:text-white">Refund Policy</a></li>
            <li><a routerLink="/privacy-policy" class="hover:text-white">Privacy Policy</a></li>
            <li><a routerLink="/terms"          class="hover:text-white">Terms &amp; Conditions</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        &copy; {{ year }} Innovative Kitchen UAE. All rights reserved.
        | Commercial Kitchen Equipment Supplier – Dubai · Abu Dhabi · Sharjah · Ajman · Ras Al Khaimah · Fujairah
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly seo  = inject(SeoService);
  readonly year = new Date().getFullYear();
}
