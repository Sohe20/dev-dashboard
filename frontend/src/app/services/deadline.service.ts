import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Deadline } from '../models/deadline.model';

@Injectable({ providedIn: 'root' })
export class DeadlineService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/deadlines`;

  list(projectId: number) {
    return this.http.get<Deadline[]>(this.url, {
      params: new HttpParams().set('projectId', projectId),
    });
  }

  create(body: { title: string; dueDate: string; projectId: number }) {
    return this.http.post<Deadline>(this.url, body);
  }

  update(id: number, body: { title?: string; dueDate?: string; isDone?: boolean }) {
    return this.http.put<Deadline>(`${this.url}/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}