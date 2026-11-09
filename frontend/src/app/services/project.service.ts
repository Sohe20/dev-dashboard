import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project, ProjectPayload } from '../models/project.model';
import { Role } from '../core/role';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private role = inject(Role);
  private tasks = inject(TaskService);
  private url = `${environment.apiBaseUrl}/projects`;

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

  visible() {
    return this.role.ensure().pipe(
      switchMap((r) =>
         r === 'Team Lead'
          ? this.getAll()
          : this.tasks.getMine().pipe(
              map((ts) => {
                const byId = new Map<number, Project>();
                ts.forEach((t) => t.project && byId.set(t.project.id, t.project));
                return [...byId.values()];
              }),
            ),
      ),
    );
  }
}