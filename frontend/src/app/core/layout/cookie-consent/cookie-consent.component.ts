import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink, FormsModule],
  styles: [`
    .banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #1a1a2e;
      border-top: 3px solid #E63946;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.35);
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    .banner-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 18px 24px;
    }
    .main-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .text-block { flex: 1; min-width: 280px; }
    .title {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .title .dot { width: 8px; height: 8px; background: #E63946; border-radius: 50%; flex-shrink: 0; }
    .desc {
      color: #a0aec0;
      font-size: 13px;
      line-height: 1.5;
    }
    .desc a {
      color: #E63946;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .desc a:hover { color: #ff6b7a; }
    .btn-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      flex-shrink: 0;
    }
    .btn-accept {
      background: #E63946;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: background .15s;
    }
    .btn-accept:hover { background: #c1121f; }
    .btn-necessary {
      background: transparent;
      color: #cbd5e0;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all .15s;
    }
    .btn-necessary:hover { border-color: #E63946; color: white; }
    .btn-manage {
      background: none;
      border: none;
      color: #718096;
      font-size: 12px;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 2px;
      padding: 4px;
    }
    .btn-manage:hover { color: #a0aec0; }

    /* Preferences panel */
    .prefs-panel {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .prefs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .pref-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .pref-info .pref-name { color: white; font-size: 13px; font-weight: 600; }
    .pref-info .pref-desc { color: #718096; font-size: 11px; margin-top: 3px; }
    .toggle-wrap { flex-shrink: 0; margin-top: 2px; }
    .toggle {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
    }
    .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .slider {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.15);
      border-radius: 22px;
      cursor: pointer;
      transition: background .2s;
    }
    .slider::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      left: 3px;
      top: 3px;
      background: white;
      border-radius: 50%;
      transition: transform .2s;
    }
    input:checked + .slider { background: #E63946; }
    input:checked + .slider::before { transform: translateX(18px); }
    input:disabled + .slider { opacity: 0.6; cursor: not-allowed; }
    .necessary-badge {
      background: rgba(230,57,70,0.15);
      color: #ff6b7a;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
      display: inline-block;
    }
    .prefs-actions { display: flex; gap: 10px; }
    .btn-save {
      background: #E63946;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 9px 20px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: background .15s;
    }
    .btn-save:hover { background: #c1121f; }
    .btn-cancel {
      background: transparent;
      color: #718096;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 9px 16px;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-cancel:hover { color: white; }
  `],
  template: `
    @if (!consent.hasConsent()) {
      <div class="banner" role="dialog" aria-label="Cookie consent" aria-modal="false">
        <div class="banner-inner">

          <!-- Main row -->
          <div class="main-row">
            <div class="text-block">
              <div class="title">
                <span class="dot"></span>
                We use cookies
              </div>
              <p class="desc">
                We use cookies to improve your experience, analyse site traffic, and show relevant ads.
                By clicking <strong style="color:white">Accept All</strong> you consent to our use of cookies.
                Read our <a routerLink="/privacy-policy">Privacy Policy</a> to learn more.
              </p>
            </div>

            <div class="btn-group">
              <button class="btn-accept" (click)="acceptAll()">Accept All</button>
              <button class="btn-necessary" (click)="acceptNecessary()">Necessary Only</button>
              <button class="btn-manage" (click)="togglePrefs()">
                {{ showPrefs() ? 'Hide preferences ▲' : 'Manage preferences ▼' }}
              </button>
            </div>
          </div>

          <!-- Expandable preferences -->
          @if (showPrefs()) {
            <div class="prefs-panel">
              <div class="prefs-grid">

                <div class="pref-card">
                  <div class="pref-info">
                    <div class="pref-name">Necessary Cookies</div>
                    <div class="pref-desc">Essential for login, cart, and site security. Cannot be disabled.</div>
                    <span class="necessary-badge">Always On</span>
                  </div>
                  <div class="toggle-wrap">
                    <label class="toggle">
                      <input type="checkbox" checked disabled>
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="pref-card">
                  <div class="pref-info">
                    <div class="pref-name">Analytics Cookies</div>
                    <div class="pref-desc">Help us understand how visitors use the site (Google Analytics).</div>
                  </div>
                  <div class="toggle-wrap">
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="analyticsOn">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="pref-card">
                  <div class="pref-info">
                    <div class="pref-name">Marketing Cookies</div>
                    <div class="pref-desc">Used for Google Ads remarketing and personalised display ads.</div>
                  </div>
                  <div class="toggle-wrap">
                    <label class="toggle">
                      <input type="checkbox" [(ngModel)]="marketingOn">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

              </div>

              <div class="prefs-actions">
                <button class="btn-save" (click)="savePrefs()">Save My Preferences</button>
                <button class="btn-cancel" (click)="togglePrefs()">Cancel</button>
              </div>
            </div>
          }

        </div>
      </div>
    }
  `,
})
export class CookieConsentComponent {
  protected readonly consent = inject(CookieConsentService);

  protected readonly showPrefs = signal(false);
  protected analyticsOn = false;
  protected marketingOn = false;

  protected togglePrefs(): void {
    this.showPrefs.update(v => !v);
  }

  protected acceptAll(): void {
    this.consent.acceptAll();
  }

  protected acceptNecessary(): void {
    this.consent.acceptNecessary();
  }

  protected savePrefs(): void {
    this.consent.savePreferences(this.analyticsOn, this.marketingOn);
  }
}
