import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminConfig } from 'src/app/admin/config';
import { 
  AdminService, 
  AuthenticationService, 
   
  FixedIDs, 
  GlobalConstants, 
  ProviderService, 
  ValidatorDirective 
} from 'src/app/app-shared';

import { ChangePasswordModel,
  changePasswordValidation,
   PasswordRuleModel
   } from '../models/sign-up-in.model';
import { SignUpInModelService } from '../services/signUpIn.service';
import { AddValidatorsDirective } from 'src/app/shared/directives/add-validators.directive';
import { CommonModule } from '@angular/common';
import {BaseComponent} from '../../shared/components/base/base.component';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  providers: [
   SignUpInModelService
  ],
  standalone:true,
  imports:[
    AddValidatorsDirective,
    CommonModule,
    FormsModule]
})
export class ChangePasswordComponent extends BaseComponent implements OnInit {

  private $unsubscribe = new Subject<void>();
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("changePasswordForm", { static: true, read: NgForm }) changePasswordForm: NgForm;

  public validationMsgObj: any;

  msgCode = {
    passwordNotMatch: '2060',
    passwordChanged: '2079'
  }

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: SignUpInModelService,
    private authSvc: AuthenticationService,
    private adminSvc: AdminService,
  ) {
    super(providerSvc);
    this.validationMsgObj = changePasswordValidation();
  }

  isOtpConfirmed = null;;

  ngOnInit(): void {
    try {

      // this.dataTransferSvc.on("isOTPConfirmed").pipe(takeUntil(this.$unsubscribe)).subscribe((response) => {
      //   if (response)
      //   this.isOtpConfirmed = response;
      //   this.dataTransferSvc.unsubscribe(this.$unsubscribe);
      // });

      // if (!this.isOtpConfirmed) {
      //   this.showMsg('Need to confirm OTP to change password');
      //   this.router.navigateByUrl('signin');
      // }

      // this.modelSvc.changePasswordMoel = new ChangePasswordModel();
      // this.modelSvc.changePasswordMoel.userID = GlobalConstants.userInfo.userPKID;
      // this.modelSvc.changePasswordMoel.type = 1; // for create new password
      // this.setDefaultData();

    } catch (e) {
      //this.showErrorMsg(e);
    }
  }
  ngOnDestroy() {
    //this.dataTransferSvc.broadcast("isOTPConfirmed", null);
  }

  setDefaultData() {
    try {
      this.modelSvc.passwordRuleModel = new PasswordRuleModel();
      this.modelSvc.pageConfigType = FixedIDs.pageConfigType;
      this.modelSvc.moduleName = GlobalConstants.ERP_MODULES.ADMIN.name;
      this.modelSvc.adminPageConfig = AdminConfig.adminPageConfig;
      this.getPasswordRuleConfig();
      this.validationMsgObj["changePasswordValidateModel"]["password"]["customValidator"] = { message: "Password Validation Failed.", method: this.modelSvc.passwordValidator() };

    } catch (e) {
      //this.showErrorMsg(e);
    }
  }

  getPasswordRuleConfig() {
    try {
      this.adminSvc.getModuleWisePageConfig(this.modelSvc.moduleName, this.modelSvc.adminPageConfig.CustomerPasswordRules).subscribe({
        next: (res: any) => {
          this.modelSvc.preparePasswordRulesConfig(res);
        },
        error: (res: any) => { 
          //this.showErrorMsg(res);
         }
      });
    } catch (e) {
      //this.showErrorMsg(e);
    }
  }

  onSubmit(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      if (this.modelSvc.changePasswordMoel.password != this.modelSvc.changePasswordMoel.reEnterPassword) {
        //this.showMsg('2060');
        return;
      }

      this.SavePassword(this.modelSvc.changePasswordMoel);

    } catch (ex) {
      //this.showErrorMsg(ex);
    }
  }

  SavePassword(changePassword: ChangePasswordModel) {
    try {
      this.modelSvc.isSubmitted = true;
      this.authSvc.changePassword(changePassword).subscribe({
        next: (res: any) => {
          this.modelSvc.isSubmitted = false;
          if (res.body != null) {
            // this.dataTransferSvc.broadcast("isOTPConfirmed", null);
            // this.router.navigateByUrl('signin');
          }
        },
        error: (res: any) => {
          //this.showErrorMsg(res);
          this.modelSvc.isSubmitted = false;
        },
        complete: () => {
          this.modelSvc.isSubmitted = false;
        }
      });
    } catch (e) {
      //this.showErrorMsg(e);
    }
  }
}
