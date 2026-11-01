import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap, timer } from 'rxjs';
import { AppNotification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  imports: [DatePipe],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBell {
  private api = inject(NotificationService);
  private router = inject(Router);

  open = signal(false);
  items = signal<AppNotification[]>([]);
  unread = computed(() => this.items().filter((n) => !n.isRead).length);

  icons: Record<NotificationType, { icon: string; color: string }> = {
    completed: { icon: 'ti-circle-check', color: '#40a0ff' },
    issue: { icon: 'ti-alert-triangle', color: '#ff6080' },
    approved: { icon: 'ti-check', color: '#40d080' },
    rejected: { icon: 'ti-arrow-back-up', color: '#d0a020' },
  };

  constructor() {
    timer(0, 30000)
      .pipe(
        switchMap(() => this.api.list().pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(),
      )
      .subscribe((list) => this.items.set(list));
  }

  toggle() {
    this.open.update((v) => !v);
  }

  readAll() {
    this.items.update((l) => l.map((n) => ({ ...n, isRead: true })));
    this.api.markAllRead().subscribe();
  }

  openItem(n: AppNotification) {
    if (!n.isRead) {
      this.items.update((l) => l.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      this.api.markRead(n.id).subscribe();
    }
    this.open.set(false);
    this.router.navigateByUrl('/tasks');
  }
}