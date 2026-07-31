import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../http/api.service';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  country: string;
}

@Component({
  selector: 'app-brand-marquee',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    .marquee-track {
      display: flex;
      align-items: center;
      gap: 0;
      width: max-content;
      animation: marquee-scroll 30s linear infinite;
    }
    .marquee-track:hover {
      animation-play-state: paused;
    }
    @keyframes marquee-scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
  `],
  template: `
    @if (brands().length) {
      <div class="border-t bg-gray-50 overflow-hidden relative" style="height:42px">

        <!-- Left fade -->
        <div class="absolute left-0 top-0 bottom-0 w-12 z-10
                    bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>

        <!-- Right fade -->
        <div class="absolute right-0 top-0 bottom-0 w-12 z-10
                    bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>

        <!-- Label -->
        <span class="absolute left-3 top-1/2 -translate-y-1/2 z-20
                     text-[10px] font-semibold tracking-widest uppercase text-gray-400
                     hidden sm:block">
          Brands
        </span>

        <!-- Scrolling track — list duplicated for seamless loop -->
        <div class="marquee-track h-full"
             [style.animation-duration]="animDuration()">
          @for (brand of doubled(); track brand.uid) {
            <a [routerLink]="['/brands', brand.slug]"
               class="flex items-center justify-center px-6 h-full
                      opacity-50 hover:opacity-100 transition-opacity shrink-0"
               [title]="brand.name">
              <img [src]="brand.logo"
                   [alt]="brand.name"
                   class="h-6 max-w-[90px] object-contain grayscale hover:grayscale-0 transition-all"
                   loading="lazy"
                   (error)="onImgError($event, brand.name)" />
            </a>
          }
        </div>

      </div>
    }
  `,
})
export class BrandMarqueeComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly brands = signal<Brand[]>([]);

  /** Each item needs a unique key for @for when the list is doubled. */
  readonly doubled = () => {
    const list = this.brands();
    return [
      ...list.map((b, i) => ({ ...b, uid: `a-${i}` })),
      ...list.map((b, i) => ({ ...b, uid: `b-${i}` })),
    ];
  };

  /** Slow down for fewer brands so it doesn't whip by. */
  readonly animDuration = () => {
    const count = this.brands().length;
    return `${Math.max(20, count * 3)}s`;
  };

  ngOnInit() {
    this.api.get<{ data: Brand[] } | Brand[]>('/brands/featured').subscribe(res => {
      // Handle both paginated { data: [] } and plain array responses
      const list = Array.isArray(res) ? res : (res as { data: Brand[] }).data ?? [];
      this.brands.set(list);
    });
  }

  /** Fall back to a text pill if the logo image 404s. */
  onImgError(event: Event, name: string) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const pill = document.createElement('span');
    pill.textContent = name;
    pill.className = 'text-[10px] font-semibold text-gray-500 whitespace-nowrap';
    img.parentElement?.appendChild(pill);
  }
}
