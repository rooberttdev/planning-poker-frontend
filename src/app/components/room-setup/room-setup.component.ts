import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { SessionService } from '../../services/session.service';
import { AlertModalComponent } from '../../shared/alert-modal/alert-modal.component';

@Component({
  selector: 'app-room-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertModalComponent],
  providers: [SessionService],
  template: `
    <div class="setup-container">
      <app-alert-modal
        *ngIf="showAlert"
        [message]="alertMessage"
        (close)="onAlertSetupClose()"
      >
      </app-alert-modal>
      <header class="setup-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#6366f1" />
            <path d="M20 12L28 20L20 28L12 20Z" fill="white" />
          </svg>
        </div>

        <h1 class="setup-title">Create game</h1>
      </header>

      <div class="setup-form">
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">Game's name</label>
            <div class="input-wrapper">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="gameName"
                name="gameName"
                placeholder="Digite o nome da sala"
                maxlength="50"
              />
              <button class="input-icon" (click)="generateRandomName()">
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
          </div>

          <div class="form-group">
            <label class="form-label">Voting system</label>
            <div class="select-wrapper">
              <select
                class="form-select"
                [(ngModel)]="selectedVotingSystem"
                name="votingSystem"
              >
                <option value="fibonacci">
                  Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕ )
                </option>
                <option value="modified-fibonacci">
                  Modified Fibonacci ( 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?,
                  ☕ )
                </option>
                <option value="t-shirts">
                  T-shirts (XS, S, M, L, XL, ?, ☕ )
                </option>
                <option value="powers-of-2">
                  Powers of 2 ( 0, 1, 2, 4, 8, 16, 32, 64, ?, ☕ )
                </option>
              </select>
              <svg
                class="select-arrow"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <button
              class="custom-deck-btn"
              (click)="showCustomDeck = !showCustomDeck"
            >
              Create custom deck...
            </button>
          </div>

          <div *ngIf="showCustomDeck" class="custom-deck-section">
            <label class="form-label">Custom cards (separated by commas)</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="customCards"
              name="customCards"
              placeholder="1, 2, 3, 5, 8, 13, ?"
            />
          </div>
        </div>

        <div class="form-actions">
          <button
            class="btn btn-primary create-btn"
            (click)="createGame()"
            [disabled]="!gameName.trim() || isCreating"
          >
            {{ isCreating ? 'Criando...' : 'Create Game' }}
          </button>
        </div>
      </div>

      <!-- Preview das cartas -->
      <div class="cards-preview">
        <h4>Preview das cartas:</h4>
        <div class="preview-cards">
          <div *ngFor="let card of getPreviewCards()" class="preview-card">
            {{ card }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .setup-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: #f8fafc;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }

      .setup-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
        text-align: center;
      }

      .back-btn {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .back-btn:hover {
        color: #f8fafc;
        background: rgba(148, 163, 184, 0.1);
      }

      .setup-title {
        font-size: 1.75rem;
        font-weight: 600;
        margin: 0;
        color: #f8fafc;
      }

      .setup-form {
        width: 100%;
        max-width: 500px;
        background: rgba(51, 65, 85, 0.6);
        border: 1px solid #475569;
        border-radius: 16px;
        padding: 32px;
        backdrop-filter: blur(10px);
        margin-bottom: 32px;
      }

      .form-section {
        margin-bottom: 32px;
      }

      .form-group {
        margin-bottom: 24px;
      }

      .form-label {
        display: block;
        margin-bottom: 8px;
        color: #cbd5e1;
        font-weight: 500;
        font-size: 0.875rem;
      }

      .input-wrapper {
        position: relative;
      }

      .form-input {
        width: 100%;
        padding: 12px 16px;
        padding-right: 48px;
        background: #334155;
        border: 1px solid #475569;
        border-radius: 8px;
        color: #f8fafc;
        font-size: 16px;
        transition: all 0.3s ease;
      }

      .form-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .input-icon {
        position: absolute;
        right: 12px;
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

      .select-wrapper {
        position: relative;
      }

      .form-select {
        width: 100%;
        padding: 12px 16px;
        padding-right: 40px;
        background: #334155;
        border: 1px solid #475569;
        border-radius: 8px;
        color: #f8fafc;
        font-size: 16px;
        cursor: pointer;
        appearance: none;
        transition: all 0.3s ease;
      }

      .form-select:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-select option {
        background: #334155;
        color: #f8fafc;
      }

      .select-arrow {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: #94a3b8;
      }

      .custom-deck-btn {
        background: none;
        border: none;
        color: #6366f1;
        cursor: pointer;
        font-size: 0.875rem;
        margin-top: 8px;
        padding: 4px 0;
        text-decoration: underline;
        transition: color 0.2s ease;
      }

      .custom-deck-btn:hover {
        color: #8b5cf6;
      }

      .custom-deck-section {
        margin-top: 16px;
        padding: 16px;
        background: rgba(15, 23, 42, 0.6);
        border-radius: 8px;
        border: 1px solid #334155;
      }

      .form-actions {
        text-align: center;
      }

      .create-btn {
        padding: 16px 32px;
        font-size: 1rem;
        font-weight: 600;
        min-width: 200px;
      }

      .cards-preview {
        width: 100%;
        max-width: 500px;
        text-align: center;
      }

      .cards-preview h4 {
        margin-bottom: 16px;
        color: #cbd5e1;
        font-size: 1rem;
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
        color: #f8fafc;
      }

      @media (max-width: 768px) {
        .setup-container {
          padding: 20px 16px;
        }

        .setup-form {
          padding: 24px;
        }

        .setup-header {
          margin-bottom: 24px;
        }

        .setup-title {
          font-size: 1.5rem;
        }

        .cards-preview {
          margin-top: 24px;
        }
      }
    `,
  ],
})
export class RoomSetupComponent implements OnInit, OnDestroy {
  gameName: string = '';
  selectedVotingSystem: string = 'fibonacci';
  showCustomDeck: boolean = false;
  customCards: string = '';
  isCreating: boolean = false;
  showAlert = false;
  alertMessage = '';

