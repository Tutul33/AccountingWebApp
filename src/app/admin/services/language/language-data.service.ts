import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

import { ApiService, Config } from "src/app/shared";

@Injectable()
export class LanguageDataService {
  controllerName = Config.url.adminLocalUrl + "Language";
  constructor(private apiSvc: ApiService) {}

  SaveLanguage(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveLanguage`, entity, true);
  }
  
  DeleteLanguage(id: any): Observable<any> {
    return this.apiSvc.removeByID(`${this.controllerName}/DeleteByLanguageId`, id);
  }

  SaveLanguageKey(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveLanguageKey`, entity, true);
  }

  DeleteLanguageKey(keyCode: any): Observable<any> {
    return this.apiSvc.removeByID(`${this.controllerName}/DeleteByLanguageKeyCode`, keyCode);
  }
  SaveLanguageKeyValue(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveLanguageKeyValue`, entity, true);
  }

  GetLanguageList(spData: any) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetLanguageList", 
      {
       data: JSON.stringify(spData) 
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  GetLanguageKeyValueList(spData: any,languageCode:string) {    
    return this.apiSvc.executeQuery(this.controllerName + "/GetLanguageKeyValueList", 
     {
      data: JSON.stringify(spData),
      languageCode:languageCode
     })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }  
}