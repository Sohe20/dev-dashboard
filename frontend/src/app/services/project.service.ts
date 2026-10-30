import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Project, ProjectPayload } from '../models/project.model';


@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/projects`;
  showForm = signal(false);
  editing = signal<Project | null>(null);

  getAll() {
    return this.http.get<Project[]>(this.url);
  }

  getOne(id: number) {
    return this.http.get<Project>(`${this.url}/${id}`);
  }

  create(body: ProjectPayload) {
    return this.http.post<Project>(this.url, body);
  }

  update(id: number, body: ProjectPayload) {
    return this.http.put<Project>(`${this.url}/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  revenue() {
    return this.http.get<{ total: number }>(`${this.url}/revenue`);
  }




}