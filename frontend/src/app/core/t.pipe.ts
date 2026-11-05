import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18n } from './i18n';

@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private i18n = inject(I18n);

  transform(key: string, params?: Record<string, string | number>) {
    return this.i18n.t(key, params);
  }
}