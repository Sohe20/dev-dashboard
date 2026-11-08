import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap, timer } from 'rxjs';
import { AppNotification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { TPipe } from '../../core/t.pipe';
import { I18n } from '../../core/i18n';

@Component({
  selector: 'app-notification-bell',
  imports: [DatePipe, TPipe],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBell {
  private api = inject(NotificationService);
  private router = inject(Router);
  private i18n = inject(I18n)
  open = signal(false);
  items = signal<AppNotification[]>([]);
  unread = computed(() => this.items().filter((n) => !n.isRead).length);
  bellBtn = viewChild.required<ElementRef<HTMLButtonElement>>('bellBtn');
  panelPos = signal({ bottom: 20, start: 76 });




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
    if (!this.open()) this.place();
    this.open.update((v) => !v);
  }
  private place() {
    const r = this.bellBtn().nativeElement.getBoundingClientRect();
    const rtl = document.documentElement.dir === 'rtl';
    const gap = 12;
    this.panelPos.set({
      bottom: Math.max(12, window.innerHeight - r.bottom),
      start: rtl ? window.innerWidth - r.left + gap : r.right + gap,
    });
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


  text(n: AppNotification) {
    return this.i18n.t('notif.' + n.type, {
      name: n.sender?.name ?? this.i18n.t('notif.someone'),
      title: n.task?.title ?? '',
    });
  }

  note(n: AppNotification) {
    const m = n.message.match(/(?:": |sent back: )([\s\S]*)$/);
    return m ? m[1] : '';
  }


}