import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { Issue } from '../interfaces/issue.interface';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class IssuesService {
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  private currentIssueSubject = new BehaviorSubject<Issue | null>(null);

  constructor(private socketService: SocketService) {
    this.loadIssues();
    this.socketService.syncIssues$.subscribe((all) => {
      this.issuesSubject.next(all);
      const voting = all.find((i) => i.status === 'voting') || null;
      this.currentIssueSubject.next(voting);
      this.saveIssues(all);
    });

    this.socketService.issueUpdates$
      .pipe(filter((u): u is { action: string; issue: Issue } => u !== null))
      .subscribe(({ action, issue }) => {
        this.handleIssueUpdate(action, issue);
      });
  }

  get issues$(): Observable<Issue[]> {
    return this.issuesSubject.asObservable();
  }

  get currentIssue$(): Observable<Issue | null> {
    return this.currentIssueSubject.asObservable();
  }
  loadFromBackend(all: Issue[]): void {
    this.issuesSubject.next(all);
    const voting = all.find((i) => i.status === 'voting') || null;
    this.currentIssueSubject.next(voting);
  }

  addIssue(title: string, description?: string): Issue {
    const issues = this.issuesSubject.value;
    const newIssue: Issue = {
      id: `PP-${issues.length + 1}`,
      title,
      description,
      status: 'pending',
      createdAt: new Date(),
    };

    const updatedIssues = [...issues, newIssue];
    this.issuesSubject.next(updatedIssues);
    this.saveIssues(updatedIssues);

    this.broadcastIssueUpdate('added', newIssue);

    return newIssue;
  }

  startVoting(issue: Issue): void {
    const issues = this.issuesSubject.value;
    const updatedIssues = issues.map((i) => ({
      ...i,
      status:
        i.id === issue.id
          ? ('voting' as const)
          : i.status === 'voting'
          ? ('pending' as const)
          : i.status,
    }));

    this.issuesSubject.next(updatedIssues);
    this.currentIssueSubject.next({ ...issue, status: 'voting' });
    this.saveIssues(updatedIssues);
    this.broadcastIssueUpdate('updated', { ...issue, status: 'voting' });
  }

  completeVoting(
    issueId: string,
    result: number,
    votes: { [participant: string]: number }
  ): void {
    const issues = this.issuesSubject.value;
    const updatedIssues = issues.map((issue) =>
      issue.id === issueId
        ? { ...issue, status: 'completed' as const, result, votes }
        : issue
    );

    this.issuesSubject.next(updatedIssues);
    this.currentIssueSubject.next(null);
    this.saveIssues(updatedIssues);

    const completedIssue = updatedIssues.find((i) => i.id === issueId);
    if (completedIssue) {
      this.broadcastIssueUpdate('completed', completedIssue);
    }
  }

  resetVoting(issue: Issue): void {
    const issues = this.issuesSubject.value;
    const updatedIssues = issues.map((i) =>
      i.id === issue.id
        ? {
            ...i,
            status: 'pending' as const,
            result: undefined,
            votes: undefined,
          }
        : i
    );

    this.issuesSubject.next(updatedIssues);
    this.saveIssues(updatedIssues);

    const resetIssue = updatedIssues.find((i) => i.id === issue.id);
    if (resetIssue) {
      this.broadcastIssueUpdate('reset', resetIssue);
    }
  }

  getCurrentVotingIssue(): Issue | null {
    const issues = this.issuesSubject.value;
    return issues.find((issue) => issue.status === 'voting') || null;
  }

  private loadIssues(): void {
    const roomId = this.getCurrentRoomId();
    if (roomId) {
      const saved = localStorage.getItem(`issues_${roomId}`);
      if (saved) {
        try {
          const issues = JSON.parse(saved);
          this.issuesSubject.next(issues);
          const votingIssue = issues.find(
            (issue: Issue) => issue.status === 'voting'
          );
          if (votingIssue) {
            this.currentIssueSubject.next(votingIssue);
          }
        } catch (error) {
          console.error('Error loading issues:', error);
        }
      }
    }
  }

  private saveIssues(issues: Issue[]): void {
    const roomId = this.getCurrentRoomId();
    if (roomId) {
      localStorage.setItem(`issues_${roomId}`, JSON.stringify(issues));
    }
  }

  private getCurrentRoomId(): string | null {
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      try {
        const room = JSON.parse(currentRoom);
        return room.id;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  clearIssues(): void {
    this.issuesSubject.next([]);
    this.currentIssueSubject.next(null);
    const roomId = this.getCurrentRoomId();
    if (roomId) {
      localStorage.removeItem(`issues_${roomId}`);
    }
  }

  private broadcastIssueUpdate(action: string, issue: Issue): void {
    const roomId = this.getCurrentRoomId();
    if (roomId) {
      this.socketService.emitIssueUpdate(roomId, action, issue);
    }
  }

  handleIssueUpdate(action: string, issue: Issue): void {
    const currentIssues = this.issuesSubject.value;
    let updatedIssues = [...currentIssues];

    switch (action) {
      case 'added':
        if (!updatedIssues.find((i) => i.id === issue.id)) {
          updatedIssues.push(issue);
        }
        break;
      case 'updated':
      case 'completed':
      case 'reset':
        updatedIssues = updatedIssues.map((i) =>
          i.id === issue.id ? issue : i
        );
        if (action === 'updated' && issue.status === 'voting') {
          this.currentIssueSubject.next(issue);
        } else if (action === 'completed') {
          this.currentIssueSubject.next(null);
        }
        break;
    }

    this.issuesSubject.next(updatedIssues);
    this.saveIssues(updatedIssues);
  }
}
