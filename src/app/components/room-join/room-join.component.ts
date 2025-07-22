import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-room-join',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="join-container">
      <header class="join-header">
        <div *ngIf="error" class="error-toast">
          {{ error }}
          <button class="error-close" (click)="clearError()">×</button>
        </div>

        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#6366f1" />
            <path d="M20 12L28 20L20 28L12 20Z" fill="white" />
          </svg>
        </div>
        <h1 class="room-title">Sala de Planning Poker</h1>
        <div class="room-info">
          <span class="room-id">{{ roomTitle }}</span>
        </div>
      </header>

      <div class="join-form-container">
        <div class="join-card">
          <h2>Escolha o seu nome de exibição</h2>

          <form (ngSubmit)="joinRoom()" class="join-form">
            <div class="form-group">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="displayName"
                name="displayName"
                placeholder="O seu nome de exibição"
                required
                maxlength="50"
                #nameInput
              />
              <button
                type="button"
                class="input-icon"
                (click)="generateRandomName()"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              class="btn btn-primary join-btn"
              [disabled]="!displayName.trim()"
            >
              Continue para o jogo
            </button>
          </form>
        </div>
      </div>

      <div class="cards-preview">
        <p class="preview-text">Escolha o seu cartão</p>
        <div class="preview-cards">
          <div *ngFor="let card of previewCards" class="preview-card">
            {{ card }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .join-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: #f8fafc;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }

      .join-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 40px;
        text-align: center;
        position: relative;
        width: 100%;
        justify-content: center;
      }

      .error-toast {
        position: absolute;
        top: 0;
        left: 0;
        background: #dc2626;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.875rem;
        animation: slideInLeft 0.3s ease-out;
        z-index: 10;
      }

      .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .room-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: #f8fafc;
      }

      .room-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .room-id {
        font-size: 0.75rem;
        color: #64748b;
        font-family: monospace;
        background: rgba(100, 116, 139, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .join-form-container {
        width: 100%;
        max-width: 500px;
        margin-bottom: 40px;
      }

      .join-card {
        background: rgba(51, 65, 85, 0.6);
        border: 1px solid #475569;
        border-radius: 16px;
        padding: 32px;
        backdrop-filter: blur(10px);
        text-align: center;
      }

      .join-card h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 24px;
        color: #f8fafc;
      }

      .join-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .form-group {
        position: relative;
      }

      .form-input {
        width: 100%;
        padding: 16px 20px;
        padding-right: 50px;
        background: #334155;
        border: 1px solid #475569;
        border-radius: 12px;
        color: #f8fafc;
        font-size: 16px;
        transition: all 0.3s ease;
        text-align: center;
      }

      .form-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-input::placeholder {
        color: #94a3b8;
      }

      .input-icon {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .input-icon:hover {
        color: #f8fafc;
        background: rgba(148, 163, 184, 0.1);
      }

      .join-options {
        display: flex;
        justify-content: center;
      }

      .option-label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        user-select: none;
        color: #cbd5e1;
      }

      .option-radio {
        width: 20px;
        height: 20px;
        border: 2px solid #475569;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        position: relative;
        appearance: none;
        transition: all 0.2s ease;
      }

      .option-radio:checked {
        border-color: #6366f1;
        background: #6366f1;
      }

      .option-radio:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: white;
      }

      .option-text {
        font-size: 0.875rem;
      }

      .join-btn {
        padding: 16px 32px;
        font-size: 1rem;
        font-weight: 600;
        border-radius: 12px;
      }

      .cards-preview {
        width: 100%;
        max-width: 800px;
        text-align: center;
      }

      .preview-text {
        margin-bottom: 16px;
        color: #94a3b8;
        font-size: 0.875rem;
      }

      .preview-cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .preview-card {
        width: 40px;
        height: 56px;
        background: rgba(51, 65, 85, 0.8);
        border: 1px solid #475569;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        color: #64748b;
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .join-container {
          padding: 20px 16px;
        }

        .join-card {
          padding: 24px;
        }

        .join-header {
          flex-direction: column;
          gap: 8px;
          margin-bottom: 32px;
        }

        .room-info {
          align-items: center;
        }
      }
    `,
  ],
})
export class RoomJoinComponent implements OnInit {
  roomId: string = '';
  roomTitle: string = 'Sala de Planning Poker';
  displayName: string = '';
  error: string | null = null;

  previewCards = [
    '0',
    '1',
    '2',
    '3',
    '5',
    '8',
    '13',
    '21',
    '34',
    '55',
    '89',
    '?',
    '☕',
  ];

  private randomNames = [
    'Desenvolvedor Anônimo',
    'Code Ninja',
    'Bug Hunter',
    'Feature Creator',
    'Scrum Master',
    'Product Owner',
    'Tech Lead',
    'Full Stack Dev',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.params['id'];
    this.roomTitle = 'Carregando informações da sala...';

    const tempUserName = localStorage.getItem('tempUserName');
    if (tempUserName) {
      this.displayName = tempUserName;
      localStorage.removeItem('tempUserName');
    }

    const currentRoom = localStorage.getItem('currentRoom');
    const userName = localStorage.getItem('userName');

    if (currentRoom && userName) {
      try {
        const room = JSON.parse(currentRoom);
        if (room.id === this.roomId) {
          this.router.navigate(['/room', this.roomId]);
          return;
        }
      } catch (error) {}
    }

    this.socketService.getRoomInfo(this.roomId);

    this.socketService.error$.subscribe((error) => {
      this.error = error;

      if (error && error.includes('não encontrada')) {
        this.error =
          'Esta sala não existe ou expirou. Peça ao moderador para criar uma nova sala.';
      }
    });

    this.socketService.roomInfo$.subscribe((roomInfo) => {
      if (roomInfo && roomInfo.roomId === this.roomId) {
        this.roomTitle =
          roomInfo.name || `Sala ${this.roomId.substring(0, 8)}...`;
      }
    });

    this.socketService.room$.subscribe((room) => {
      if (room && room.id === this.roomId) {
        localStorage.setItem('currentRoom', JSON.stringify(room));
        localStorage.setItem('userRole', 'participant');
        localStorage.setItem('userName', this.displayName.trim());
        this.router.navigate(['/room', this.roomId]);
      }
    });

    this.socketService.participants$.subscribe((participants) => {
      if (
        participants.length > 0 &&
        participants.includes(this.displayName.trim())
      ) {
        console.log(
          '✅ Participante adicionado com sucesso, redirecionando...'
        );
        const roomData = {
          id: this.roomId,
          moderator: '',
          participants: participants,
        };
        localStorage.setItem('currentRoom', JSON.stringify(roomData));
        localStorage.setItem('userRole', 'participant');
        localStorage.setItem('userName', this.displayName.trim());
        this.router.navigate(['/room', this.roomId]);
      }
    });
  }

  generateRandomName(): void {
    const randomIndex = Math.floor(Math.random() * this.randomNames.length);
    this.displayName = this.randomNames[randomIndex];
  }

  joinRoom(): void {
    if (this.displayName.trim()) {
      this.error = null;
      localStorage.setItem('userName', this.displayName.trim());
      localStorage.setItem('userRole', 'participant');

      this.socketService.joinRoom(this.roomId, this.displayName.trim());
    }
  }

  clearError(): void {
    this.error = null;
    this.socketService.clearError();
  }
}
