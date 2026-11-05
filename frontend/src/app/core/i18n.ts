import { effect, Injectable, signal } from '@angular/core';
import { en, fa } from './translations';

export type Lang = 'en' | 'fa';

@Injectable({ providedIn: 'root' })
export class I18n {
  lang = signal<Lang>(localStorage.getItem('lang') === 'fa' ? 'fa' : 'en');

  constructor() {
    effect(() => {
      const l = this.lang();
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'fa' ? 'rtl' : 'ltr';
      localStorage.setItem('lang', l);
    });
  }

  toggle() {
    this.lang.update((l) => (l === 'en' ? 'fa' : 'en'));
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dict = this.lang() === 'fa' ? fa : en;
    let text = dict[key] ?? en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replaceAll(`{${k}}`, String(v));
      }
    }
    return text;
  }
}