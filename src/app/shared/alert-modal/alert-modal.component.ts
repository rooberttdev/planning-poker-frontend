import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  template: `
    <div class="backdrop" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="header">
          <h3>{{ title || 'Aviso' }}</h3>
        </div>
        <div class="body">
          <p>{{ message }}</p>
        </div>
        <div class="footer">
          <button class="btn" (click)="close.emit()">OK</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        background: #1e293b;
        color: #f8fafc;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        overflow: hidden;
      }
      .header {
        padding: 16px;
        border-bottom: 1px solid #334155;
      }
      .body {
        padding: 16px;
      }
      .footer {
        padding: 16px;
        text-align: right;
        border-top: 1px solid #334155;
      }
      .btn {
        background: #6366f1;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn:hover {
        opacity: 0.9;
      }
    `,
  ],
})
export class AlertModalComponent {
  @Input() title?: string;
  @Input() message!: string;
  @Output() close = new EventEmitter<void>();
}
