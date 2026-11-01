import { Component, inject, OnInit, signal } from '@angular/core';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { TaskFormModal } from '../../../shared/task-form-modal/task-form-modal';

@Component({
  selector: 'app-tasks',
  imports: [TaskFormModal],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  private api = inject(TaskService);

  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal('');

  showForm = signal(false);
  editing = signal<Task | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getAll().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load tasks.');
        this.loading.set(false);
      },
    });
  }

 

  openNew() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(t: Task) {
    this.editing.set(t);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  onSaved() {
    this.showForm.set(false);
    this.load();
  }

  remove(t: Task) {
    if (!confirm(`Delete "${t.title}"?`)) return;
    this.api.remove(t.id).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to delete task.'),
    });
  }

  color(status: TaskStatus) {
  const map: Record<TaskStatus, string> = {
    todo: '#6060a0',
    inprogress: '#40a0ff',
    review: '#d0a020',
    blocked: '#ff6080',
    done: '#40d080',
  };
  return map[status];
}
}