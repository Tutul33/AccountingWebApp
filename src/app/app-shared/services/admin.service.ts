import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Config } from '../index';
import { QueryData } from 'src/app/shared/models/common.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  spData: any = new QueryData();
  controllerName = Config.url.adminLocalUrl + "Admin";
  constructor(private apiSvc: ApiService) { this.spData.pageNo = 0; }

  // getLanguageList() {
  //   return this.apiSvc
  //     .get(`${this.controllerName}/GetLanguageList/`)
  //     .pipe(
  //       map((response: any) => {
  //       return response.body;
  //       })
  //     );
  // }

  getLanguageList() {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetLanguageList", 
      {
       data: JSON.stringify(this.spData) 
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  UpdateUserLanguageByUserID(lgCode:string, userID:number) {
    var obj = {
      data: JSON.stringify(this.spData),
      lgCode: lgCode,
      userID: userID
    }
    return this.apiSvc
      .executeQuery(`${this.controllerName}/UpdateUserLanguageByUserID`,obj)
      .pipe(
        map((response: any) => {
        return response.body;
        })
      );
  }

  UpdateLanguageDefaultByCode(lgCode:string) {
    var obj = {
      data: JSON.stringify(this.spData),
      lgCode: lgCode
    }
    return this.apiSvc
      .executeQuery(`${this.controllerName}/UpdateLanguageDefaultByCode`,obj)
      .pipe(
        map((response: any) => {
        return response.body;
        })
      );
  }

  getEcomMenus(locationID: number, userId: number) {
    var obj = {
      data: JSON.stringify(this.spData),
      locationID: locationID,
      userId: userId
    }
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetEComMenus`, obj)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getModuleWiseMenus(locationID: number, userId: number,moduleName:string) {
    var obj = {
      data: JSON.stringify(this.spData),
      locationID: locationID,
      userId: userId,
      moduleName:moduleName
    }
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetModuleWiseMenus`, obj)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getModuleWisePageConfig(module: string, pageCd:number ): Observable<any> {
    let spData = new QueryData({pageNo: 0}); 
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetModuleWisePageConfig`, { module: module, pageCd:pageCd, data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
  
  getOrderTypeByOrderCategoryCd(orderCategoryCd): Observable<any> {
    let spData = new QueryData({pageNo: 0}); 
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetOrderTypeByOrderCategoryCd`, {orderCategoryCd:orderCategoryCd, data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getDutyConfig() {
    return this.apiSvc.get(this.controllerName + '/GetDutyConfig').pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  getBaseCurrency() {
    return this.apiSvc.get(this.controllerName + '/GetBaseCurrency').pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  getDutyProperties() {
    return this.apiSvc.get(this.controllerName + '/GetDutyProperties').pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

  getGoogleApiKey() {
    let spData = new QueryData({pageNo:0});
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetGoogleApiKey`, { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1][0] || [];
        })
      );
  }
  getUserMultipleORGsUsers(orgIds:string): Observable<any> {
    let spData = new QueryData({pageNo: 0}); 
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUserMultipleORGsUsers`, {orgIds : orgIds, data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }
  getFileHyperLink(ids:string, folderName:string) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetFileHyperLink`, { ids : ids, folderName : folderName })
      .pipe(
        map((response: any) => {
          return response.body || [];
        })
      );
  }

  getReportLayoutName(reportCode:number) {   
    let spData = new QueryData({pageNo: 0}); 
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetReportLayoutName`, { data: JSON.stringify(spData),reportCode : reportCode})
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }

  getBizConfigInfo() {
    return this.apiSvc.get(this.controllerName + '/GetBizConfigInfo').pipe(
      map((res: any) => {
        return res.body;
      })
    );
  }

}
