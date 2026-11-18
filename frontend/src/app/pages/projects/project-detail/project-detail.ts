import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Role } from '../../../core/role';
import { TPipe } from '../../../core/t.pipe';
import { Project } from '../../../models/project.model';
import { Task } from '../../../models/task.model';
import { User } from '../../../models/user.model';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { TaskList } from '../../../shared/task-list/task-list';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, DecimalPipe, TPipe, TaskList],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private projectApi = inject(ProjectService);
  private taskApi = inject(TaskService);
  roleSvc = inject(Role);

  private id = Number(this.route.snapshot.paramMap.get('id'));

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal('');

  list = viewChild(TaskList);

  members = computed(() => {
    const byId = new Map<number, User>();
    this.tasks().forEach((t) => t.assignee && byId.set(t.assignee.id, t.assignee));
    return [...byId.values()];
  });

  doneCount = computed(() => this.tasks().filter((t) => t.status === 'done').length);

  ngOnInit() {
    this.roleSvc.ensure().subscribe();
    this.load();
  }

  load() {
    forkJoin({
      project: this.projectApi.getOne(this.id),
      tasks: this.taskApi.getAll(),
    }).subscribe({
      next: ({ project, tasks }) => {
        if (!project) {
          this.error.set('det.notFound');
        } else {
          this.project.set(project);
          this.tasks.set(tasks.filter((t) => t.project?.id === this.id));
        }
        this.loading.set(false);
      },
      error: () => {
        if (!this.project()) this.error.set('det.loadErr');
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.list()?.openNew();
  }
}