  private destroy$ = new Subject<void>();
  private gameNames = [
    'Sprint Planning',
    'Backlog Refinement',
    'Story Estimation',
    'Team Planning',
    'Feature Sizing',
    'Epic Breakdown',
    'Release Planning',
    'Scrum Estimation',
  ];

  constructor(
    private router: Router,
    private socketService: SocketService,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      this.router.navigate(['/']);
      return;
    }

    this.socketService.room$
      .pipe(
        filter((room) => room !== null && this.isCreating),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe((room) => {
        localStorage.setItem('currentRoom', JSON.stringify(room));
        localStorage.setItem('userRole', 'moderator');
        localStorage.setItem(
          'gameConfig',
          JSON.stringify({
            name: this.gameName.trim(),
            votingSystem: this.selectedVotingSystem,
            customCards: this.showCustomDeck ? this.customCards : null,
          })
        );
        this.isCreating = false;
        this.router.navigate(['/room', room!.id]);
      });
    this.socketService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          this.isCreating = false;
          this.alertMessage = 'Erro ao criar sala ';
          this.showAlert = true;
        }
      });
  }
  onAlertSetupClose() {
    this.showAlert = false;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  generateRandomName(): void {
    const randomIndex = Math.floor(Math.random() * this.gameNames.length);
    this.gameName = this.gameNames[randomIndex];
  }

  getPreviewCards(): string[] {
    if (this.showCustomDeck && this.customCards.trim()) {
      return this.customCards
        .split(',')
        .map((card) => card.trim())
        .filter((card) => card);
    }

    switch (this.selectedVotingSystem) {
      case 'fibonacci':
        return [
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
      case 'modified-fibonacci':
        return [
          '0',
          '½',
          '1',
          '2',
          '3',
          '5',
          '8',
          '13',
          '20',
          '40',
          '100',
          '?',
          '☕',
        ];
      case 't-shirts':
        return ['XS', 'S', 'M', 'L', 'XL', '?', '☕'];
      case 'powers-of-2':
        return ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'];
      default:
        return [
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
    }
  }

  createGame(): void {
    if (this.gameName.trim()) {
      if (this.isCreating) return;
      this.isCreating = true;
      const moderatorName = localStorage.getItem('userName') || '';
      localStorage.removeItem('currentRoom');
      localStorage.removeItem('gameConfig');

      this.socketService.createRoom(moderatorName, this.gameName.trim());
    }
  }
}
