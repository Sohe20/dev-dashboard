import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { TPipe } from '../../core/t.pipe';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { TeamMember } from '../../models/team.model';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-global-search',
  imports: [TPipe],
  templateUrl: './global-search.html',
  styleUrl: './global-search.css',
})
export class GlobalSearch {
  private router = inject(Router);
  private projectApi = inject(ProjectService);
  private taskApi = inject(TaskService);
  private teamApi = inject(TeamService);

  query = signal('');
  open = signal(false);

  private projects = signal<Project[]>([]);
  private tasks = signal<Task[]>([]);
  private team = signal<TeamMember[]>([]);
  private loaded = false;

  results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return null;
    const has = (...fields: (string | null | undefined)[]) =>
      fields.some((f) => f?.toLowerCase().includes(q));

    return {
      projects: this.projects().filter((p) => has(p.name, p.description)),
      tasks: this.tasks().filter((t) => has(t.title, t.description)),
      team: this.team().filter((m) => has(m.name, m.role)),
    };
  });

  empty = computed(() => {
    const r = this.results();
    return !!r && !r.projects.length && !r.tasks.length && !r.team.length;
  });

  load() {
    if (this.loaded) return;
    this.loaded = true;
    forkJoin({
      projects: this.projectApi.visible().pipe(catchError(() => of([] as Project[]))),
      tasks: this.taskApi.getAll().pipe(catchError(() => of([] as Task[]))),
      team: this.teamApi.getAll().pipe(catchError(() => of([] as TeamMember[]))),
    }).subscribe((d) => {
      this.projects.set(d.projects);
      this.tasks.set(d.tasks);
      this.team.set(d.team);
    });
  }

  onInput(value: string) {
    this.query.set(value);
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  go(url: string | string[]) {
    this.open.set(false);
    this.query.set('');
    this.router.navigate(Array.isArray(url) ? url : [url]);
  }
}