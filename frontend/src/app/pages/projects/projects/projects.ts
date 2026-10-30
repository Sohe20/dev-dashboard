import { Component, inject, OnInit, signal } from '@angular/core';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private api = inject(ProjectService);

  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal('');

  colors = ['#5c4fd6', '#40d080', '#40a0ff', '#d0a020', '#ff6080', '#a0ff80'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getAll().subscribe({
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

  remove(p: Project) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.api.remove(p.id).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to delete project.'),
    });
  }
}