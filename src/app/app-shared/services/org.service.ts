import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Config } from '../index';
import { QueryData } from 'src/app/shared/models/common.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrgService {
  spData: any = new QueryData();
  controllerName = Config.url.orgLocalUrl + "OrgSvc";
  constructor(private apiSvc: ApiService) { this.spData.pageNo = 0; }

  getOrgStructure(elementCode?: string, orgID?:string): Observable<any> {
    let spData = new QueryData({pageNo: 0}); 
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetOrgStructure`, {elementCode: elementCode == null ? null : elementCode, orgID: orgID == null ? null : orgID, data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
}
