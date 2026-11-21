import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18n } from './i18n';

@Pipe({ name: 'fdate', pure: false })
export class FDatePipe implements PipeTransform {
  private i18n = inject(I18n);

  transform(value: string | Date | null | undefined, withTime = true) {
    return value ? this.i18n.formatDate(value, withTime) : '';
  }
}