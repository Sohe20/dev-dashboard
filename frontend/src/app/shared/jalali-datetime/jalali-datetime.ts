import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { fromJalali, JALALI_MONTHS, jalaliMonthLength, toJalali } from '../../core/jalali';
import { TPipe } from '../../core/t.pipe';

@Component({
  selector: 'app-jalali-datetime',
  imports: [TPipe],
  templateUrl: './jalali-datetime.html',
  styleUrl: './jalali-datetime.css',
})
export class JalaliDatetime implements OnInit {
 
  value = input('');
  valueChange = output<string>();

  months = JALALI_MONTHS;
  y = signal<number | null>(null);
  m = signal<number | null>(null);
  d = signal<number | null>(null);
  time = signal('09:00');

  years = computed(() => {
    const cur = toJalali(new Date()).y;
    const set = new Set<number>();
    for (let i = -1; i <= 5; i++) set.add(cur + i);
    const chosen = this.y();
    if (chosen) set.add(chosen);
    return [...set].sort((a, b) => a - b);
  });

  days = computed(() => {
    const y = this.y() ?? toJalali(new Date()).y;
    const m = this.m() ?? 1;
    return Array.from({ length: jalaliMonthLength(y, m) }, (_, i) => i + 1);
  });

  ngOnInit() {
    const v = this.value();
    if (!v) return;
    const dt = new Date(v);
    if (isNaN(dt.getTime())) return;
    const j = toJalali(dt);
    this.y.set(j.y);
    this.m.set(j.m);
    this.d.set(j.d);
    this.time.set(v.slice(11, 16) || '09:00');
  }

  fa(n: number) {
    return n.toLocaleString('fa-IR', { useGrouping: false });
  }

  setYear(v: string) {
    this.y.set(v ? +v : null);
    this.fix();
  }

  setMonth(v: string) {
    this.m.set(v ? +v : null);
    this.fix();
  }

  setDay(v: string) {
    this.d.set(v ? +v : null);
    this.emit();
  }

  setTime(v: string) {
    this.time.set(v);
    this.emit();
  }

  // اگه روز انتخابی توی ماه جدید وجود نداره (مثلاً ۳۱ در مهر)، به آخرین روز ماه برمی‌گرده
  private fix() {
    const y = this.y();
    const m = this.m();
    const d = this.d();
    if (y && m && d) {
      const max = jalaliMonthLength(y, m);
      if (d > max) this.d.set(max);
    }
    this.emit();
  }

  private emit() {
    const y = this.y();
    const m = this.m();
    const d = this.d();
    if (!y || !m || !d || !this.time()) {
      this.valueChange.emit('');
      return;
    }
    const g = fromJalali({ y, m, d });
    if (!g) {
      this.valueChange.emit('');
      return;
    }
    const p = (n: number) => String(n).padStart(2, '0');
    this.valueChange.emit(
      `${g.getFullYear()}-${p(g.getMonth() + 1)}-${p(g.getDate())}T${this.time()}`,
    );
  }
}