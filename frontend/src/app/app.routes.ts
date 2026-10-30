import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { authGuard } from './core/auth.guard';
import { Dashboard } from './pages/dashboard/dashboard/dashboard';
import { Shell } from './layout/shell/shell';
import { Projects } from './pages/projects/projects/projects';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'projects', component: Projects },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
