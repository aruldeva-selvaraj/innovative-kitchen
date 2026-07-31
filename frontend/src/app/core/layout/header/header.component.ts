import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { MegaMenuComponent } from './mega-menu.component';
import { MiniCartComponent } from './mini-cart.component';
import { BrandMarqueeComponent } from './brand-marquee.component';
import { CategoryService } from '../../../features/catalog/data-access/category.service';
import { Category } from '../../../features/catalog/data-access/category.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MegaMenuComponent, MiniCartComponent, BrandMarqueeComponent],
  template: `
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4">

        <!-- ── Top bar ── -->
        <div class="flex items-center gap-2 sm:gap-3 py-3 border-b">

          <!-- Hamburger (mobile / tablet) -->
          <button
            class="lg:hidden p-1.5 -ml-1 text-gray-600 hover:text-primary flex-shrink-0"
            (click)="toggleMenu()"
            aria-label="Open menu"
          >
            <span class="material-icons">{{ menuOpen() ? 'close' : 'menu' }}</span>
          </button>

          <!-- Logo -->
          <a routerLink="/" class="text-xl sm:text-2xl font-bold text-primary flex-shrink-0 mr-2">
            Innovative Kitchen
          </a>

          <!-- Search bar — hidden on mobile, visible sm+ -->
          <div class="hidden sm:flex flex-1 max-w-xl">
            <input
              type="search"
              placeholder="Search products..."
              class="w-full border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              (keyup.enter)="onSearch($event)"
            />
          </div>

          <!-- Spacer pushes icons right on mobile -->
          <div class="flex-1 sm:hidden"></div>

          <!-- Action icons -->
          <div class="flex items-center gap-1 sm:gap-3">
            <!-- Search icon — mobile only, toggles the search bar row -->
            <button
              class="sm:hidden p-1.5 text-gray-600 hover:text-primary"
              (click)="searchOpen.update(v => !v)"
              aria-label="Search"
            >
              <span class="material-icons text-[22px]">search</span>
            </button>

            <a routerLink="/contact"
               class="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
              <span class="material-icons text-base">headset_mic</span>Contact
            </a>

            <a routerLink="/wishlist" class="relative p-1">
              <span class="material-icons text-[22px]">favorite_border</span>
              @if (wishlist.count() > 0) {
                <span class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold
                             w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {{ wishlist.count() }}
                </span>
              }
            </a>

            <button class="relative p-1" (click)="toggleCart()">
              <span class="material-icons text-[22px]">shopping_cart</span>
              @if (cart.count() > 0) {
                <span class="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold
                             w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {{ cart.count() }}
                </span>
              }
            </button>
          </div>
        </div>

        <!-- Mobile search row (shown when search icon tapped) -->
        @if (searchOpen()) {
          <div class="sm:hidden py-2 border-b">
            <input
              type="search"
              placeholder="Search products..."
              autofocus
              class="w-full border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              (keyup.enter)="onSearch($event)"
            />
          </div>
        }

        <!-- Desktop mega-menu (lg+) -->
        <div class="hidden lg:block">
          <app-mega-menu />
        </div>

      </div>

      <!-- Brand marquee strip — full width below the main header box -->
      <app-brand-marquee />

      <!-- ── Mobile / Tablet drawer ── -->
      @if (menuOpen()) {
        <div class="fixed inset-0 z-50 lg:hidden" (click)="closeMenu()">
          <div class="absolute inset-0 bg-black/50"></div>

          <nav
            class="absolute inset-y-0 left-0 w-72 sm:w-80 bg-white shadow-2xl flex flex-col overflow-y-auto"
            (click)="$event.stopPropagation()"
          >
            <!-- Drawer header -->
            <div class="flex items-center justify-between px-4 py-4 border-b bg-gray-50">
              <span class="text-lg font-bold text-primary">Innovative Kitchen</span>
              <button (click)="closeMenu()" class="p-1 text-gray-500 hover:text-gray-700">
                <span class="material-icons">close</span>
              </button>
            </div>

            <!-- Category list with accordion children -->
            <div class="flex-1 py-2 overflow-y-auto">
              @for (cat of topCategories(); track cat.id) {
                <div>
                  <div class="flex items-center">
                    <a
                      [routerLink]="['/shop/category', cat.slug]"
                      class="flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium
                             text-gray-800 hover:bg-primary/5 hover:text-primary"
                      (click)="closeMenu()"
                    >
                      {{ cat.name }}
                    </a>
                    @if (cat.children?.length) {
                      <button
                        class="px-3 py-3 text-gray-400 hover:text-primary"
                        (click)="toggleExpand(cat.id)"
                        [attr.aria-label]="expandedId() === cat.id ? 'Collapse' : 'Expand'"
                      >
                        <span class="material-icons text-base transition-transform duration-200"
                              [class.rotate-180]="expandedId() === cat.id">
                          expand_more
                        </span>
                      </button>
                    }
                  </div>

                  @if (cat.children?.length && expandedId() === cat.id) {
                    <div class="ml-4 border-l-2 border-primary/20 pl-4 pb-2 space-y-0.5">
                      @for (child of cat.children!; track child.id) {
                        <a
                          [routerLink]="['/shop/category', child.slug]"
                          class="block py-2 text-sm text-gray-600 hover:text-primary"
                          (click)="closeMenu()"
                        >
                          {{ child.name }}
                        </a>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Extra links -->
              <div class="mt-2 pt-2 border-t">
                <a routerLink="/brands"
                   class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800
                          hover:bg-primary/5 hover:text-primary"
                   (click)="closeMenu()">
                  <span class="material-icons text-base text-gray-400">business</span>Brands
                </a>
                <a routerLink="/segment/restaurant"
                   class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800
                          hover:bg-primary/5 hover:text-primary"
                   (click)="closeMenu()">
                  <span class="material-icons text-base text-gray-400">restaurant</span>Restaurant
                </a>
                <a routerLink="/segment/hotel"
                   class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800
                          hover:bg-primary/5 hover:text-primary"
                   (click)="closeMenu()">
                  <span class="material-icons text-base text-gray-400">hotel</span>Hotel
                </a>
                <a routerLink="/segment/villa"
                   class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800
                          hover:bg-primary/5 hover:text-primary"
                   (click)="closeMenu()">
                  <span class="material-icons text-base text-gray-400">villa</span>Villa
                </a>
                <a routerLink="/contact"
                   class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800
                          hover:bg-primary/5 hover:text-primary"
                   (click)="closeMenu()">
                  <span class="material-icons text-base text-gray-400">headset_mic</span>Contact
                </a>
              </div>
            </div>
          </nav>
        </div>
      }

      @if (cartOpen()) {
        <app-mini-cart (close)="toggleCart()" />
      }
    </header>
  `,
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  readonly wishlist = inject(WishlistService);
  private readonly categoryService = inject(CategoryService);

  readonly cartOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly topCategories = signal<Category[]>([]);
  readonly expandedId = signal<number | null>(null);

  constructor() {
    this.categoryService.getTopCategories().subscribe(cats => this.topCategories.set(cats));
  }

  toggleCart()  { this.cartOpen.update(v => !v); }
  toggleMenu()  { this.menuOpen.update(v => !v); }
  closeMenu()   { this.menuOpen.set(false); }

  toggleExpand(id: number) {
    this.expandedId.update(cur => cur === id ? null : id);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    if (value) window.location.href = `/search?q=${encodeURIComponent(value)}`;
  }
}
