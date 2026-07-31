import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit() {
    // Inject Organization + LocalBusiness + WebSite JSON-LD with env-sourced contact info
    this.seo.injectBaseSchema();
  }
}
