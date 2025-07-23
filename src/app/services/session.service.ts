import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly KEYS = [
    'currentRoom',
    'gameConfig',
    'userName',
    'userRole',
    'tempUserName',
  ];

  clearSession(): void {
    this.KEYS.forEach((k) => localStorage.removeItem(k));
  }
}
