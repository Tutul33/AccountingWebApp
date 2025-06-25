import { Injectable } from '@angular/core';
import { ApiService, Config } from '../../index';
import { map, Observable } from 'rxjs';


@Injectable()
export class UserListDataService {
  controllerName = Config.url.adminLocalUrl + "UserList";
  
  constructor(private apiSvc: ApiService) { }

  getUserListData(spData : any, isActive: boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUserListData`, { data: JSON.stringify(spData), IsActive: isActive })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getUserListMenuData(spData : any, isActive: boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUserListMenuData`, { data: JSON.stringify(spData), IsActive: isActive })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  //Added this method by Showkat
  getUserListByGroupID(spData: any, groupId?: number): Observable<any> {
    return this.apiSvc.executeQuery(this.controllerName + "/GetUserListByGroupID",
    {
      data: JSON.stringify(spData),
      groupId: groupId == null ? '' : groupId
    })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
}



@Injectable()
export class UserListModelService {

  constructor() { }
}
