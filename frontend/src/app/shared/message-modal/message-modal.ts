import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-message-modal',
  imports: [],
  templateUrl: './message-modal.html',
  styleUrl: './message-modal.css',
})
export class MessageModal {
  heading = input('');
  placeholder = input('');
  confirmLabel = input('Send');
  required = input(false);

  confirmed = output<string>();
  closed = output<void>();

  text = signal('');
  error = signal('');

  submit() {
    const value = this.text().trim();
    if (this.required() && !value) {
      this.error.set('Please write a message.');
      return;
    }
    this.confirmed.emit(value);
  }
}