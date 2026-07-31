import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CookieConsentComponent],
  template: `
    <!-- ── Site Header: navigation, search, mini-cart, mega-menu ── -->
    <app-header />

    <!-- ── Page Content: routed components render here ── -->
    <main class="min-h-screen">
      <router-outlet />
    </main>

    <!-- ── Site Footer: links, contact, copyright, social ── -->
    <app-footer />

    <!-- ── Cookie Consent: GDPR banner, fixed bottom overlay ── -->
    <app-cookie-consent />
  `,
})
export class ShellComponent {}
