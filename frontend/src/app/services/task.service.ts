import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Task, TaskPayload } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/tasks`;

  getAll(projectId?: number) {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<Task[]>(this.url, { params });
  }

  getMine() {
    return this.http.get<Task[]>(`${this.url}/my-tasks`);
  }

  getByUser(userId: number) {
    return this.http.get<Task[]>(`${this.url}/user/${userId}`);
  }

  activity() {
    return this.http.get<{ labels: string[]; data: number[] }>(`${this.url}/activity`);
  }

  create(body: TaskPayload) {
    return this.http.post<Task>(this.url, body);
  }

  update(id: number, body: TaskPayload) {
    return this.http.put<Task>(`${this.url}/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  complete(id: number) {
    return this.http.post<Task>(`${this.url}/${id}/complete`, {});
  }

  reportIssue(id: number, message: string) {
    return this.http.post<Task>(`${this.url}/${id}/report-issue`, { message });
  }

  approve(id: number) {
    return this.http.post<Task>(`${this.url}/${id}/approve`, {});
  }

  sendBack(id: number, message: string) {
    return this.http.post<Task>(`${this.url}/${id}/send-back`, { message });
  }
}