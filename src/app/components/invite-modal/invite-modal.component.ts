import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="close.emit()">×</button>

        <h2 class="modal-title">Convidar Jogadores</h2>

        <div class="invite-content">
          <div class="form-group">
            <label class="form-label">Link da sala</label>
            <div class="url-display">
              <input
                type="text"
                class="form-input url-input"
                [value]="roomUrl"
                readonly
                #urlInput
              />
              <button
                class="btn btn-primary copy-btn"
                (click)="copyUrl(urlInput)"
              >
                {{ copyText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 24px;
        text-align: center;
        color: #f8fafc;
      }

      .invite-content {
        max-width: 400px;
      }

      .url-display {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .url-input {
        flex: 1;
        font-family: monospace;
        font-size: 0.875rem;
        background: #0f172a;
        border: 1px solid #334155;
        color: #94a3b8;
      }

      .url-input:focus {
        border-color: #6366f1;
      }

      .copy-btn {
        white-space: nowrap;
        min-width: 80px;
      }

      .divider {
        display: flex;
        align-items: center;
        margin: 24px 0;
        color: #64748b;
      }

      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #334155;
      }

      .divider span {
        padding: 0 16px;
        font-size: 0.875rem;
      }

      .qr-section {
        text-align: center;
      }

      .qr-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .qr-display {
        margin-top: 20px;
        padding: 20px;
        background: rgba(15, 23, 42, 0.6);
        border-radius: 8px;
        text-align: center;
        border: 1px dashed #475569;
      }

      .qr-placeholder {
        color: #94a3b8;
      }

      .qr-placeholder small {
        display: block;
        margin-top: 8px;
        font-family: monospace;
        word-break: break-all;
      }

      @media (max-width: 480px) {
        .url-display {
          flex-direction: column;
        }

        .copy-btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class InviteModalComponent {
  @Input() roomId: string = '';
  @Output() close = new EventEmitter<void>();

  copyText: string = 'Copiar';
  showQR: boolean = false;

  get roomUrl(): string {
    const currentUrl = window.location.href;
    const roomIdFromUrl = currentUrl.match(/\/room\/([^\/\?]+)/);
    const actualRoomId = roomIdFromUrl ? roomIdFromUrl[1] : this.roomId;
    console.log('Gerando URL de convite para sala:', actualRoomId);
    return `${window.location.origin}/join/${actualRoomId}`;
  }

  async copyUrl(input: HTMLInputElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.roomUrl);
      this.copyText = 'Copiado!';
      setTimeout(() => {
        this.copyText = 'Copiar';
      }, 2000);
    } catch (err) {
      input.select();
      document.execCommand('copy');
      this.copyText = 'Copiado!';
      setTimeout(() => {
        this.copyText = 'Copiar';
      }, 2000);
    }
  }

  generateQR(): void {
    this.showQR = !this.showQR;
  }
}
