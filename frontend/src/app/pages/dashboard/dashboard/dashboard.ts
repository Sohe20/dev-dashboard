import { Component, inject } from '@angular/core';
import { Auth } from '../../../core/auth';

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
auth = inject(Auth);
}
