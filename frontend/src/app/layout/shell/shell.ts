import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/auth';
import { Theme } from '../../core/theme';
import { NotificationBell } from '../../shared/notification-bell/notification-bell';
import { I18n } from '../../core/i18n';
import { TPipe } from '../../core/t.pipe';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive ,  NotificationBell ,
   TPipe
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  auth = inject(Auth);
  theme = inject(Theme);
  i18n = inject(I18n)

  initial = (this.auth.user()?.name ?? '?').charAt(0).toUpperCase();

 nav = [
  { path: '/dashboard', icon: 'ti-home', title: 'nav.dashboard' },
  { path: '/projects', icon: 'ti-folders', title: 'nav.projects' },
  { path: '/tasks', icon: 'ti-circle-check', title: 'nav.tasks' },
  { path: '/team', icon: 'ti-users-group', title: 'nav.team' },
  { path: '/profile', icon: 'ti-user', title: 'nav.profile' },
];
}