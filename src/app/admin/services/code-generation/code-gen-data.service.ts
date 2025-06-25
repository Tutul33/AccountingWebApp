import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

import { ApiService, Config } from "src/app/shared";

@Injectable()
export class CodeGenDaDataService {
  controllerName = Config.url.adminLocalUrl + "CodeGeneration";
  constructor(private apiSvc: ApiService) {}

  SaveCodeGen(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveCodeGen`, entity, true);
  } 

  GetCodeGenItemList(spData: any,keyCode:string) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetCodeGenItemList", 
      {
       data: JSON.stringify(spData),
       keyCode:keyCode
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  GetKeyCodes(spData: any,groupCode:string) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetKeyCodes", 
     {
      data: JSON.stringify(spData),
      groupCode:groupCode
     })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  } 

  GetUdcCodeGenDataVariant() {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetCodeGenDataVariant", {})
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }  
}