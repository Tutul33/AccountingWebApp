import { ManageRole } from 'src/app/admin/models/manage-role/manage-role.model'
import { Injectable } from '@angular/core';
import { ApiService, Config, QueryData } from '../../index';
import { map, Observable } from 'rxjs';
import { UtilityService } from '../../../shared/services/utility.service'

@Injectable()
export class ManageRoleDataService {

  controllerName = Config.url.adminLocalUrl + "UserRole";
  spData:any;
  constructor(private apiSvc: ApiService) {
    this.spData = new QueryData({pageNo:0});
  }

  save(manageRole: ManageRole): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, manageRole, true);
  }

  getUserRoleList(spData : any, isActive: boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUserRoleList`, { data: JSON.stringify(spData), IsActive: isActive })
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
export class ManageRoleModelService {

  manageRole: ManageRole;
  tempManageRole: ManageRole;
  userRoleList: any[] = [];

  constructor(private utilitySvc: UtilityService) { }

  
  setDefault() {
    try {
      this.manageRole = new ManageRole();
    } catch (e) {
      throw e;
    }
  }

  prepareEditForm(entity: any) {
    try {
      this.manageRole = new ManageRole(entity);
      this.tempManageRole = new ManageRole(entity);
    } catch (e) {
      throw e;
    }
  }

  updateCollection(entity: ManageRole) {
    try {
      this.utilitySvc.updateCollection(this.userRoleList, entity);
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(entity: ManageRole) {
    try { 
      this.utilitySvc.deleteCollection(this.userRoleList, entity);
    } catch (e) {
      throw e;
    }
  }

}
