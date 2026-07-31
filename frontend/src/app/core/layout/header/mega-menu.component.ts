import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../features/catalog/data-access/category.service';
import { Category } from '../../../features/catalog/data-access/category.model';

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="flex items-center gap-1 py-1 text-sm font-medium overflow-x-auto
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      @for (cat of topCategories(); track cat.id) {
        <div class="relative group flex-shrink-0">
          <a
            [routerLink]="['/shop/category', cat.slug]"
            class="hover:text-primary py-2 px-3 flex items-center gap-0.5 whitespace-nowrap rounded-md hover:bg-gray-50"
          >
            {{ cat.name }}
            @if (cat.children?.length) {
              <span class="material-icons text-xs leading-none">expand_more</span>
            }
          </a>

          @if (cat.children?.length) {
            <div class="mega-dropdown absolute top-full left-0 hidden group-hover:grid
                        grid-cols-3 gap-4 bg-white shadow-xl rounded-xl p-6
                        w-max max-w-[min(560px,calc(100vw-2rem))] z-50 border border-gray-100">
              @for (child of cat.children; track child.id) {
                <div>
                  <a [routerLink]="['/shop/category', child.slug]"
                     class="font-semibold text-gray-800 hover:text-primary block mb-2 text-sm">
                    {{ child.name }}
                  </a>
                  @if (child.children?.length) {
                    @for (sub of child.children; track sub.id) {
                      <a [routerLink]="['/shop/category', sub.slug]"
                         class="block text-gray-500 hover:text-primary py-0.5 text-xs">
                        {{ sub.name }}
                      </a>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <a routerLink="/brands"           class="flex-shrink-0 hover:text-primary px-3 py-2 whitespace-nowrap rounded-md hover:bg-gray-50">Brands</a>
      <a routerLink="/segment/restaurant" class="flex-shrink-0 hover:text-primary px-3 py-2 whitespace-nowrap rounded-md hover:bg-gray-50">Restaurant</a>
      <a routerLink="/segment/hotel"    class="flex-shrink-0 hover:text-primary px-3 py-2 whitespace-nowrap rounded-md hover:bg-gray-50">Hotel</a>
      <a routerLink="/segment/villa"    class="flex-shrink-0 hover:text-primary px-3 py-2 whitespace-nowrap rounded-md hover:bg-gray-50">Villa</a>
    </nav>
  `,
})
export class MegaMenuComponent {
  private readonly categoryService = inject(CategoryService);
  readonly topCategories = signal<Category[]>([]);

  constructor() {
    this.categoryService.getTopCategories().subscribe(cats => this.topCategories.set(cats));
  }
}
