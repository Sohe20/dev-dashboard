import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Task, TaskStatus } from '../../models/task.model';
import { User } from '../../models/user.model';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-task-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-modal.html',
  styleUrl: './task-form-modal.css',
})
export class TaskFormModal implements OnInit {
  private fb = inject(FormBuilder);
  private taskApi = inject(TaskService);
  private projectApi = inject(ProjectService);
  private userApi = inject(UserService);

  task = input<Task | null>(null);
  saved = output<void>();
  closed = output<void>();

  projects = signal<Project[]>([]);
  users = signal<User[]>([]);
  error = signal('');
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: ['todo' as TaskStatus],
    projectId: [null as number | null],
    assigneeId: [null as number | null],
  });

  ngOnInit() {
    this.projectApi.getAll().subscribe((p) => this.projects.set(p));
    this.userApi.getAll().subscribe((u) => this.users.set(u));

    const t = this.task();
    if (t) {
      this.form.patchValue({
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        projectId: t.project?.id ?? null,
        assigneeId: t.assignee?.id ?? null,
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Title is required.');
      return;
    }
    this.error.set('');
    this.saving.set(true);

    const body = this.form.getRawValue();
    const t = this.task();
    const request = t ? this.taskApi.update(t.id, body) : this.taskApi.create(body);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save task.');
      },
    });
  }
}