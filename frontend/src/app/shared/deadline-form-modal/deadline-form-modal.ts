import { Component, inject, input, OnInit, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TPipe } from '../../core/t.pipe';
import { Deadline } from '../../models/deadline.model';
import { DeadlineService } from '../../services/deadline.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { I18n } from '../../core/i18n';

@Component({
  selector: 'app-deadline-form-modal',
  imports: [ReactiveFormsModule, TPipe],
  templateUrl: './deadline-form-modal.html',
  styleUrl: './deadline-form-modal.css',
})
export class DeadlineFormModal implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(DeadlineService);
  private i18n = inject(I18n);
  projectId = input.required<number>();
  deadline = input<Deadline | null>(null);
  saved = output<void>();
  closed = output<void>();

  error = signal('');
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    dueDate: ['', Validators.required],
  });




  private dueValue = toSignal(this.form.controls.dueDate.valueChanges, {
    initialValue: '',
  });

  preview = computed(() => {
    const v = this.dueValue();
    if (!v || this.i18n.lang() !== 'fa') return '';
    return this.i18n.formatDate(new Date(v));
  });

  ngOnInit() {
    const d = this.deadline();
    if (d) {
      this.form.patchValue({ title: d.title, dueDate: this.toLocalInput(d.dueDate) });
    }
  }


  private toLocalInput(iso: string) {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('dl.formErr');
      return;
    }
    this.error.set('');
    this.saving.set(true);

    const { title, dueDate } = this.form.getRawValue();
    const body = { title: title.trim(), dueDate: new Date(dueDate).toISOString() };
    const d = this.deadline();

    const request = d
      ? this.api.update(d.id, body)
      : this.api.create({ ...body, projectId: this.projectId() });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(!d && err.status === 400 ? 'dl.maxReached' : 'dl.saveErr');
      },
    });
  }
}