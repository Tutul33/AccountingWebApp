import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Config } from '../index';
import { QueryData } from 'src/app/shared/models/common.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { GlobalMethods } from 'src/app/core/models/javascriptMethods';
import { GlobalConstants } from '..';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HRService {
  spParams: any = [];
  spData: any = new QueryData();
  controllerName = Config.url.adminLocalUrl +  "HRFacade";
  gsControllerName = Config.url.adminLocalUrl + "GS";
  constructor(private apiSvc: ApiService) { }

  getEmployeeList(orgID?: number) {
    this.spParams = [];debugger
    this.spParams.push(GlobalMethods.createKeyValuePair('@LocationID', 1, null));
    this.spParams.push(GlobalMethods.createKeyValuePair('@OrgID', orgID, null));
    this.spData = new QueryData({
      spParams: this.spParams,
      userID: GlobalConstants.userInfo.userPKID,
      pageNo: 0,
    });
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetEmployeeList`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }

  getDesignationList(orgID?: number) {

    let httpParams = new HttpParams();
    httpParams = httpParams.append('locationID',GlobalConstants.userInfo.locationID);
    return this.apiSvc
      .getWithParam(`${this.gsControllerName}/GetDesignation`, httpParams)
      .pipe(
        map((response: any) => {
          return response.body||[];
        })
      );
  }
}
