import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { ErrorLog } from "../../models/error-log/error-log-model";

import { ApiService, Config, GlobalConstants } from "src/app/shared";

@Injectable()
export class ErrorLogDataService {
  private ctrName = "Login";
  baseUrl: string = Config.url.adminLocalUrl;

  constructor(private apiSvc: ApiService) {}

  gerErrorLog(userId: any, pageName: any, fromDate: any, toDate: any) {
    console.log(fromDate);
    return this.apiSvc.executeQuery(this.baseUrl + "ErrorLog/GetErrorLog", { userId: userId==null?'':userId,  pageName: pageName==null?'':pageName, fromDate: fromDate==null?'':fromDate,  toDate: toDate==null?'':toDate,
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  gerUserList() {
    return this.apiSvc.executeQuery(this.baseUrl + "Admin/GetUsers", {locationID: GlobalConstants.userInfo.locationID}).pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }
  gerPageList() {
    const params = new HttpParams().set("locationID", 1).set("userID", GlobalConstants.userInfo.userPKID);

    return this.apiSvc
      .executeQuery(this.baseUrl + "Admin/GetMenus", params)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
}
@Injectable()
export class ErrorLogModelService {
  public errorlogModel: ErrorLog;
}
