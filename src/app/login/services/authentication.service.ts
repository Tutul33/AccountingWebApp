import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiService,
  ConfigService,
  GlobalConstants,
  LoginInfo,
} from '../index';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Config, GlobalMethods } from 'src/app/app-shared';
import { ChangePasswordModel } from '../models/sign-up-in.model';


@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public currentUser: Observable<LoginInfo>;

  private ctrName = Config.url.adminLocalUrl+'Login';
  constructor(
    private apiSvc: ApiService,
    private router: Router,
    private configSvc: ConfigService
  ) {}


  login(user: LoginInfo): Observable<LoginInfo> {
    const data = user;
    return this.apiSvc.executeQuery(`${this.ctrName}/VerifyUser`, data, true);
  }

  logout(): void {
    localStorage.clear();    
    if(GlobalConstants.posCustWindow){
      GlobalConstants.posCustWindow.close();
      GlobalConstants.posCustWindow = null;
    }
    GlobalMethods.clearUserInformation();
    GlobalMethods.clearPageInfo();
    this.configSvc.setLocalStorage(this.router.url, GlobalConstants.localStorageKey.lastActiveRouteForForceLogout);
    console.log('logout');
    this.router.navigate(['signin']);
  }

  getUserIDByEmail(email: string) {
    try {
      return this.apiSvc.executeQuery(`${this.ctrName}/GetUserIDByEmail`, { email: email });
    } catch (e) {
      throw e;
    }
  }

  getUserIDByMobileOrEmail(mobileNo: string, email: string, isVerifyMobile: boolean) {
    try {
        return this.apiSvc.executeQuery(`${this.ctrName}/GetUserIDByMobileOrEmail`, { mobileNo: mobileNo, email: email, isVerifyMobile: isVerifyMobile });
    } catch (e) {
        throw e;
    }
}

  changePassword(user: ChangePasswordModel): Observable<ChangePasswordModel> {
    const data = user;
    return this.apiSvc.executeQuery(`${this.ctrName}/ChangePassword`, data, true);
  }

}
