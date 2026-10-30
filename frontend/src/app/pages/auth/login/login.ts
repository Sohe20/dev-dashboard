import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../core/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['../auth-shared.css', './login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  showPass = signal(false);
  error = signal('');
  success = signal('');

  form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  setMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.error.set('');
    this.success.set('');
    const name = this.form.controls.name;
    if (m === 'register') name.setValidators(Validators.required);
    else name.clearValidators();
    name.updateValueAndValidity();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please fill all fields correctly (password: at least 6 characters).');
      return;
    }
    this.error.set('');
    const { name, email, password } = this.form.getRawValue();

    if (this.mode() === 'login') {
      this.auth.login({ email, password }).subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: () => this.error.set('Invalid email or password.'),
      });
    } else {
      this.auth.register({ name, email, password }).subscribe({
        next: () => {
          this.setMode('login');
          this.success.set('Account created! You can now sign in.');
        },
        error: () => this.error.set('Registration failed. Email may already exist.'),
      });
    }
  }
}