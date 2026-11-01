import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../../core/auth';
import { Role } from '../../../core/role';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { MessageModal } from '../../../shared/message-modal/message-modal';
import { TaskFormModal } from '../../../shared/task-form-modal/task-form-modal';

interface MessageAction {
  kind: 'issue' | 'sendBack';
  task: Task;
}

@Component({
  selector: 'app-tasks',
  imports: [TaskFormModal, MessageModal],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  private api = inject(TaskService);
  private auth = inject(Auth);
  roleSvc = inject(Role);

  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal('');

  showForm = signal(false);
  editing = signal<Task | null>(null);
  msgAction = signal<MessageAction | null>(null);

  myId: number | undefined = this.auth.user()?.sub;

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
        this.error.set('Could not load tasks.');
        this.loading.set(false);
      },
    });
  }

  isMine(t: Task) {
    return t.assignee?.id === this.myId;
  }

  canComplete(t: Task) {
    return this.isMine(t) && (t.status === 'todo' || t.status === 'inprogress');
  }

  // ---- عضو ----
  complete(t: Task) {
    this.api.complete(t.id).subscribe({
      next: () => this.load(),
      error: () => {
        alert('Could not mark the task as done.');
        this.load();
      },
    });
  }

  openIssue(t: Task) {
    this.msgAction.set({ kind: 'issue', task: t });
  }

  // ---- Team Lead ----
  approve(t: Task) {
    this.api.approve(t.id).subscribe({
      next: () => this.load(),
      error: () => alert('Could not approve the task.'),
    });
  }

  openSendBack(t: Task) {
    this.msgAction.set({ kind: 'sendBack', task: t });
  }

  onMessage(text: string) {
    const a = this.msgAction();
    if (!a) return;
    const request =
      a.kind === 'issue'
        ? this.api.reportIssue(a.task.id, text)
        : this.api.sendBack(a.task.id, text);

    request.subscribe({
      next: () => {
        this.msgAction.set(null);
        this.load();
      },
      error: () => alert('Action failed.'),
    });
  }

  // ---- ساخت، ویرایش و حذف ----
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
}