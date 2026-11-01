import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Project } from '../../../models/project.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { User } from '../../../models/user.model';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink , DecimalPipe],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private projectApi = inject(ProjectService);
  private taskApi = inject(TaskService);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal('');

  members = computed(() => {
    const byId = new Map<number, User>();
    this.tasks().forEach((t) => t.assignee && byId.set(t.assignee.id, t.assignee));
    return [...byId.values()];
  });

  doneCount = computed(() => this.tasks().filter((t) => t.status === 'done').length);

  labels: Record<TaskStatus, string> = {
    todo: 'Todo',
    inprogress: 'In Progress',
    review: 'Waiting for review',
    blocked: 'Blocked',
    done: 'Done',
  };

  colors: Record<TaskStatus, string> = {
    todo: '#6060a0',
    inprogress: '#40a0ff',
    review: '#d0a020',
    blocked: '#ff6080',
    done: '#40d080',
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      project: this.projectApi.getOne(id),
      tasks: this.taskApi.getAll(),
    }).subscribe({
      next: ({ project, tasks }) => {
        if (!project) {
          this.error.set('Project not found.');
        } else {
          this.project.set(project);
          this.tasks.set(tasks.filter((t) => t.project?.id === id));
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load project.');
        this.loading.set(false);
      },
    });
  }
}