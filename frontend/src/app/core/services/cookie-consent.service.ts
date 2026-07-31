import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
}

const CONSENT_KEY = 'ik_cookie_consent';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly storage = new StorageService();

  private readonly _consent = signal<CookieConsent | null>(
    this.storage.get<CookieConsent>(CONSENT_KEY)
  );

  readonly consent = this._consent.asReadonly();
  readonly hasConsent = computed(() => this._consent() !== null);

  acceptAll(): void {
    this._save({ necessary: true, analytics: true, marketing: true });
  }

  acceptNecessary(): void {
    this._save({ necessary: true, analytics: false, marketing: false });
  }

  savePreferences(analytics: boolean, marketing: boolean): void {
    this._save({ necessary: true, analytics, marketing });
  }

  private _save(prefs: Omit<CookieConsent, 'savedAt'>): void {
    const consent: CookieConsent = { ...prefs, savedAt: new Date().toISOString() };
    this.storage.set(CONSENT_KEY, consent);
    this._consent.set(consent);
  }
}
