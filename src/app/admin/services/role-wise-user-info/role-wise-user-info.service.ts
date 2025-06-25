import { Injectable } from '@angular/core';
import { ApiService, Config } from '../../index';
import { map, Observable } from 'rxjs';
import { UtilityService } from '../../../shared/services/utility.service'


@Injectable()
export class RoleWiseUserInfoDataService {
  
  controllerName = Config.url.adminLocalUrl + "MapUserWithUserRole";
  constructor(private apiSvc: ApiService) { }

  getRoleWiseUserList(spData: any): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetRoleWiseUserList`, { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  remove(id: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/Delete`, { id: id})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }
}


@Injectable()
export class RoleWiseUserInfoModelService {

  roleWiseUserList = [];

  constructor(private utilitySvc: UtilityService) { }

  deleteCollection(entity: any) {
    try { 
      this.utilitySvc.deleteCollection(this.roleWiseUserList, entity);
    } catch (e) {
      throw e;
    }
  }
}

