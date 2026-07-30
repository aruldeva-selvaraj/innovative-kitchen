import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  private readonly _user = signal<AuthUser | null>(
    this.storage.get<AuthUser>('auth_user')
  );
  private readonly _token = signal<string | null>(
    this.storage.get<string>('auth_token')
  );

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  login(payload: LoginPayload) {
    return this.http.post<{ user: AuthUser; token: string }>('/api/auth/login', payload).pipe(
      tap(({ user, token }) => this.setSession(user, token))
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post<{ user: AuthUser; token: string }>('/api/auth/register', payload).pipe(
      tap(({ user, token }) => this.setSession(user, token))
    );
  }

  logout() {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap(() => this.clearSession())
    );
  }

  private setSession(user: AuthUser, token: string) {
    this._user.set(user);
    this._token.set(token);
    this.storage.set('auth_user', user);
    this.storage.set('auth_token', token);
  }

  private clearSession() {
    this._user.set(null);
    this._token.set(null);
    this.storage.remove('auth_user');
    this.storage.remove('auth_token');
    this.router.navigate(['/account/login']);
  }
}
