import { Injectable } from '@angular/core';
import { DialogService } from "primeng/dynamicdialog";
import { Router } from "@angular/router";
import { UtilityService } from 'src/app/shared/services/utility.service';
import { DataService } from 'src/app/shared/services/data.service';
import { AppMsgService } from 'src/app/shared/services/app-msg.service';
import { OnlineOfflineService } from 'src/app/shared/services/online-offline.service'
@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  constructor(
    public appMsgSvc: AppMsgService,
    public dataTransferSvc: DataService,
    public utilitySvc: UtilityService,
    public dialogSvc: DialogService,
    public onlineOfflineSvc: OnlineOfflineService,
    public router: Router
  ) { }
}
