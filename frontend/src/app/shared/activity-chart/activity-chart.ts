import { Component, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Theme } from '../../core/theme';

@Component({
  selector: 'app-activity-chart',
  template: '<canvas #c></canvas>',
  styles: `
    canvas {
      width: 100%;
      height: 180px;
      display: block;
    }
  `,
  host: { '(window:resize)': 'draw()' },
})
export class ActivityChart {
  private theme = inject(Theme);

  labels = input<string[]>([]);
  data = input<number[]>([]);
  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('c');

  constructor() {
    effect(() => this.draw());
  }

  draw() {
    const el = this.canvas()?.nativeElement;
    this.theme.isLight(); // تا با عوض شدن تم دوباره کشیده بشه
    const values = this.data().length ? this.data() : [0];
    const labels = this.labels().length ? this.labels() : ['No data'];
    if (!el || !el.offsetWidth) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const w = (el.width = el.offsetWidth);
    const h = (el.height = 180);
    const pad = { left: 30, right: 10, top: 10, bottom: 20 };
    const max = Math.max(...values, 10);
    const light = this.theme.isLight();
    const gridColor = light ? '#e0e0ec' : '#1e1e3a';
    const labelColor = light ? '#8080a0' : '#44447a';

    const px = (i: number) =>
      pad.left + (i / Math.max(values.length - 1, 1)) * (w - pad.left - pad.right);
    const py = (v: number) => pad.top + (1 - v / max) * (h - pad.top - pad.bottom);

    ctx.clearRect(0, 0, w, h);
    ctx.font = '10px Inter';

    [0, max / 4, max / 2, (max * 3) / 4, max].map(Math.round).forEach((v) => {
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      ctx.moveTo(pad.left, py(v));
      ctx.lineTo(w - pad.right, py(v));
      ctx.stroke();
      ctx.fillStyle = labelColor;
      ctx.textAlign = 'right';
      ctx.fillText(String(v), pad.left - 6, py(v) + 4);
    });

    labels.forEach((l, i) => {
      ctx.fillStyle = labelColor;
      ctx.textAlign = 'center';
      ctx.fillText(l, px(i), h - 4);
    });

    if (values.length > 1) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(92,79,214,0.35)');
      grad.addColorStop(1, 'rgba(92,79,214,0)');

      ctx.beginPath();
      values.forEach((v, i) => (i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v))));
      ctx.lineTo(px(values.length - 1), h - pad.bottom);
      ctx.lineTo(px(0), h - pad.bottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = '#7c6fff';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      values.forEach((v, i) => (i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v))));
      ctx.stroke();
    }
  }
}