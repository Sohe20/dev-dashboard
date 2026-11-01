import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/auth';
import { Theme } from '../../core/theme';
import { NotificationBell } from '../../shared/notification-bell/notification-bell';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive ,  NotificationBell],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  auth = inject(Auth);
  theme = inject(Theme);

  initial = (this.auth.user()?.name ?? '?').charAt(0).toUpperCase();

  nav = [
    { path: '/dashboard', icon: 'ti-home', title: 'Dashboard' },
    { path: '/projects', icon: 'ti-folders', title: 'Projects' },
    { path: '/tasks', icon: 'ti-circle-check', title: 'Tasks' },
    { path: '/team', icon: 'ti-users-group', title: 'Team' },
    { path: '/profile', icon: 'ti-user', title: 'Profile' },
  ];
}