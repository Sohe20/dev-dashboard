import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../../core/auth';
import { Role } from '../../../core/role';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { TPipe } from '../../../core/t.pipe';

@Component({
  selector: 'app-profile',
  imports: [TPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private auth = inject(Auth);
  private taskApi = inject(TaskService);
  roleSvc = inject(Role);

  user = this.auth.user();
  initial = (this.user?.name ?? '?').charAt(0).toUpperCase();

  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal('');

  doneCount = computed(() => this.tasks().filter((t) => t.status === 'done').length);

  labels: Record<TaskStatus, string> = {
  todo: 'status.todo',
  inprogress: 'status.inprogress',
  review: 'status.review',
  blocked: 'status.blocked',
  done: 'status.done',
};

  colors: Record<TaskStatus, string> = {
    todo: '#6060a0',
    inprogress: '#40a0ff',
    review: '#d0a020',
    blocked: '#ff6080',
    done: '#40d080',
  };

  ngOnInit() {
    this.roleSvc.ensure().subscribe();
    this.taskApi.getMine().subscribe({
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
}