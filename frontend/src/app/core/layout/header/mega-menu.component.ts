import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../features/catalog/data-access/category.service';
import { Category } from '../../../features/catalog/data-access/category.model';

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="flex items-center gap-6 py-2 text-sm font-medium">
      @for (cat of topCategories(); track cat.id) {
        <div class="relative group">
          <a
            [routerLink]="['/shop/category', cat.slug]"
            class="hover:text-primary py-2 flex items-center gap-1"
          >
            {{ cat.name }}
            @if (cat.children?.length) {
              <span class="material-icons text-xs">expand_more</span>
            }
          </a>

          @if (cat.children?.length) {
            <div class="mega-dropdown absolute top-full left-0 hidden group-hover:grid grid-cols-3 gap-4 bg-white shadow-xl p-6 min-w-[480px] z-50">
              @for (child of cat.children; track child.id) {
                <div>
                  <a [routerLink]="['/shop/category', child.slug]"
                     class="font-semibold text-gray-800 hover:text-primary block mb-2">
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

      <a routerLink="/brands" class="hover:text-primary">Brands</a>
      <a routerLink="/segment/restaurant" class="hover:text-primary">Restaurant</a>
      <a routerLink="/segment/hotel" class="hover:text-primary">Hotel</a>
      <a routerLink="/segment/villa" class="hover:text-primary">Villa</a>
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
