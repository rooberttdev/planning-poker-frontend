import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Room } from '../../interfaces/room.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <header class="header">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#6366f1" />
            <path d="M20 12L28 20L20 28L12 20Z" fill="white" />
          </svg>
        </div>
        <h1 class="title">Planning Poker</h1>
        <p class="subtitle">Estimativa colaborativa para equipes ágeis</p>
      </header>

      <div class="cards-container">
        <div class="card create-room-card">
          <h2>Criar Nova Sala</h2>
          <p class="card-description">Inicie uma nova sessão de estimativas</p>

          <form (ngSubmit)="createRoom()" class="create-form">
            <div class="form-group">
              <label class="form-label">Nome do moderador</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="moderatorName"
                name="moderatorName"
                placeholder="Seu nome"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!moderatorName.trim()"
            >
              Criar Sala
            </button>
          </form>
        </div>

        <div class="card join-room-card">
          <h2>Entrar em uma Sala</h2>
          <p class="card-description">Participe de uma sessão existente</p>

          <form (ngSubmit)="joinRoom()" class="join-form">
            <div class="form-group">
              <label class="form-label">ID da sala ou link completo</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="roomId"
                name="roomId"
                placeholder="ID da sala ou URL"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Seu nome</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="participantName"
                name="participantName"
                placeholder="Seu nome"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!roomId.trim() || !participantName.trim()"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
        <button class="error-close" (click)="clearError()">×</button>
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
        min-height: 100vh;
        padding: 40px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .header {
        text-align: center;
        margin-bottom: 60px;
      }

      .logo {
        margin-bottom: 24px;
      }

      .title {
        font-size: 3.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 16px;
      }

      .subtitle {
        font-size: 1.25rem;
        color: #94a3b8;
        font-weight: 400;
      }

      .cards-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 40px;
        max-width: 900px;
        width: 100%;
      }

      .card {
        padding: 32px;
      }

      .card h2 {
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 8px;
        color: #f8fafc;
      }

      .card-description {
        color: #94a3b8;
        margin-bottom: 32px;
        font-size: 1rem;
      }

      .create-form,
      .join-form {
        display: flex;
        flex-direction: column;
      }

      .form-group {
        margin-bottom: 24px;
      }

      .btn {
        margin-top: 16px;
        font-size: 1rem;
        padding: 16px;
      }

      .error-message {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
      }

      .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .cards-container {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .title {
          font-size: 2.5rem;
        }

        .card {
          padding: 24px;
        }
      }
    `,
  ],
})
export class HomeComponent {
  moderatorName: string = '';
  roomId: string = '';
  participantName: string = '';
  error: string | null = null;

  constructor(private socketService: SocketService, private router: Router) {
    this.socketService.error$.subscribe((error: string | null) => {
      this.error = error;
    });
  }

  createRoom(): void {
    if (this.moderatorName.trim()) {
      localStorage.setItem('userName', this.moderatorName.trim());
      this.router.navigate(['/setup']);
    }
  }

  joinRoom(): void {
    if (this.roomId.trim() && this.participantName.trim()) {
      let roomIdToUse = this.roomId.trim();
      const urlPattern = /\/([a-f0-9-]{36})/;
      const match = this.roomId.match(urlPattern);
      if (match) {
        roomIdToUse = match[1];
      }
      localStorage.setItem('tempUserName', this.participantName.trim());
      this.router.navigate(['/join', roomIdToUse]);
    }
  }

  clearError(): void {
    this.error = null;
    this.socketService.clearError();
  }
}
