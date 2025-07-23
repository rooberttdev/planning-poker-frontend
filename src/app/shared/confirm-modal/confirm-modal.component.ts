import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backdrop">
      <div class="modal">
        <p class="message">{{ message }}</p>
        <div class="buttons">
          <button class="btn btn-cancel" (click)="cancel.emit()">
            Cancelar
          </button>
          <button class="btn btn-ok" (click)="accept.emit()">OK</button>
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
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        padding: 1.5rem;
        border-radius: 8px;
        max-width: 360px;
        width: 100%;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
      }

      .message {
        margin-bottom: 1.5rem;
        font-size: 1rem;
        color: #f8fafc;
        text-align: center;
      }

      .buttons {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        min-width: 80px;
      }

      .btn-cancel {
        background: rgba(71, 85, 105, 0.4);
        color: #f8fafc;
      }
      .btn-cancel:hover {
        background: rgba(71, 85, 105, 0.6);
      }

      .btn-ok {
        background: #6366f1;
        color: #f8fafc;
      }
      .btn-ok:hover {
        background: #4f46e5;
      }
    `,
  ],
})
export class ConfirmModalComponent {
  @Input() message = 'Tem certeza?';
  @Output() accept = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
