import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TeamMember } from '../../../models/team.model';
import { TeamService } from '../../../services/team.service';
import { MemberFormModal } from '../../../shared/member-form-modal/member-form-modal';

@Component({
  selector: 'app-team',
  imports: [MemberFormModal],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class Team implements OnInit {
  private api = inject(TeamService);

  members = signal<TeamMember[]>([]);
  loading = signal(true);
  error = signal('');
  showForm = signal(false);

  takenUserIds = computed(() =>
    this.members()
      .map((m) => m.userId)
      .filter((id): id is number => id !== null),
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getAll().subscribe({
      next: (data) => {
        this.members.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load team.');
        this.loading.set(false);
      },
    });
  }

  onSaved() {
    this.showForm.set(false);
    this.load();
  }

  remove(m: TeamMember) {
    if (!confirm(`Remove ${m.name}?`)) return;
    this.api.remove(m.id).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to remove member.'),
    });
  }
}