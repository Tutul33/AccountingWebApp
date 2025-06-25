import { UserProfile } from 'src/app/admin/models/user-profile/user-profile.model'
import { Injectable } from '@angular/core';
import {
  GlobalConstants,
} from "../..";
import { ApiService, Config } from '../../index';
import { map, Observable } from 'rxjs';
import { ImageFile } from 'src/app/shared/models/common.model';



@Injectable()
export class UserProfileDataService {
  
  controllerName = Config.url.adminLocalUrl + "UserProfile";
  
  constructor(private apiSvc: ApiService) { }

  
  save(userProfile: UserProfile): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, userProfile, true);
  }

  getEmployeeListData(spData : any, isActive: boolean, option?: any): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetEmployeeListData`, { data: JSON.stringify(spData), option: option, IsActive: isActive })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getUserTypeList(spData: any): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUserTypeList`, { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getUserListData(spData : any, isActive: boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUserListData`, { data: JSON.stringify(spData), IsActive: isActive })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getUserPassword(isActive: boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUserPassword`, { IsActive: isActive })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  
}


@Injectable()
export class UserProfileModelService {

  userProfile: UserProfile = new UserProfile();
  tempuserProfile: UserProfile =  new UserProfile();
  UserProfile: UserProfile = new UserProfile();
  employeeList = [];

  prepareUserData(data: any) {
    try {
      this.userProfile.imageFile = new ImageFile();
      this.userProfile.imageFile.id = data.photoID || 0;
      if(data.fileName != null)
      {
        this.userProfile.imageFile.fileName = data.fileName;
      }
      else
      {
        this.userProfile.imageFile.fileName = null;
      }
      this.userProfile.imageFile.folderName = 'Employee/PI';
    } catch (e) {
      throw e;
    }
  }

  prepareDataBeforeSave() 
  {
    try {
      this.userProfile.compBranchID = GlobalConstants.companyInfo.companyID;
      this.userProfile.fileName = this.userProfile.imageFile.fileName;
    } catch (error) {
      throw error;
    }
  }

  prepareObjForEdit(userProfile: any) {
    try { 
      this.userProfile = new UserProfile(userProfile[0]);
      this.tempuserProfile = JSON.parse(JSON.stringify(userProfile));

      let userProfileData = userProfile[0];
      this.prepareUserData(userProfileData);
    } catch (e) {
      throw e;
    }
  }

  checkPasswordMatch() {
    try {
      if (this.userProfile.employeePassword != this.userProfile.confirmPassword) {
        return false;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
}
