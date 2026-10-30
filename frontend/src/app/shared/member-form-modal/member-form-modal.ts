import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-member-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './member-form-modal.html',
  styleUrl: './member-form-modal.css',
})
export class MemberFormModal implements OnInit {
  private fb = inject(FormBuilder);
  private teamApi = inject(TeamService);
  private userApi = inject(UserService);

  takenUserIds = input<number[]>([]);
  saved = output<void>();
  closed = output<void>();

  allUsers = signal<User[]>([]);
  users = computed(() => this.allUsers().filter((u) => !this.takenUserIds().includes(u.id)));
  error = signal('');
  saving = signal(false);

  form = this.fb.group({
    userId: [null as number | null, Validators.required],
    role: ['', Validators.required],
  });

  ngOnInit() {
    this.userApi.getAll().subscribe((u) => this.allUsers.set(u));
  }

  submit() {
    const { userId, role } = this.form.getRawValue();
    const user = this.allUsers().find((u) => u.id === userId);

    if (this.form.invalid || !user || !role) {
      this.form.markAllAsTouched();
      this.error.set('Please select a user and enter a role.');
      return;
    }
    this.error.set('');
    this.saving.set(true);

    this.teamApi
      .create({ name: user.name, email: user.email, role: role.trim(), userId: user.id })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('Failed to add member.');
        },
      });
  }
}