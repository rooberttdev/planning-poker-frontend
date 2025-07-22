import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Room, VoteResult } from '../interfaces/room.interface';
import { Issue } from '../interfaces/issue.interface';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private _socket: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private roomSubject = new BehaviorSubject<Room | null>(null);
  private participantsSubject = new BehaviorSubject<string[]>([]);
  private currentTaskSubject = new BehaviorSubject<any>(null);
  private voteCountSubject = new BehaviorSubject<number>(0);
  private voteResultsSubject = new BehaviorSubject<VoteResult[]>([]);
  private roomInfoSubject = new BehaviorSubject<any>(null);
  private roomEndedSubject = new BehaviorSubject<boolean>(false);
  private issueUpdatesSubject = new BehaviorSubject<{
    action: string;
    issue: any;
  } | null>(null);
  private syncIssuesSubject = new BehaviorSubject<Issue[] | null>(null);
  private participantVotedSubject = new Subject<string>();

  constructor() {
    this._socket = io(environment.apiUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this._socket.on('connect', () => {
      this.connectedSubject.next(true);
    });

    this._socket.on('disconnect', () => {
      this.connectedSubject.next(false);
    });

    this._socket.on('error', (error: string) => {
      this.errorSubject.next(error);
      if (error && error.includes('não encontrada')) {
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('gameConfig');
      }
    });

    this._socket.on('roomCreated', (room: Room) => {
      this.roomSubject.next(room);
    });

    this._socket.on('participantJoined', (participants: string[]) => {
      this.participantsSubject.next(participants);
      const currentRoom = localStorage.getItem('currentRoom');
      if (currentRoom) {
        try {
          const room = JSON.parse(currentRoom);
          room.participants = participants;
          localStorage.setItem('currentRoom', JSON.stringify(room));
        } catch (error) {
          console.error('Error updating room participants:', error);
        }
      }
    });

    this._socket.on('roomInfo', (roomInfo: any) => {
      this.roomInfoSubject.next(roomInfo);
      if (Array.isArray(roomInfo.participants)) {
        this.participantsSubject.next(roomInfo.participants);
      }
    });

    this._socket.on('roundStarted', (task: any) => {
      this.currentTaskSubject.next(task);
      this.voteCountSubject.next(0);
      this.voteResultsSubject.next([]);
    });

    this._socket.on(
      'voteReceived',
      (data: { count: number; participant?: string }) => {
        this.voteCountSubject.next(data.count);
      }
    );
    this._socket.on(
      'issueUpdate',
      (payload: { action: string; issue: any }) => {
        this.issueUpdatesSubject.next(payload);
      }
    );
    this._socket.on('participantVoted', (data: { participant: string }) => {
      this.participantVotedSubject.next(data.participant);
    });
    this._socket.on('votesRevealed', (results: [string, number][]) => {
      const voteResults: VoteResult[] = results.map(([participant, value]) => ({
        participant,
        value,
      }));
      this.voteResultsSubject.next(voteResults);
    });

    this._socket.on('roundReset', () => {
      this.currentTaskSubject.next(null);
      this.voteCountSubject.next(0);
      this.voteResultsSubject.next([]);
    });

    this._socket.on('roomEnded', () => {
      this.roomEndedSubject.next(true);
    });
    this._socket.on('syncIssues', (allIssues: Issue[]) => {
      this.syncIssuesSubject.next(allIssues);
    });
  }
  get participantVoted$(): Observable<string> {
    return this.participantVotedSubject.asObservable();
  }
  get syncIssues$(): Observable<Issue[]> {
    return this.syncIssuesSubject
      .asObservable()
      .pipe(filter((v): v is Issue[] => v !== null));
  }
  get issueUpdates$(): Observable<{ action: string; issue: any } | null> {
    return this.issueUpdatesSubject.asObservable();
  }

  get connected$(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }

  get error$(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  get room$(): Observable<Room | null> {
    return this.roomSubject.asObservable();
  }

  get participants$(): Observable<string[]> {
    return this.participantsSubject.asObservable();
  }

  get currentTask$(): Observable<any> {
    return this.currentTaskSubject.asObservable();
  }

  get voteCount$(): Observable<number> {
    return this.voteCountSubject.asObservable();
  }

  get voteResults$(): Observable<VoteResult[]> {
    return this.voteResultsSubject.asObservable();
  }

  get roomInfo$(): Observable<any> {
    return this.roomInfoSubject.asObservable();
  }

  get roomEnded$(): Observable<boolean> {
    return this.roomEndedSubject.asObservable();
  }

  get socket(): Socket {
    return this._socket;
  }

  createRoom(moderator: string, roomName?: string): void {
    this._socket.emit('createRoom', { moderator, roomName });
  }

  joinRoom(roomId: string, participant: string): void {
    this._socket.emit('joinRoom', { roomId, participant });
  }

  getRoomInfo(roomId: string): void {
    this._socket.emit('getRoomInfo', { roomId });
  }

  startRound(roomId: string, title: string, description?: string): void {
    this._socket.emit('startRound', { roomId, title, description });
  }

  vote(roomId: string, participant: string, value: number): void {
    this._socket.emit('vote', { roomId, participant, value });
  }

  revealVotes(roomId: string): void {
    this._socket.emit('revealVotes', { roomId });
  }

  nextRound(roomId: string): void {
    this._socket.emit('nextRound', { roomId });
  }

  endRoom(roomId: string): void {
    this._socket.emit('endRoom', { roomId });
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  leaveRoom(roomId: string, participant: string): void {
    this._socket.emit('leaveRoom', { roomId, participant });
    this.roomSubject.next(null);
    this.participantsSubject.next([]);
    this.currentTaskSubject.next(null);
    this.voteCountSubject.next(0);
    this.voteResultsSubject.next([]);
    this.roomInfoSubject.next(null);
  }

  emitIssueUpdate(roomId: string, action: string, issue: any): void {
    this._socket.emit('issueUpdate', { roomId, action, issue });
  }
}
