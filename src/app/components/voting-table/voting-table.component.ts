import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoteResult } from '../../interfaces/room.interface';

@Component({
  selector: 'app-voting-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="voting-table-container">
      <div class="voting-table">
        <div class="participants-row top-row">
          <div
            *ngFor="
              let participant of getTopParticipants();
              trackBy: trackByParticipant
            "
            class="participant-card"
          >
            <div class="participant-name">{{ participant }}</div>
            <div class="card-container">
              <div
                *ngIf="!hasParticipantVoted(participant) && !voteResults.length"
                class="card-placeholder"
              >
                ?
              </div>
              <div
                *ngIf="hasParticipantVoted(participant) && !voteResults.length"
                class="card-back"
              >
                <div class="card-pattern"></div>
              </div>
              <div
                *ngIf="voteResults.length > 0"
                class="card-front"
                [ngClass]="getVoteClass(getParticipantVote(participant))"
              >
                {{ formatVoteValue(getParticipantVote(participant)) }}
              </div>
            </div>
          </div>
        </div>

        <div class="table-center">
          <div class="center-content">
            <!-- Waiting state -->
            <div *ngIf="!currentTask" class="waiting-state">
              <div class="waiting-text">Aguardando nova tarefa</div>
            </div>

            <div
              *ngIf="currentTask && !voteResults.length"
              class="voting-state"
            >
              <div class="voting-message">Votando...</div>
              <div class="voting-progress">
                <div class="progress-text">
                  {{ getActualVoteCount() }} de {{ participantCount }} votos
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="getVotingProgress()"
                  ></div>
                </div>
              </div>
              <button
                *ngIf="isModerator && canRevealVotes()"
                class="reveal-button"
                (click)="revealVotes.emit()"
              >
                Revelar Votos
              </button>
            </div>

            <div *ngIf="voteResults.length > 0" class="results-state">
              <div class="results-title">Resultados</div>
              <div class="results-stats">
                <div class="stat">
                  <span class="stat-label">Média:</span>
                  <span class="stat-value">{{ getAverage() }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Consenso:</span>
                  <span class="stat-value" [ngClass]="getConsensusClass()">{{
                    getConsensus()
                  }}</span>
                </div>
              </div>
              <button
                *ngIf="isModerator"
                class="next-round-button"
                (click)="nextRound.emit()"
              >
                Próxima Rodada
              </button>
            </div>
          </div>
        </div>

        <div class="participants-row bottom-row">
          <div
            *ngFor="
              let participant of getBottomParticipants();
              trackBy: trackByParticipant
            "
            class="participant-card"
          >
            <div class="card-container">
              <div
                *ngIf="!hasParticipantVoted(participant) && !voteResults.length"
                class="card-placeholder"
              >
                ?
              </div>
              <div
                *ngIf="hasParticipantVoted(participant) && !voteResults.length"
                class="card-back"
              >
                <div class="card-pattern"></div>
              </div>
              <div
                *ngIf="voteResults.length > 0"
                class="card-front"
                [ngClass]="getVoteClass(getParticipantVote(participant))"
              >
                {{ formatVoteValue(getParticipantVote(participant)) }}
              </div>
            </div>
            <div class="participant-name">{{ participant }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .voting-table-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        padding: 20px;
      }

      .voting-table {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
        max-width: 800px;
      }

      .participants-row {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
      }

      .participant-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .bottom-row .participant-card {
        flex-direction: column-reverse;
      }

      .participant-name {
        font-size: 14px;
        font-weight: 500;
        color: #cbd5e1;
        text-align: center;
        min-height: 20px;
      }

      .card-container {
        width: 60px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-placeholder {
        width: 100%;
        height: 100%;
        border: 2px dashed #64748b;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        background: rgba(71, 85, 105, 0.1);
        font-size: 24px;
        font-weight: 600;
      }

      .card-back {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        animation: cardFlip 0.3s ease-in-out;
      }

      .card-pattern {
        width: 100%;
        height: 100%;
        background-image: radial-gradient(
            circle at 25% 25%,
            rgba(255, 255, 255, 0.2) 2px,
            transparent 2px
          ),
          radial-gradient(
            circle at 75% 75%,
            rgba(255, 255, 255, 0.2) 2px,
            transparent 2px
          );
        background-size: 10px 10px;
      }

      .card-front {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18px;
        color: white;
        animation: cardReveal 0.6s ease-in-out;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .card-front.low {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .card-front.medium {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .card-front.high {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      .card-front.special {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      }

      .table-center {
        width: 400px;
        height: 200px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
        margin: 20px 0;
      }

      .center-content {
        text-align: center;
        padding: 20px;
        color: white;
      }

      .waiting-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .waiting-icon {
        font-size: 2rem;
      }

      .waiting-text {
        font-size: 16px;
        font-weight: 500;
      }

      .voting-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .voting-message {
        font-size: 18px;
        font-weight: 600;
      }

      .voting-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .progress-text {
        font-size: 14px;
        opacity: 0.9;
      }

      .progress-bar {
        width: 200px;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        transition: width 0.3s ease;
      }

      .reveal-button,
      .next-round-button {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .reveal-button:hover,
      .next-round-button:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }

      .results-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .results-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .results-stats {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;
      }

      .stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.9;
      }

      .stat-value {
        font-weight: 600;
      }

      .consensus-good {
        color: #10b981;
      }
      .consensus-poor {
        color: #f59e0b;
      }
      .consensus-bad {
        color: #ef4444;
      }

      @keyframes cardFlip {
        0% {
          transform: rotateY(0deg);
        }
        50% {
          transform: rotateY(90deg);
        }
        100% {
          transform: rotateY(0deg);
        }
      }

      @keyframes cardReveal {
        0% {
          transform: rotateY(180deg) scale(0.8);
          opacity: 0;
        }
        50% {
          transform: rotateY(90deg) scale(0.9);
        }
        100% {
          transform: rotateY(0deg) scale(1);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .table-center {
          width: 300px;
          height: 160px;
        }

        .card-container {
          width: 45px;
          height: 60px;
        }

        .card-front {
          font-size: 14px;
        }

        .participants-row {
          gap: 12px;
        }

        .participant-name {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class VotingTableComponent {
  @Input() participants: string[] = [];
  @Input() currentTask: any = null;
  @Input() voteCount: number = 0;
  @Input() participantCount: number = 0;
  @Input() voteResults: VoteResult[] = [];
  @Input() isModerator: boolean = false;
  @Input() userName: string = '';
  @Input() participantVotes: Map<
    string,
    { hasVoted: boolean; value?: number }
  > = new Map();

  @Output() revealVotes = new EventEmitter<void>();
  @Output() nextRound = new EventEmitter<void>();

  trackByParticipant(index: number, participant: string): string {
    return participant;
  }

  getTopParticipants(): string[] {
    const half = Math.ceil(this.participants.length / 2);
    return this.participants.slice(0, half);
  }

  getBottomParticipants(): string[] {
    const half = Math.ceil(this.participants.length / 2);
    return this.participants.slice(half);
  }

  hasParticipantVoted(participant: string): boolean {
    const voteInfo = this.participantVotes.get(participant);
    return voteInfo ? voteInfo.hasVoted : false;
  }

  getParticipantVote(participantName: string): number {
    const result = this.voteResults.find(
      (r) => r.participant === participantName
    );
    return result ? result.value : 0;
  }

  getVoteClass(value: number): string {
    if (value <= 3) return 'low';
    if (value <= 8) return 'medium';
    if (value <= 21) return 'high';
    return 'special';
  }

  formatVoteValue(value: number): string {
    if (value === 999) return '?';
    if (value === 1000) return '☕';
    return value.toString();
  }

  getTotalParticipants(): number {
    return this.participantCount;
  }

  getActualVoteCount(): number {
    let count = 0;
    this.participantVotes.forEach((vote) => {
      if (vote.hasVoted) count++;
    });
    return count;
  }

  getVotingProgress(): number {
    const total = this.getTotalParticipants();
    const voted = this.getActualVoteCount();
    return total > 0 ? (voted / total) * 100 : 0;
  }
  canRevealVotes(): boolean {
    const voted = this.getActualVoteCount();
    const total = this.getTotalParticipants();
    return voted > 0 && voted === total;
  }

  getAverage(): string {
    if (!this.voteResults.length) return '0';
    const validVotes = this.voteResults.filter((r) => r.value < 900);
    if (!validVotes.length) return 'N/A';
    const avg =
      validVotes.reduce((sum, r) => sum + r.value, 0) / validVotes.length;
    return avg.toFixed(1);
  }

  getConsensus(): string {
    if (!this.voteResults.length) return 'N/A';
    const validVotes = this.voteResults
      .filter((r) => r.value < 900)
      .map((r) => r.value);
    if (validVotes.length < 2) return 'N/A';

    const unique = [...new Set(validVotes)];
    if (unique.length === 1) return 'Perfeito';

    const max = Math.max(...validVotes);
    const min = Math.min(...validVotes);
    const ratio = max / min;

    if (ratio <= 2) return 'Bom';
    if (ratio <= 4) return 'Regular';
    return 'Ruim';
  }

  getConsensusClass(): string {
    const consensus = this.getConsensus();
    if (consensus === 'Perfeito' || consensus === 'Bom')
      return 'consensus-good';
    if (consensus === 'Regular') return 'consensus-poor';
    return 'consensus-bad';
  }
}
