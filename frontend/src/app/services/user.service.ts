import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<User[]>(`${environment.apiBaseUrl}/users`);
  }
}