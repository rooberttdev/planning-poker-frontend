import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InviteModalComponent } from '../invite-modal/invite-modal.component';
import { IssuesPanelComponent } from '../issues-panel/issues-panel.component';
import { VoteResult } from '../../interfaces/room.interface';
import { Issue } from '../../interfaces/issue.interface';
import { IssuesService } from '../../services/issues.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { VotingCardsComponent } from '../voting-cards/voting-cards.component';
import { VotingTableComponent } from '../voting-table/voting-table.component';
import { SocketService } from '../../services/socket.service';
import { SessionService } from '../../services/session.service';
import { AlertModalComponent } from '../../shared/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VotingCardsComponent,
    VotingTableComponent,
    InviteModalComponent,
    IssuesPanelComponent,
    AlertModalComponent,
    ConfirmModalComponent,
  ],
  template: `
    <div class="room-container">
      <app-alert-modal
        *ngIf="showAlert"
        [message]="alertMessage"
        (close)="onAlertClose()"
      >
      </app-alert-modal>
      <app-confirm-modal
        *ngIf="showConfirm"
        [message]="confirmMessage"
        (accept)="onConfirmAccept()"
        (cancel)="onConfirmCancel()"
      >
      </app-confirm-modal>
      <header class="room-header">
        <div class="header-left">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#6366f1" />
              <path d="M20 12L28 20L20 28L12 20Z" fill="white" />
            </svg>
          </div>
          <div class="room-info">
            <h1 class="room-title">{{ roomTitle }}</h1>
            <div class="room-id">{{ roomId }}</div>
          </div>
        </div>

        <div class="header-right">
          <div class="user-menu">
            <div class="user-avatar">
              {{ userName.charAt(0).toUpperCase() }}
            </div>
            <span class="user-name">{{ userName }}</span>
          </div>

          <div class="header-buttons">
            <button
              class="btn btn-outline header-btn"
              (click)="showInviteModal = true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21M12.5 7.5C12.5 10.5376 10.0376 13 7 13C3.96243 13 1.5 10.5376 1.5 7.5C1.5 4.46243 3.96243 2 7 2C10.0376 2 12.5 4.46243 12.5 7.5ZM20 8V14M23 11H17"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Convidar
            </button>

            <button
              class="btn btn-outline header-btn"
              (click)="showIssuesPanel = true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Issues
              <span *ngIf="issues.length > 0" class="issues-badge">{{
                issues.length
              }}</span>
            </button>

            <button
              *ngIf="isModerator"
              class="btn btn-danger header-btn"
              (click)="endRoom()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Encerrar
            </button>

            <button
              *ngIf="!isModerator"
              class="btn btn-secondary header-btn"
              (click)="leaveRoom()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>
      <main class="room-main">
        <!-- Current Task Display -->
        <div *ngIf="currentTask" class="task-display">
          <div class="task-card">
            <div *ngIf="currentIssue" class="issue-info">
              <span class="issue-id">{{ currentIssue.id }}</span>
              <div class="voting-indicator">
                <span class="voting-text"
                  >Voting {{ getCurrentVotingIndex() }}/{{
                    getTotalIssues()
                  }}</span
                >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h2 class="task-title">
              {{ currentIssue?.title || currentTask.title }}
            </h2>
            <p
              *ngIf="currentIssue?.description || currentTask.description"
              class="task-description"
            >
              {{ currentIssue?.description || currentTask.description }}
            </p>
          </div>
        </div>

        <app-voting-table
          [participants]="allParticipants"
          [currentTask]="currentTask"
          [voteCount]="getActualVoteCount()"
          [participantCount]="getTotalParticipants()"
          [voteResults]="voteResults"
          [isModerator]="isModerator"
          [userName]="userName"
          [participantVotes]="participantVotes"
          (revealVotes)="revealVotes()"
          (nextRound)="nextRound()"
        ></app-voting-table>

        <app-voting-cards
          [votingSystem]="gameConfig?.votingSystem || 'fibonacci'"
          [customCards]="getCustomCards()"
          [disabled]="!currentTask || hasUserVoted || voteResults.length > 0"
          (vote)="onVote($event)"
        ></app-voting-cards>
      </main>

      <app-invite-modal
        *ngIf="showInviteModal"
        [roomId]="roomId"
        (close)="showInviteModal = false"
      ></app-invite-modal>

      <app-issues-panel
        [isOpen]="showIssuesPanel"
        [issues]="issues"
        [isModerator]="isModerator"
        (close)="showIssuesPanel = false"
        (addIssueEvent)="onAddIssue($event)"
        (startVoting)="onStartVotingIssue($event)"
        (voteAgain)="onVoteAgain($event)"
      ></app-issues-panel>
    </div>
  `,
  styles: [
    `
      .room-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: #f8fafc;
      }

      .room-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid #334155;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .header-buttons {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-btn {
        min-width: 100px;
        padding: 8px 16px;
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
      }

      .btn-danger {
        background: #dc2626;
        color: white;
        border: 1px solid #dc2626;
      }

      .btn-danger:hover {
        background: #b91c1c;
        border-color: #b91c1c;
      }

      .room-info {
        display: flex;
        flex-direction: column;
      }

      .room-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
      }

      .room-id {
        font-size: 0.875rem;
        color: #64748b;
        font-family: monospace;
      }

      .user-menu {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .issues-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
        padding: 8px 16px;
      }

      .issues-badge {
        background: #ef4444;
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #6366f1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }

      .user-name {
        font-weight: 500;
      }

      .back-btn {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: all 0.2s ease;
        margin-right: 12px;
      }

      .back-btn:hover {
        color: #f8fafc;
        background: rgba(148, 163, 184, 0.1);
        transform: translateX(-2px);
      }

      .back-btn:active {
        transform: translateX(-1px);
      }

      .room-main {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .task-display {
        margin-bottom: 32px;
      }

      .task-card {
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid #6366f1;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        position: relative;
      }

      .issue-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .issue-id {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6366f1;
        background: rgba(99, 102, 241, 0.2);
        padding: 4px 12px;
        border-radius: 6px;
        font-family: monospace;
      }

      .voting-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f59e0b;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .voting-text {
        animation: pulse 2s infinite;
      }

      .task-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .task-description {
        color: #cbd5e1;
        font-size: 1rem;
      }

      .voting-status {
        margin-bottom: 32px;
      }

      .empty-state {
        text-align: center;
        padding: 48px 24px;
      }

      .empty-icon {
        font-size: 3rem;
        margin-bottom: 16px;
      }

      .empty-state h3 {
        font-size: 1.25rem;
        margin-bottom: 8px;
        color: #f8fafc;
      }

      .empty-state p {
        color: #94a3b8;
      }

      .voting-info {
        text-align: center;
        padding: 24px;
      }

      .voting-info h3 {
        margin-bottom: 8px;
      }

      .voting-progress {
        margin: 24px 0;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: #334155;
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: #6366f1;
        transition: width 0.3s ease;
      }

      .reveal-btn {
        margin-top: 16px;
      }

      .vote-results {
        background: rgba(51, 65, 85, 0.3);
        border-radius: 12px;
        padding: 24px;
      }

      .vote-results h3 {
        text-align: center;
        margin-bottom: 24px;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .result-item {
        background: rgba(30, 41, 59, 0.6);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
      }

      .participant-name {
        flex: 1;
      }

      .moderator-badge {
        background: #6366f1;
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        margin-left: 8px;
      }

      .vote-value {
        font-size: 1.5rem;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 6px;
        display: inline-block;
      }

      .vote-value.low {
        background: #065f46;
        color: #6ee7b7;
      }
      .vote-value.medium {
        background: #92400e;
        color: #fbbf24;
      }
      .vote-value.high {
        background: #7c2d12;
        color: #fb7185;
      }
      .vote-value.special {
        background: #581c87;
        color: #c084fc;
      }

      .results-stats {
        display: flex;
        justify-content: space-around;
        padding: 16px;
        background: rgba(15, 23, 42, 0.6);
        border-radius: 8px;
        margin-bottom: 24px;
      }

      .stat-item {
        text-align: center;
      }

      .stat-item label {
        display: block;
        font-size: 0.875rem;
        color: #94a3b8;
        margin-bottom: 4px;
      }

      .stat-item span {
        font-weight: 600;
        font-size: 1.125rem;
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

      .voting-table-section {
        margin-bottom: 40px;
      }

      .voting-table-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 500px;
        padding: 40px 20px;
      }

      .voting-table {
        position: relative;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          rgba(51, 65, 85, 0.3) 0%,
          rgba(30, 41, 59, 0.3) 100%
        );
        border: 3px solid rgba(99, 102, 241, 0.2);
        box-shadow: 0 0 50px rgba(99, 102, 241, 0.1);
      }

      .participant-seat {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform-origin: 300px 300px;
      }

      .participant-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 18px;
        color: #f8fafc;
        border: 3px solid transparent;
        transition: all 0.3s ease;
        margin-bottom: 8px;
      }

      .participant-avatar.has-voted {
        border-color: #10b981;
        background: #065f46;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
      }

      .participant-name {
        font-weight: 500;
        color: #f8fafc;
        margin-bottom: 12px;
        text-align: center;
        font-size: 14px;
      }

      .participant-card {
        width: 50px;
        height: 70px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.5s ease;
        position: relative;
        cursor: pointer;
      }

      .card-placeholder {
        width: 100%;
        height: 100%;
        border: 2px dashed #475569;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        background: rgba(71, 85, 105, 0.1);
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
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 280px;
        height: 280px;
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.8);
        border: 2px solid rgba(99, 102, 241, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
      }

      .center-content {
        text-align: center;
        padding: 20px;
      }

      .waiting-icon {
        font-size: 3rem;
        margin-bottom: 16px;
      }

      .waiting-text {
        color: #94a3b8;
        font-size: 16px;
        margin-bottom: 16px;
      }

      .start-voting-btn {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .start-voting-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }

      .voting-message {
        font-size: 20px;
        font-weight: 600;
        color: #6366f1;
        margin-bottom: 20px;
      }

      .voting-progress {
        margin-bottom: 20px;
      }

      .progress-text {
        color: #cbd5e1;
        font-size: 14px;
        margin-bottom: 12px;
      }

      .progress-bar {
        width: 200px;
        height: 6px;
        background: #334155;
        border-radius: 3px;
        overflow: hidden;
        margin: 0 auto;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        transition: width 0.3s ease;
      }

      .reveal-button,
      .next-round-button {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      }

      .reveal-button:hover,
      .next-round-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }

      .results-title {
        font-size: 18px;
        font-weight: 600;
        color: #f8fafc;
        margin-bottom: 16px;
      }

      .results-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 20px;
      }

      .stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-label {
        color: #94a3b8;
        font-size: 14px;
      }

      .stat-value {
        font-weight: 600;
        color: #f8fafc;
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

      .voting-cards-section {
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
        .voting-table {
          width: 400px;
          height: 400px;
        }

        .participant-seat {
          transform-origin: 200px 200px;
        }

        .table-center {
          width: 200px;
          height: 200px;
        }

        .participant-avatar {
          width: 45px;
          height: 45px;
          font-size: 14px;
        }

        .participant-card {
          width: 35px;
          height: 50px;
        }

        .voting-message {
          font-size: 16px;
        }

        .progress-bar {
          width: 150px;
        }

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

      .moderator-actions {
        text-align: center;
      }

      .participants-section {
        margin-bottom: 32px;
      }

      .participants-section h4 {
        margin-bottom: 16px;
        color: #cbd5e1;
      }

      .participants-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }

      .participant-item {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(51, 65, 85, 0.3);
        padding: 12px 16px;
        border-radius: 8px;
      }

      .participant-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }

      .participant-status {
        margin-left: auto;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #374151;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
      }

      .participant-status.has-voted {
        background: #065f46;
        color: #10b981;
      }

      @media (max-width: 768px) {
        .room-header {
          flex-direction: row;
          padding: 16px;
        }

        .header-left {
          flex: 1;
        }

        .issues-btn {
          order: -1;
        }

        .room-main {
          padding: 16px;
        }

        .results-grid {
          grid-template-columns: 1fr;
        }

        .results-stats {
          flex-direction: column;
          gap: 12px;
        }
      }
    `,
  ],
})
export class RoomComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private updateParticipants(list: string[]) {
    const all = new Set<string>([
      ...list,
      this.userName,
      this.getCurrentModerator(),
    ]);
    const arr = Array.from(all);
    this.allParticipants = arr;
    this.participants = arr;
    this.participantCount = arr.length;
    this.initializeVoteTracking(arr);
  }
  public participantVotes: Map<string, { hasVoted: boolean; value?: number }> =
    new Map();

  roomId: string = '';
  roomTitle: string = '';
  userName: string = '';
  isModerator: boolean = false;
  participants: string[] = [];
  participantCount: number = 0;
  currentTask: any = null;
  voteCount: number = 0;
  voteResults: VoteResult[] = [];
  hasUserVoted: boolean = false;

  allParticipants: string[] = [];
  gameConfig: any = null;
  issues: Issue[] = [];
  currentIssue: Issue | null = null;
  showInviteModal: boolean = false;
  showTaskModal: boolean = false;
  showIssuesPanel: boolean = false;
  selectedCard: number | null = null;
  showAlert = false;
  alertMessage = '';
  shouldRedirectHome = false;
  showConfirm = false;
  confirmMessage = '';

  private onConfirmAction: () => void = () => {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private issuesService: IssuesService,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.params['id'];
    this.userName = localStorage.getItem('userName') || '';
    this.isModerator = localStorage.getItem('userRole') === 'moderator';

    this.socketService.getRoomInfo(this.roomId);

    const savedConfig = localStorage.getItem('gameConfig');
    if (savedConfig) {
      try {
        this.gameConfig = JSON.parse(savedConfig);
        this.roomTitle =
          this.gameConfig.name || `Sala ${this.roomId.substring(0, 8)}...`;
      } catch (error) {
        this.roomTitle = `Sala ${this.roomId.substring(0, 8)}...`;
      }
    } else {
      this.roomTitle = `Sala ${this.roomId.substring(0, 8)}...`;
    }

    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      try {
        const room = JSON.parse(currentRoom);
        if (room.id !== this.roomId) {
          room.id = this.roomId;
          localStorage.setItem('currentRoom', JSON.stringify(room));
        }
      } catch (error) {
        console.error('Erro ao verificar sala no localStorage:', error);
      }
    }
    this.socketService.error$.subscribe((error) => {
      if (
        error &&
        (error.includes('não encontrada') ||
          error.includes('Sala não encontrada'))
      ) {
        this.session.clearSession();
        this.alertMessage =
          'Esta sala não existe mais. Você será redirecionado para a página inicial.';
        this.shouldRedirectHome = true;
        this.showAlert = true;
      }
    });

    this.socketService.roomEnded$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        this.session.clearSession();
        this.issuesService.clearIssues();
        this.alertMessage = 'A sala foi encerrada pelo moderador.';
        this.shouldRedirectHome = true;
        this.showAlert = true;
      });

    if (!this.userName) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.setupSubscriptions();

    this.socketService.roomInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe((roomInfo) => {
        if (roomInfo && roomInfo.roomId === this.roomId) {
          this.roomTitle =
            roomInfo.name || `Sala ${this.roomId.substring(0, 8)}...`;

          const currentRoom = localStorage.getItem('currentRoom');
          if (currentRoom && roomInfo.moderator) {
            try {
              const room = JSON.parse(currentRoom);
              room.moderator = roomInfo.moderator;
              localStorage.setItem('currentRoom', JSON.stringify(room));
            } catch (error) {
              console.warn(
                'Erro ao atualizar moderador no localStorage:',
                error
              );
            }
          }
        }
      });
    this.issuesService.issues$
      .pipe(takeUntil(this.destroy$))
      .subscribe((issues: Issue[]) => {
        this.issues = issues;
      });

    this.issuesService.currentIssue$
      .pipe(takeUntil(this.destroy$))
      .subscribe((issue: Issue | null) => {});

    this.socketService.socket.on('issueUpdate', (data: any) => {
      this.issuesService.handleIssueUpdate(data.action, data.issue);
    });
    this.socketService.participantVoted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => this.participantVotes.set(p, { hasVoted: true }));

    this.socketService.participants$
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => this.updateParticipants(list));

    this.socketService.syncIssues$
      .pipe(takeUntil(this.destroy$))
      .subscribe((all) => this.issuesService.loadFromBackend(all));
    this.socketService.joinRoom(this.roomId, this.userName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    this.socketService.participants$
      .pipe(takeUntil(this.destroy$))
      .subscribe((participants) => {
        const allParticipantsSet = new Set<string>();

        participants.forEach((p) => allParticipantsSet.add(p));

        allParticipantsSet.add(this.userName);

        const moderator = this.getCurrentModerator();
        if (moderator) {
          allParticipantsSet.add(moderator);
        }

        const currentRoom = localStorage.getItem('currentRoom');
        if (currentRoom) {
          try {
            const room = JSON.parse(currentRoom);
            if (room.moderator) {
              allParticipantsSet.add(room.moderator);
            }
          } catch (error) {
            console.warn('Erro ao ler moderador do localStorage:', error);
          }
        }

        const allParticipants = Array.from(allParticipantsSet);

        this.allParticipants = allParticipants;
        this.participants = allParticipants;
        this.participantCount = allParticipants.length;

        this.initializeVoteTracking(allParticipants);
      });

    this.socketService.currentTask$
      .pipe(takeUntil(this.destroy$))
      .subscribe((task) => {
        this.currentTask = task;
        this.hasUserVoted = false;
        this.voteResults = [];
        this.selectedCard = null;
        this.resetVoteTracking();
      });

    this.socketService.voteCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.voteCount = count;
      });

    this.socketService.voteResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.voteResults = results;
        results.forEach((result) => {
          this.participantVotes.set(result.participant, {
            hasVoted: true,
            value: result.value,
          });
        });

        if (results.length > 0 && this.currentIssue) {
          const average = this.calculateAverage(results);
          const votes: { [participant: string]: number } = {};
          results.forEach((result) => {
            votes[result.participant] = result.value;
          });

          this.issuesService.completeVoting(
            this.currentIssue.id,
            Math.round(average),
            votes
          );
        }
      });

    this.socketService.socket.on(
      'participantVoted',
      (data: { participant: string }) => {
        this.participantVotes.set(data.participant, { hasVoted: true });
      }
    );
  }

  private initializeVoteTracking(participants: string[]): void {
    participants.forEach((participant) => {
      if (!this.participantVotes.has(participant)) {
        this.participantVotes.set(participant, { hasVoted: false });
      }
    });
  }

  private resetVoteTracking(): void {
    this.participantVotes.forEach((_, participant) => {
      this.participantVotes.set(participant, { hasVoted: false });
    });
  }
  onAlertClose() {
    this.showAlert = false;
    if (this.shouldRedirectHome) {
      this.router.navigateByUrl('/home');
    }
  }
  onConfirmAccept() {
    this.showConfirm = false;
    this.onConfirmAction();
  }

  onConfirmCancel() {
    this.showConfirm = false;
  }
  getTotalParticipants(): number {
    return this.participantCount;
  }
  getVotingProgress(): number {
    const total = this.participantCount;
    const voted = this.getActualVoteCount();
    return total > 0 ? (voted / total) * 100 : 0;
  }
  canRevealVotes(): boolean {
    const voted = this.getActualVoteCount();
    const total = this.participantCount;
    return voted > 0 && voted === total;
  }
  getActualVoteCount(): number {
    let count = 0;
    this.participantVotes.forEach((vote) => {
      if (vote.hasVoted) count++;
    });
    return count;
  }

  hasParticipantVoted(participant: string): boolean {
    const voteInfo = this.participantVotes.get(participant);
    return voteInfo ? voteInfo.hasVoted : false;
  }

  onAddIssue(title: string): void {
    this.issuesService.addIssue(title);
  }

  onStartVotingIssue(issue: Issue): void {
    this.issuesService.startVoting(issue);
    this.socketService.startRound(this.roomId, issue.title, issue.description);
  }

  onVoteAgain(issue: Issue): void {
    this.issuesService.resetVoting(issue);
    this.issuesService.startVoting(issue);
    this.socketService.startRound(this.roomId, issue.title, issue.description);
  }

  getCurrentVotingIndex(): number {
    if (!this.currentIssue) return 0;
    return (
      this.issues.findIndex((issue) => issue.id === this.currentIssue!.id) + 1
    );
  }

  getTotalIssues(): number {
    return this.issues.length;
  }

  private calculateAverage(results: VoteResult[]): number {
    const validVotes = results.filter((r) => r.value < 900);
    if (!validVotes.length) return 0;
    return validVotes.reduce((sum, r) => sum + r.value, 0) / validVotes.length;
  }

  onTaskSubmit(taskData: { title: string; description?: string }): void {
    this.socketService.startRound(
      this.roomId,
      taskData.title,
      taskData.description
    );
    this.showTaskModal = false;
  }

  onVote(value: number): void {
    this.socketService.vote(this.roomId, this.userName, value);
    this.hasUserVoted = true;
    this.participantVotes.set(this.userName, { hasVoted: true, value });
  }

  selectCard(value: number): void {
    if (
      this.currentTask &&
      !this.hasUserVoted &&
      this.voteResults.length === 0
    ) {
      this.selectedCard = value;
      this.onVote(value);
    }
  }

  get votingCards() {
    if (this.getCustomCards().length > 0) {
      return this.getCustomCards().map((card, index) => ({
        value: this.parseCardValue(card),
        display: card,
      }));
    }

    const votingSystem = this.gameConfig?.votingSystem || 'fibonacci';
    switch (votingSystem) {
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

  get tableParticipants() {
    const allParticipants = [...this.participants];
    if (!allParticipants.includes(this.userName)) {
      allParticipants.push(this.userName);
    }

    return allParticipants;
  }

  getParticipantPosition(index: number): string {
    const totalParticipants = this.tableParticipants.length;
    const angle = (360 / totalParticipants) * index - 90;
    const radius = 220;

    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;

    return `translate(${x}px, ${y}px)`;
  }

  getParticipantVote(participantName: string): number {
    const result = this.voteResults.find(
      (r) => r.participant === participantName
    );
    return result ? result.value : 0;
  }

  revealVotes(): void {
    this.socketService.revealVotes(this.roomId);
  }

  nextRound(): void {
    this.socketService.nextRound(this.roomId);
  }

  onTimeUp(): void {
    if (this.isModerator && this.getActualVoteCount() > 0) {
      this.revealVotes();
    }
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

  getAverage(): string {
    if (!this.voteResults.length) return '0';
    const validVotes = this.voteResults.filter((r) => r.value < 900);
    if (!validVotes.length) return 'N/A';
    const avg =
      validVotes.reduce((sum, r) => sum + r.value, 0) / validVotes.length;
    return avg.toFixed(1);
  }

  getMedian(): string {
    if (!this.voteResults.length) return '0';
    const validVotes = this.voteResults
      .filter((r) => r.value < 900)
      .map((r) => r.value);
    if (!validVotes.length) return 'N/A';
    validVotes.sort((a, b) => a - b);
    const mid = Math.floor(validVotes.length / 2);
    const median =
      validVotes.length % 2 === 0
        ? (validVotes[mid - 1] + validVotes[mid]) / 2
        : validVotes[mid];
    return median.toString();
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

  getCustomCards(): string[] {
    if (this.gameConfig?.customCards) {
      return this.gameConfig.customCards
        .split(',')
        .map((card: string) => card.trim())
        .filter((card: string) => card);
    }
    return [];
  }

  getCurrentModerator(): string {
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      try {
        const room = JSON.parse(currentRoom);
        return room.moderator;
      } catch (error) {
        return '';
      }
    }
    return '';
  }

  endRoom(): void {
    this.confirmMessage =
      'Tem certeza que deseja encerrar esta sala? Todos os participantes serão desconectados.';
    this.onConfirmAction = () => {
      this.socketService.endRoom(this.roomId);
      this.session.clearSession();
      this.issuesService.clearIssues();
      this.router.navigateByUrl('/home');
    };
    this.showConfirm = true;
  }

  leaveRoom(): void {
    this.confirmMessage = 'Tem certeza que deseja sair da sala?';
    this.onConfirmAction = () => {
      this.socketService.leaveRoom(this.roomId, this.userName);
      this.session.clearSession();
      this.issuesService.clearIssues();
      this.router.navigateByUrl('/home');
    };
    this.showConfirm = true;
  }
}
