import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class OnlineOfflineService {
  private internalConnectionChanged = new Subject<boolean>();
  private serverConnectionChanged = new Subject<boolean>();

  get connectionChanged() {
    return this.internalConnectionChanged.asObservable();
  }

  get serverConnectionChange() {
    return this.serverConnectionChanged.asObservable();
  }

  get isOnline() {
    return !!window.navigator.onLine;
  }

  constructor() {
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  private updateOnlineStatus() {
    this.internalConnectionChanged.next(window.navigator.onLine);
  }

  updateServerOnlineStatus(online:boolean) {
    this.serverConnectionChanged.next(online);
  }

}