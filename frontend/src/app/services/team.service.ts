import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TeamMember, TeamMemberPayload } from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/team`;

  getAll() {
    return this.http.get<TeamMember[]>(this.url);
  }

  myRole() {
    return this.http.get<TeamMember | null>(`${this.url}/my-role`);
  }

  create(body: TeamMemberPayload) {
    return this.http.post<TeamMember>(this.url, body);
  }

  remove(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}