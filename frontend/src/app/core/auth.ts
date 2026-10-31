import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { Router } from '@angular/router';
import { Role } from './role';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiBaseUrl;
  private role = inject(Role);

  login(body: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.api}/auth/login`, body)
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.access_token);
          this.role.clear();
        }),
      );
  }

  register(body: { name: string; email: string; password: string }) {
    return this.http.post(`${this.api}/auth/register`, body);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  private payload() {
    const t = this.getToken();
    if (!t) return null;
    try {
      const b64 = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  isLoggedIn() {
    const p = this.payload();
    return !!p && p.exp * 1000 > Date.now();
  }

  user() {
    return this.payload(); // { sub, email, name, ... }
  }

  logout() {
    localStorage.removeItem('token');
    this.role.clear();
    this.router.navigateByUrl('/login');
  }
}