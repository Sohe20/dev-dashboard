import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { I18n } from '../../core/i18n';
import { Role } from '../../core/role';
import { TPipe } from '../../core/t.pipe';
import { Deadline, MAX_DEADLINES } from '../../models/deadline.model';
import { DeadlineService } from '../../services/deadline.service';
import { DeadlineFormModal } from '../deadline-form-modal/deadline-form-modal';
import { FDatePipe } from '../../core/fdate.pipe';

type DlStatus = 'done' | 'overdue' | 'soon' | 'normal';

@Component({
  selector: 'app-deadline-list',
  imports: [FDatePipe, TPipe, DeadlineFormModal],
  templateUrl: './deadline-list.html',
  styleUrl: './deadline-list.css',
})
export class DeadlineList implements OnInit {
  private api = inject(DeadlineService);
  private i18n = inject(I18n);
  roleSvc = inject(Role);

  projectId = input.required<number>();

  max = MAX_DEADLINES;
  deadlines = signal<Deadline[]>([]);
  loading = signal(true);
  error = signal('');

  showForm = signal(false);
  editing = signal<Deadline | null>(null);

  canAdd = computed(() => this.deadlines().length < this.max);

  ngOnInit() {
    this.roleSvc.ensure().subscribe();
    this.load();
  }

  load() {
    this.api.list(this.projectId()).subscribe({
      next: (list) => {
        this.deadlines.set(list);
        this.error.set('');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('dl.loadErr');
        this.loading.set(false);
      },
    });
  }

  status(d: Deadline): DlStatus {
    if (d.isDone) return 'done';
    const diff = new Date(d.dueDate).getTime() - Date.now();
    if (diff < 0) return 'overdue';
    return diff <= 3 * 86400000 ? 'soon' : 'normal';
  }

  icon(d: Deadline) {
    const s = this.status(d);
    return s === 'done' ? 'ti-circle-check' : s === 'overdue' ? 'ti-alert-circle' : 'ti-clock';
  }

  remaining(d: Deadline): string {
    if (d.isDone) return this.i18n.t('dl.done');
    const due = new Date(d.dueDate);
    const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const dayDiff = Math.round((startOf(due) - startOf(new Date())) / 86400000);

    if (due.getTime() >= Date.now()) {
      if (dayDiff === 0) return this.i18n.t('dl.today');
      if (dayDiff === 1) return this.i18n.t('dl.tomorrow');
      return this.i18n.t('dl.inDays', { n: dayDiff });
    }
    return dayDiff > -2
      ? this.i18n.t('dl.overdue')
      : this.i18n.t('dl.overdueDays', { n: -dayDiff });
  }

  openNew() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(d: Deadline) {
    this.editing.set(d);
    this.showForm.set(true);
  }

  onSaved() {
    this.showForm.set(false);
    this.load();
  }

  toggleDone(d: Deadline) {
    this.api.update(d.id, { isDone: !d.isDone }).subscribe({
      next: () => this.load(),
      error: () => alert(this.i18n.t('dl.toggleErr')),
    });
  }

  remove(d: Deadline) {
    if (!confirm(this.i18n.t('dl.deleteConfirm', { name: d.title }))) return;
    this.api.remove(d.id).subscribe({
      next: () => this.load(),
      error: () => alert(this.i18n.t('dl.deleteErr')),
    });
  }
}