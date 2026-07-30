import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/http/api.service';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-16 max-w-3xl">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">{{ title() }}</h1>
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-4 bg-gray-100 rounded animate-pulse" [style.width]="(60 + i * 8) + '%'"></div>
          }
        </div>
      } @else {
        <div class="prose prose-gray max-w-none text-gray-600" [innerHTML]="content()"></div>
      }
    </div>
  `,
})
export class LegalPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  readonly title = signal('');
  readonly content = signal('');
  readonly loading = signal(true);

  ngOnInit() {
    const { page, title } = this.route.snapshot.data;
    this.title.set(title);
    this.api.get<{ content: string }>(`/pages/${page}`).subscribe({
      next: ({ content }) => { this.content.set(content); this.loading.set(false); },
      error: () => { this.content.set('<p>Content not available.</p>'); this.loading.set(false); },
    });
  }
}
