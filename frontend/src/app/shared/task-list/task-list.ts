import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { Auth } from '../../core/auth';
import { I18n } from '../../core/i18n';
import { Role } from '../../core/role';
import { TPipe } from '../../core/t.pipe';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { MessageModal } from '../message-modal/message-modal';
import { TaskFormModal } from '../task-form-modal/task-form-modal';
import { NgTemplateOutlet } from '@angular/common';

interface MessageAction {
  kind: 'issue' | 'sendBack';
  task: Task;
}

@Component({
  selector: 'app-task-list',
  imports: [TaskFormModal, MessageModal, TPipe, NgTemplateOutlet],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private api = inject(TaskService);
  private auth = inject(Auth);
  i18n = inject(I18n);
  roleSvc = inject(Role);

  tasks = input<Task[]>([]);
  loading = input(false);
  error = input('');
  presetProjectId = input<number | null>(null);
  changed = output<void>();

  showForm = signal(false);
  editing = signal<Task | null>(null);
  msgAction = signal<MessageAction | null>(null);

  showPast = signal(false);
  active = computed(() => this.tasks().filter((t) => t.status !== 'done'));
  past = computed(() => this.tasks().filter((t) => t.status === 'done'));

  myId: number | undefined = this.auth.user()?.sub;

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

  color(status: TaskStatus) {
  return this.colors[status];
}

label(status: TaskStatus) {
  return this.labels[status];
}

  ngOnInit() {
    this.roleSvc.ensure().subscribe();
  }

  clearPast() {
  if (!confirm(this.i18n.t('task.clearConfirm'))) return;
  this.api.removeCompleted(this.presetProjectId() ?? undefined).subscribe({
    next: () => this.changed.emit(),
    error: () => alert(this.i18n.t('task.clearErr')),
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
      next: () => this.changed.emit(),
      error: () => {
        alert(this.i18n.t('task.completeErr'));
        this.changed.emit();
      },
    });
  }

  openIssue(t: Task) {
    this.msgAction.set({ kind: 'issue', task: t });
  }

  // ---- Team Lead ----
  approve(t: Task) {
    this.api.approve(t.id).subscribe({
      next: () => this.changed.emit(),
      error: () => alert(this.i18n.t('task.approveErr')),
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
        this.changed.emit();
      },
      error: () => alert(this.i18n.t('task.actionErr')),
    });
  }

  // ---- ساخت، ویرایش، حذف ----
  openNew() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(t: Task) {
    this.editing.set(t);
    this.showForm.set(true);
  }

  onSaved() {
    this.showForm.set(false);
    this.changed.emit();
  }

  remove(t: Task) {
    if (!confirm(this.i18n.t('task.deleteConfirm', { name: t.title }))) return;
    this.api.remove(t.id).subscribe({
      next: () => this.changed.emit(),
      error: () => alert(this.i18n.t('task.deleteErr')),
    });
  }
}