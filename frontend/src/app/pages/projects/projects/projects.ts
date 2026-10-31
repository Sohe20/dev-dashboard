import { Component, inject, OnInit, signal } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { Project } from '../../../models/project.model';
import { Task } from '../../../models/task.model';
import { Role } from '../../../core/role';
import { ProjectService } from '../../../services/project.service';
import { TaskService } from '../../../services/task.service';
import { ProjectFormModal } from '../../../shared/project-form-modal/project-form-modal';

@Component({
  selector: 'app-projects',
  imports: [ProjectFormModal],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private api = inject(ProjectService);
  private taskApi = inject(TaskService);
  roleSvc = inject(Role);

  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal('');

  showForm = signal(false);
  editing = signal<Project | null>(null);

  colors = ['#5c4fd6', '#40d080', '#40a0ff', '#d0a020', '#ff6080', '#a0ff80'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.roleSvc
      .ensure()
      .pipe(
        switchMap((role) =>
          !role || role === 'Team Lead'
            ? this.api.getAll()
            : this.taskApi.getMine().pipe(map((tasks) => this.uniqueProjects(tasks))),
        ),
      )
      .subscribe({
        next: (data) => {
          this.projects.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load projects.');
          this.loading.set(false);
        },
      });
  }

  private uniqueProjects(tasks: Task[]): Project[] {
    const byId = new Map<number, Project>();
    tasks.forEach((t) => t.project && byId.set(t.project.id, t.project));
    return [...byId.values()];
  }

  openNew() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Project) {
    this.editing.set(p);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  onSaved() {
    this.showForm.set(false);
    this.load();
  }

  remove(p: Project) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.api.remove(p.id).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to delete project.'),
    });
  }
}