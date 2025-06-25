import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Config } from '../index';
import { GlobalConstants } from '../../app-shared/models/javascriptVariables';
import { ApiService } from './api.service';
import { DataCacheService } from './data-cache.service';

@Injectable({
  providedIn: 'root',
})
export class DefaultService {
  messageList: any[] = [];
  cache = new Map();
  baseUrl: string = Config.url.adminLocalUrl;

  constructor(
    private apiSvc: ApiService,
    private dataCacheSvc: DataCacheService

  ) { }

  // used to get message from local cache by passing code
  getMessage(code: any) {
    let message: any;
    this.dataCacheSvc.get('MessageList').subscribe((res) => {
      message = res.find((x: any) => {
        return x.messageCode === code;
      });
    });
    return message;
  }

  getMessageList() {
    return this.apiSvc.get(this.baseUrl + 'AppMessage/GetMessageList').pipe(
      map((response: any) => {
        this.dataCacheSvc.set('MessageList', response.body);
        return response;
      })
    );
  }

  setServerDateTime() {
    return this.apiSvc.get(this.baseUrl + 'Admin/GetServerDateTime').pipe(
      map((res: any) => {
        GlobalConstants.serverDate = new Date(res.body.date);
        return res;
      })
    );
  }

  startCountTime() {
    GlobalConstants.serverDate.setSeconds(
      GlobalConstants.serverDate.getSeconds() + 1
    );
  }


}
