import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, ProjectStatus } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './project-form-modal.html',
  styleUrl: './project-form-modal.css',
})
export class ProjectFormModal implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProjectService);

  project = input<Project | null>(null);
  saved = output<void>();
  closed = output<void>();

  error = signal('');
  saving = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    progress: [0, [Validators.min(0), Validators.max(100)]],
    budget: [0, Validators.min(0)],
    status: ['active' as ProjectStatus],
  });

  ngOnInit() {
    const p = this.project();
    if (p) this.form.patchValue(p);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Name and description are required. Progress must be 0–100.');
      return;
    }
    this.error.set('');
    this.saving.set(true);

    const body = this.form.getRawValue();
    const p = this.project();
    const request = p ? this.api.update(p.id, body) : this.api.create(body);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save project.');
      },
    });
  }
}