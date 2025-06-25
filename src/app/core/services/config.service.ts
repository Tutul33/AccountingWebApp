import { FieldTitleService } from './field-title.service';
import { Injectable } from '@angular/core';
import { ValidationService } from '../../shared/services/validation.service';
import { DefaultService } from '../../shared/services/default.service';
import { GlobalConstants } from '../../app-shared/models/javascriptVariables';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(
    private validationSvc: ValidationService,
    private defaultSvc: DefaultService,
    private fieldTitleService: FieldTitleService
  ) {}

  getFieldDetail(languageCode:string) {
    return this.fieldTitleService.getFieldDetail(languageCode);
  }

  loadErrorMessageList() {
   return this.defaultSvc.getMessageList();
  }

  loadValidationMessage() {
    return this.validationSvc.getValidationMessageList();
  }
  
  setServerDateTime() {
    return this.defaultSvc.setServerDateTime();
  }

  setLocalStorage(key: string, val: any) {
    key = key + window.location.host;
    localStorage.setItem(key, JSON.stringify(val));
  }

  getLocalStorage(key: string) {
    key = key + window.location.host;
    return JSON.parse(localStorage.getItem(key));
  }
  clearAllLocalStorage() {
    localStorage.clear();
  }
  buildSignalRConnection() {
    GlobalConstants.signalRConnection = new signalR.HubConnectionBuilder()      
    .withUrl(GlobalConstants.ERP_MODULES_URL.signalrurl + '/notify')  
    .build();  

    GlobalConstants.signalRConnection.start().then(function () {  
      console.log('SignalR Connected!');  
    }).catch(function (err) {  
      return console.error(err.toString());  
    });  
  }
}
