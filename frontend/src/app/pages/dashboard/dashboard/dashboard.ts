import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { Auth } from '../../../core/auth';
import { Role } from '../../../core/role';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { TeamService } from '../../../services/team.service';
import { ActivityChart } from '../../../shared/activity-chart/activity-chart';
import { GlobalSearch } from '../../../shared/global-search/global-search';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, ActivityChart , GlobalSearch],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private auth = inject(Auth);
  private projectApi = inject(ProjectService);
  private taskApi = inject(TaskService);
  private teamApi = inject(TeamService);
  roleSvc = inject(Role);

  name = this.auth.user()?.name ?? '';
  greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  projects = signal<Project[] | null>(null);
  taskCount = signal<number | null>(null);
  teamCount = signal<number | null>(null);
  revenue = signal<number | null>(null);
  chart = signal<{ labels: string[]; data: number[] }>({ labels: [], data: [] });

  recent = computed(() => (this.projects() ?? []).slice(0, 4));
  revenueText = computed(() =>
    this.revenue() === null ? '—' : '$' + this.revenue()!.toLocaleString(),
  );

  colors = ['#5c4fd6', '#40d080', '#40a0ff', '#d0a020', '#ff6080', '#a0ff80'];

  ngOnInit() {
    this.projectApi.visible().subscribe({
      next: (p) => this.projects.set(p),
      error: () => this.projects.set([]),
    });
    this.taskApi.getAll().subscribe({
      next: (t) => this.taskCount.set(t.length),
      error: () => this.taskCount.set(0),
    });
    this.teamApi.getAll().subscribe({
      next: (t) => this.teamCount.set(t.length),
      error: () => this.teamCount.set(0),
    });
    this.taskApi.activity().subscribe({
      next: (c) => this.chart.set(c),
      error: () => {},
    });
    this.roleSvc
      .ensure()
      .pipe(switchMap(() => (this.roleSvc.isTeamLead() ? this.projectApi.revenue() : EMPTY)))
      .subscribe((r) => this.revenue.set(r.total));
  }
}