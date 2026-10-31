import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { TeamService } from '../services/team.service';

@Injectable({ providedIn: 'root' })
export class Role {
  private team = inject(TeamService);
  private cache$: Observable<string | null> | null = null;

  role = signal<string | null>(null);
  isTeamLead = computed(() => this.role() === 'Team Lead');

  ensure() {
    if (!this.cache$) {
      this.cache$ = this.team.myRole().pipe(
        map((m) => m?.role ?? null),
        tap((r) => this.role.set(r)),
        catchError(() => of(null)),
        shareReplay(1),
      );
    }
    return this.cache$;
  }

  clear() {
    this.cache$ = null;
    this.role.set(null);
  }
}