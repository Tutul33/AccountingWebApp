import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalMethods } from '../../core/models/javascriptMethods';
import { GlobalConstants } from '../../app-shared/models/javascriptVariables';
import { ConfigService } from '../../core/services/config.service';
import { ValidatorDirective } from '../../shared/directives/validator.directive';
import { AppMsgService } from '../../shared/services/app-msg.service';
import { AuthenticationService } from '../services/authentication.service';
import { LoginInfo, loginInfoValidation } from '../models/login-info';
import { environment } from 'src/environments/environment';
import { DataService } from '../../shared/services/data.service';
import { lastValueFrom } from 'rxjs';
import { FieldTitleService } from 'src/app/core/services/field-title.service';
import { CommonModule } from '@angular/common';
import { AddValidatorsDirective } from 'src/app/shared/directives/add-validators.directive';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports:[
    AddValidatorsDirective,
    CommonModule,
    FormsModule
  ]
})

export class LoginComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("loginForm", { static: true, read: NgForm }) loginForm: NgForm;
  public validationMsgObj: any;
  isLastActivateRouteExist: any;
  msgCode = {
    invalidCridential: '806'
  }
  constructor(
    private authSvc: AuthenticationService,
    private msgSvc: AppMsgService,
    private configSvc: ConfigService,
    private router: Router,
    private dataTransferSvc: DataService,
    private fieldSvc:FieldTitleService
  ) {
    this.validationMsgObj = loginInfoValidation();
  }

  loginInfo: LoginInfo;

  ngOnInit(): void 
  {
    GlobalConstants.skipRefreshTokenCheck=true;

    this.loginInfo = {} as LoginInfo;
    this.isLastActivateRouteExist = this.configSvc.getLocalStorage(GlobalConstants.localStorageKey.lastActiveRouteForForceLogout);
    if (environment.production) {
      if (this.isLastActivateRouteExist) {
        this.loginInfo.userName = GlobalConstants.userInfo.userID;
      }
    }
    else {
      // this.loginInfo.userName = environment.username;
      // this.loginInfo.password = environment.password;
    }
  }

  onSubmit(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      // if (this.isLastActivateRouteExist) {
      //   this.router.navigateByUrl(this.isLastActivateRouteExist);
      //   localStorage.removeItem(GlobalConstants.localStorageKey.lastActiveRouteForForceLogout);
      // } else {
      if (this.loginInfo) {
        this.authSvc.login(this.loginInfo).subscribe({
          next: (res: any) => {
            if (res.body) {
              GlobalConstants.skipRefreshTokenCheck=false;

              if (this.isLastActivateRouteExist) {
                this.router.navigateByUrl(this.isLastActivateRouteExist);
                localStorage.removeItem(GlobalConstants.localStorageKey.lastActiveRouteForForceLogout);
              } else {
                this.configSvc.clearAllLocalStorage();
                if (res.body.userName)
               {
                  this.setUserInformation(res.body);
                  this.setLogInUserCompanyInfo(res.body);
                  this.router.navigateByUrl('ADMIN-PAGE/dashboard');
                }

                this.dataTransferSvc.broadcast('userInfo', GlobalConstants.userInfo);
              }
              
              lastValueFrom(this.configSvc.setServerDateTime());

            } else {
              this.configSvc.clearAllLocalStorage();
              this.msgSvc.showMessage(this.msgCode.invalidCridential);
            }

          },
          error: (err) => {
            this.msgSvc.showExceptionMessage(err);
          },
          complete: () => { },
        });
      }
      //}
    } catch (ex) {
      this.msgSvc.showExceptionMessage(ex);
    }
  }

  private setUserInformation(data: any) {
    let mergedObj = Object.assign({}, GlobalConstants.userInfo, data);
    mergedObj.userName = data.userName;
    mergedObj.userPKID = data.id;
    mergedObj.orgID = data.org1ID;


    GlobalMethods.setLoginInfo(mergedObj);
    this.configSvc.setLocalStorage('userInfo', GlobalConstants.userInfo);
    localStorage.setItem('languageCd',GlobalConstants.userInfo.languageCode);
    this.fieldSvc.getFieldDetail(GlobalConstants.userInfo.languageCode).subscribe({
      next: (res: any) => {
      }
    });
  }

  private setLogInUserCompanyInfo(data: any){

    let mergedObj = Object.assign({}, GlobalConstants.companyInfo, data);
    mergedObj.companyAddress = data.empOrgAddress;
    mergedObj.companyWebSiteAdd = data.companyWebsite;
    GlobalMethods.setCompanyInfo(mergedObj);

    this.configSvc.setLocalStorage('companyInfo', GlobalConstants.companyInfo);
  }


}
