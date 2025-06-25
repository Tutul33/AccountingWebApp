import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

import { ApiService, Config } from "src/app/shared";

@Injectable()
export class MapUserWithUserRoleDataService {
  controllerName = Config.url.adminLocalUrl + "MapUserWithUserRole";
  constructor(private apiSvc: ApiService) {}

  Save(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, entity, true);
  }
  
  Delete(id: any): Observable<any> {
    return this.apiSvc.removeByID(`${this.controllerName}/Delete`, id);
  }
  
  GetRoleList(spData: any) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetRoleList", 
      {
       data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  
  GetUserList(spData: any) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetUserList", 
      {
       data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
}