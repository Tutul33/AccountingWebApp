import { GlobalConstants as glcon } from '../../app-shared/models/javascriptVariables';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataCacheService } from './data-cache.service';
import { Config } from '../index';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  baseUrl: string = Config.url.adminLocalUrl;
  constructor(
    private dataCacheSvc: DataCacheService,
    private apiSvc: ApiService
  ) {}

  // get validation messagelist from server or cache
  public getValidationMessageList() {
    return this.apiSvc.get(this.baseUrl + 'AppMessage/GetValidationMessageList').pipe(
      map((response: any) => {
        this.dataCacheSvc.set('ValidationCache', response.body);
        this.setValidationMsg();
        return response;
      })
    );
  }

  // get validation message from cache
  public getValidationMessage(valiDateKey: string) {
    let validateObject: any = null;
    const notFound = `There is no message for ${valiDateKey}`;

    this.dataCacheSvc.get('ValidationCache').subscribe((res) => {
      validateObject = res.find(function (x) {
        return x.value === valiDateKey;
      });
    });
    return validateObject != null ? validateObject : notFound;
  }

  private setValidationMsg() {
    this.dataCacheSvc.get('ValidationCache').subscribe((res) => {
      res.forEach((item) => {
        const key = item.value.toLowerCase();
        glcon.validationMsg[key] =
          item.messageDescription || `There is no message for ${item.value}!`;
      });
    });
  }
}
