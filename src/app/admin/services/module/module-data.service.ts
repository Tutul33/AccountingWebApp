import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

import { ApiService, Config } from "src/app/shared";

@Injectable()
export class ModuleDataService {
  controllerName = Config.url.adminLocalUrl + "Module";
  constructor(private apiSvc: ApiService) {}

  SaveModule(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveModule`, entity, true);
  }
  
  DeleteModule(id: any): Observable<any> {
    return this.apiSvc.removeByID(`${this.controllerName}/DeleteById`, id);
  }
  
  GetModuleList(spData: any,isPageOrMenu:number,parentID:number) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetModuleList", 
      {
       data: JSON.stringify(spData),
       isPageOrMenu:isPageOrMenu==null?'':isPageOrMenu,
       parentID:parentID==null?'':parentID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  GetApplicationList(spData: any) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetApplicationList", 
      {
       data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  GetProjectModuleList(spData: any) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetProjectModuleList", 
      {
       data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  SaveRearrangeModule(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveRearrangeModule`, entity, true);
  }

}