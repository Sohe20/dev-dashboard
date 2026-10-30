import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Theme {
  isLight = signal(localStorage.getItem('theme') === 'light');

  constructor() {
    effect(() => {
      const light = this.isLight();
      document.body.classList.toggle('light', light);
      localStorage.setItem('theme', light ? 'light' : 'dark');
    });
  }

  toggle() {
    this.isLight.update((v) => !v);
  }
}