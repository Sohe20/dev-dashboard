import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Role } from '../../../core/role';
import { TPipe } from '../../../core/t.pipe';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { TaskList } from '../../../shared/task-list/task-list';

@Component({
  selector: 'app-tasks',
  imports: [TaskList, TPipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  private api = inject(TaskService);
  roleSvc = inject(Role);

  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal('');

  list = viewChild.required(TaskList);

  ngOnInit() {
    this.roleSvc.ensure().subscribe();
    this.load();
  }

  load() {
    this.api.getAll().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('task.loadErr');
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.list().openNew();
  }
}