import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voting-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="voting-section">
      <h4 class="voting-title">Escolha seu card</h4>
      <div class="cards-grid">
        <button
          *ngFor="let card of votingCards"
          class="card-button"
          [class.selected]="selectedCard === card.value"
          [disabled]="disabled"
          (click)="selectCard(card.value)"
        >
          <span class="card-value">{{ card.display }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .voting-section {
        margin-top: 40px;
      }

      .voting-title {
        text-align: center;
        margin-bottom: 24px;
        font-size: 1.125rem;
        font-weight: 500;
        color: #f59e0b;
      }

      .cards-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        max-width: 800px;
        margin: 0 auto;
      }

      .card-button {
        width: 60px;
        height: 80px;
        border: 2px solid #475569;
        border-radius: 8px;
        background: rgba(51, 65, 85, 0.6);
        color: #f8fafc;
        font-weight: 600;
        font-size: 1.125rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        backdrop-filter: blur(5px);
      }

      .card-button:hover:not(:disabled) {
        transform: translateY(-4px);
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.2);
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
      }

      .card-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .card-button.selected {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.3);
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
      }

      .card-button.selected::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #6366f1;
        border-radius: 8px;
        animation: pulse 2s infinite;
      }

      .card-value {
        font-size: 1.25rem;
        font-weight: 700;
      }

      /* Special card styles */
      .card-button:nth-child(13) {
        /* ? card */
        background: rgba(139, 92, 246, 0.3);
        border-color: #8b5cf6;
      }

      .card-button:nth-child(14) {
        /* coffee card */
        background: rgba(217, 119, 6, 0.3);
        border-color: #d97706;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @media (max-width: 768px) {
        .cards-grid {
          gap: 8px;
        }

        .card-button {
          width: 50px;
          height: 70px;
          font-size: 1rem;
        }

        .card-value {
          font-size: 1rem;
        }
      }

      @media (max-width: 480px) {
        .cards-grid {
          gap: 6px;
        }

        .card-button {
          width: 45px;
          height: 60px;
          font-size: 0.875rem;
        }

        .card-value {
          font-size: 0.875rem;
        }
      }
    `,
  ],
})
export class VotingCardsComponent {
  @Input() disabled: boolean = false;
  @Input() votingSystem: string = 'fibonacci';
  @Input() customCards: string[] = [];
  @Output() vote = new EventEmitter<number>();

  selectedCard: number | null = null;

  get votingCards() {
    if (this.customCards.length > 0) {
      return this.customCards.map((card, index) => ({
        value: this.parseCardValue(card),
        display: card,
      }));
    }

    switch (this.votingSystem) {
      case 'fibonacci':
        return [
          { value: 0, display: '0' },
          { value: 1, display: '1' },
          { value: 2, display: '2' },
          { value: 3, display: '3' },
          { value: 5, display: '5' },
          { value: 8, display: '8' },
          { value: 13, display: '13' },
          { value: 21, display: '21' },
          { value: 34, display: '34' },
          { value: 55, display: '55' },
          { value: 89, display: '89' },
          { value: 999, display: '?' },
          { value: 1000, display: '☕' },
        ];
      case 'modified-fibonacci':
        return [
          { value: 0, display: '0' },
          { value: 0.5, display: '½' },
          { value: 1, display: '1' },
          { value: 2, display: '2' },
          { value: 3, display: '3' },
          { value: 5, display: '5' },
          { value: 8, display: '8' },
          { value: 13, display: '13' },
          { value: 20, display: '20' },
          { value: 40, display: '40' },
          { value: 100, display: '100' },
          { value: 999, display: '?' },
          { value: 1000, display: '☕' },
        ];
      case 't-shirts':
        return [
          { value: 1, display: 'XS' },
          { value: 2, display: 'S' },
          { value: 3, display: 'M' },
          { value: 5, display: 'L' },
          { value: 8, display: 'XL' },
          { value: 999, display: '?' },
          { value: 1000, display: '☕' },
        ];
      case 'powers-of-2':
        return [
          { value: 0, display: '0' },
          { value: 1, display: '1' },
          { value: 2, display: '2' },
          { value: 4, display: '4' },
          { value: 8, display: '8' },
          { value: 16, display: '16' },
          { value: 32, display: '32' },
          { value: 64, display: '64' },
          { value: 999, display: '?' },
          { value: 1000, display: '☕' },
        ];
      default:
        return [
          { value: 0, display: '0' },
          { value: 1, display: '1' },
          { value: 2, display: '2' },
          { value: 3, display: '3' },
          { value: 5, display: '5' },
          { value: 8, display: '8' },
          { value: 13, display: '13' },
          { value: 21, display: '21' },
          { value: 34, display: '34' },
          { value: 55, display: '55' },
          { value: 89, display: '89' },
          { value: 999, display: '?' },
          { value: 1000, display: '☕' },
        ];
    }
  }

  private parseCardValue(card: string): number {
    if (card === '?') return 999;
    if (card === '☕') return 1000;
    if (card === '½') return 0.5;
    if (card === 'XS') return 1;
    if (card === 'S') return 2;
    if (card === 'M') return 3;
    if (card === 'L') return 5;
    if (card === 'XL') return 8;

    const numValue = parseFloat(card);
    return isNaN(numValue) ? 0 : numValue;
  }

  selectCard(value: number): void {
    if (!this.disabled) {
      this.selectedCard = value;
      this.vote.emit(value);
    }
  }
}
