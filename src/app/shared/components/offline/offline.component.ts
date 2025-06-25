import { Component } from '@angular/core';
import { OnlineOfflineService } from '../../services/online-offline.service';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.component.html',
  standalone:true
})
export class OfflineComponent {
  offlineActive:boolean = false;
  isServerInactive:boolean = false;
  constructor(public onlineOfflineSvc: OnlineOfflineService) {
    this.registerToOnlineOffLineEvents(onlineOfflineSvc);
    this.registerServerOnlineOfflineEvents(onlineOfflineSvc);

   }
  private registerToOnlineOffLineEvents(onlineOfflineSvc: OnlineOfflineService) {
    onlineOfflineSvc.connectionChanged.subscribe(online => {
      if (online) {
        this.offlineActive = false;
      } else {
        this.offlineActive = true;
      }
    });
  }

  private registerServerOnlineOfflineEvents(onlineOfflineSvc: OnlineOfflineService) {
    onlineOfflineSvc.serverConnectionChange.subscribe(online => {
      if (online) {
        this.isServerInactive = false;
      } else {
        this.isServerInactive = true;
      }
    });
  }

}
