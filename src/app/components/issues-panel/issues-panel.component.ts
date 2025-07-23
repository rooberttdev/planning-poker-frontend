import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Issue } from '../../interfaces/issue.interface';

@Component({
  selector: 'app-issues-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="issues-panel" [class.open]="isOpen">
      <div class="panel-header">
        <div class="header-content">
          <h3>Issues</h3>
          <span class="issues-count">
            {{ issues.length }} issue{{ issues.length > 1 ? 's' : '' }}
            {{
              getTotalPoints() > 0 ? ' – ' + getTotalPoints() + ' points' : ''
            }}
          </span>
        </div>
        <button class="close-btn" (click)="close.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="panel-content">
        <div class="issues-list">
          <div
            *ngFor="let issue of issues; trackBy: trackByIssue"
            class="issue-card"
          >
            <div class="issue-header">
              <div class="issue-id">{{ issue.id }}</div>
              <button
                class="issue-menu-btn"
                (click)="toggleIssueMenu(issue.id)"
              >
                <!-- three-dots icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="19" cy="12" r="1" fill="currentColor" />
                  <circle cx="5" cy="12" r="1" fill="currentColor" />
                </svg>
              </button>
            </div>

            <div class="issue-title">{{ issue.title }}</div>

            <div class="issue-actions">
              <button
                *ngIf="issue.status === 'pending'"
                class="btn btn-primary btn-sm"
                (click)="startVoting.emit(issue)"
              >
                Start voting
              </button>

              <button
                *ngIf="issue.status === 'voting'"
                class="btn btn-secondary btn-sm"
                disabled
              >
                Voting…
              </button>

              <button
                *ngIf="issue.status === 'completed'"
                class="btn btn-outline btn-sm"
                (click)="voteAgain.emit(issue)"
              >
                Vote again
              </button>

              <div
                *ngIf="issue.status === 'completed' && issue.result != null"
                class="issue-result"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                    fill="currentColor"
                  />
                </svg>
                {{ formatVoteValue(issue.result) }}
              </div>
              <div *ngIf="openMenus.has(issue.id)" class="issue-context-menu">
                <ul>
                  <li
                    (click)="startVoting.emit(issue); toggleIssueMenu(issue.id)"
                  >
                    ▶ Iniciar votação
                  </li>
                  <li
                    *ngIf="issue.status === 'completed'"
                    (click)="voteAgain.emit(issue); toggleIssueMenu(issue.id)"
                  >
                    ↻ Votar novamente
                  </li>
                  <li (click)="toggleIssueMenu(issue.id)">✖ Fechar</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="add-issue-section" [class.expanded]="showAddForm">
            <div *ngIf="!showAddForm" class="add-issue-trigger">
              <button
                class="btn btn-outline add-issue-btn"
                (click)="showAddForm = true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                Start voting
              </button>
            </div>

            <div *ngIf="showAddForm" class="add-issue-form">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="newIssueTitle"
                placeholder="Enter issue title"
                (keyup.enter)="addIssue()"
              />
              <div class="form-actions">
                <button class="btn btn-secondary" (click)="cancelAdd()">
                  Cancel
                </button>
                <button
                  class="btn btn-primary"
                  (click)="addIssue()"
                  [disabled]="!newIssueTitle.trim()"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div
            *ngIf="issues.length > 0 && !showAddForm"
            class="add-another-section"
          >
            <button
              class="btn btn-outline add-another-btn"
              (click)="showAddForm = true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Add another issue
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .issues-panel {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100vh;
        background: #1e293b;
        border-left: 1px solid #334155;
        transition: right 0.3s ease;
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }
      .issues-panel.open {
        right: 0;
      }
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #334155;
        background: #0f172a;
      }
      .header-content h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #f8fafc;
      }
      .issues-count {
        font-size: 0.875rem;
        color: #64748b;
        margin-top: 2px;
      }
      .close-btn {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .close-btn:hover {
        color: #f8fafc;
        background: #334155;
      }
      .panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .issues-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;
      }
      .issue-card {
        position: relative; /* para o menu absoluto */
        background: #334155;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #475569;
        transition: all 0.2s ease;
      }
      .issue-card:hover {
        border-color: #6366f1;
        background: #3f4a5f;
      }
      .issue-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .issue-id {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
        padding: 4px 8px;
        border-radius: 4px;
        font-family: monospace;
      }
      .issue-menu-btn {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .issue-menu-btn:hover {
        color: #f8fafc;
        background: #475569;
      }
      .issue-title {
        font-weight: 500;
        color: #f8fafc;
        margin-bottom: 12px;
        line-height: 1.4;
      }
      .issue-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .btn-sm {
        padding: 6px 12px;
        font-size: 0.875rem;
        border-radius: 6px;
      }
      .issue-result {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        color: #10b981;
        font-size: 0.875rem;
      }
      .issue-context-menu {
        position: absolute;
        top: 32px;
        right: 16px;
        background: #0f172a;
        border: 1px solid #475569;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        z-index: 10;
      }
      .issue-context-menu ul {
        list-style: none;
        margin: 0;
        padding: 8px 0;
      }
      .issue-context-menu li {
        padding: 8px 16px;
        cursor: pointer;
        color: #f8fafc;
        transition: background 0.2s;
      }
      .issue-context-menu li:hover {
        background: rgba(99, 102, 241, 0.1);
      }

      .add-issue-section {
        margin-top: 20px;
      }
      .add-issue-trigger {
        text-align: center;
      }
      .add-issue-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        justify-content: center;
        padding: 12px;
        border: 2px dashed #475569;
        background: transparent;
        color: #94a3b8;
        transition: all 0.2s ease;
      }
      .add-issue-btn:hover {
        border-color: #6366f1;
        color: #6366f1;
        background: rgba(99, 102, 241, 0.05);
      }
      .add-issue-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .form-actions .btn {
        min-width: 80px;
        padding: 8px 16px;
        font-size: 0.875rem;
      }
      .add-another-section {
        margin-top: 16px;
        text-align: center;
      }
      .add-another-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        justify-content: center;
        padding: 10px;
        border: 1px solid #475569;
        background: transparent;
        color: #94a3b8;
        transition: all 0.2s ease;
      }
      .add-another-btn:hover {
        border-color: #6366f1;
        color: #6366f1;
        background: rgba(99, 102, 241, 0.05);
      }

      .panel-content::-webkit-scrollbar {
        width: 6px;
      }
      .panel-content::-webkit-scrollbar-track {
        background: #1e293b;
      }
      .panel-content::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 3px;
      }
      .panel-content::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
    `,
  ],
})
export class IssuesPanelComponent {
  @Input() isOpen = false;
  @Input() issues: Issue[] = [];
  @Input() isModerator = false;
  @Output() close = new EventEmitter<void>();
  @Output() addIssueEvent = new EventEmitter<string>();
  @Output() startVoting = new EventEmitter<Issue>();
  @Output() voteAgain = new EventEmitter<Issue>();

  showAddForm = false;
  newIssueTitle = '';
  openMenus = new Set<string>();

  trackByIssue(_: number, issue: Issue) {
    return issue.id;
  }

  toggleIssueMenu(issueId: string) {
    if (this.openMenus.has(issueId)) {
      this.openMenus.delete(issueId);
    } else {
      this.openMenus.clear();
      this.openMenus.add(issueId);
    }
  }

  addIssue() {
    if (this.newIssueTitle.trim()) {
      this.addIssueEvent.emit(this.newIssueTitle.trim());
      this.newIssueTitle = '';
      this.showAddForm = false;
    }
  }

  cancelAdd() {
    this.newIssueTitle = '';
    this.showAddForm = false;
  }

  getTotalPoints(): number {
    return this.issues
      .filter((i) => i.status === 'completed' && i.result != null)
      .reduce((sum, i) => sum + (i.result || 0), 0);
  }

  formatVoteValue(value: number): string {
    if (value === 999) return '?';
    if (value === 1000) return '☕';
    return value.toString();
  }
}
