import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { AdminConfig } from 'src/app/admin/config';
import { AdminService, AuthenticationService, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { OTPModel } from 'src/app/shared/models/otp.model';
import { OTPService } from 'src/app/shared/services/otp.service';
import {  ConfigService } from '..';
import { ForgotPasswordModel, forgotPasswordValidation } from '../models/sign-up-in.model';
import {  SignUpInModelService } from '../services/signUpIn.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AddValidatorsDirective } from 'src/app/shared/directives/add-validators.directive';
import {BaseComponent} from '../../shared/components/base/base.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  providers: [ 
    SignUpInModelService,
    OTPService
  ],
  standalone:true,
  imports:[
    AddValidatorsDirective,
    CommonModule,FormsModule
  ]
})
export class ForgotPasswordComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("forgotPasswordForm", { static: true, read: NgForm }) forgotPasswordForm: NgForm;

  public validationMsgObj: any;
  confirmOTPModel: OTPModel;
  isSubmitted: boolean = false;
  msgCode = {
    otpFailed: '2059',
    emailNotFound: "2064"
  }

  constructor(
    protected providerSvc: ProviderService,
    private authSvc: AuthenticationService,
    public modelSvc: SignUpInModelService,
    private configSvc: ConfigService,
    private adminSvc: AdminService,
    private optSvc: OTPService,
  ) {
    super(providerSvc);
    this.validationMsgObj = forgotPasswordValidation();
  }

  //email: string = null;;

  ngOnInit(): void {
    try {
      if (this.configSvc.getLocalStorage("oTPModel") != null) {
        this.modelSvc.confirmOTPModel = this.configSvc.getLocalStorage("oTPModel");
        if (this.modelSvc.confirmOTPModel.isOTPConfirmed) {
          this.configSvc.setLocalStorage('oTPModel', null);
          this.router.navigateByUrl("changepassword");
        }
      }
      this.setDefaultData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  ngAfterViewInit(): void {
    try {
      //this.focus(this.forgotPasswordForm.form, "mobileNo");
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setDefaultData() {
    try {
      this.modelSvc.forgotPasswordModel = new ForgotPasswordModel();

      if (this.configSvc.getLocalStorage("mobileNo") != null) {
        this.modelSvc.forgotPasswordModel.mobileNo = this.configSvc.getLocalStorage("mobileNo");
        this.forgotPasswordForm.form.markAsDirty();
        this.configSvc.setLocalStorage("mobileNo", null);
      }

      this.modelSvc.confirmOTPModel = new OTPModel();
      this.modelSvc.pageConfigType = FixedIDs.pageConfigType;
      this.modelSvc.moduleName = GlobalConstants.ERP_MODULES.ADMIN.name;
      this.modelSvc.adminPageConfig = AdminConfig.adminPageConfig;
      this.getForgotPasswordConfig();
      this.getOTPConfig();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getForgotPasswordConfig() {
    try {
      this.adminSvc.getModuleWisePageConfig(this.modelSvc.moduleName, this.modelSvc.adminPageConfig.ForgotPasswordSMSCodeSendOption).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareForgotPasswordConfig(res);
        },
        error: (res: any) => { 
          this.showErrorMsg(res); 
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSubmit(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      if (this.modelSvc.forgotPasswordModel.isSMSCode && this.modelSvc.forgotPasswordModel.isEmailCode) {
        if (!this.modelSvc.forgotPasswordModel.mobileNo && !this.modelSvc.forgotPasswordModel.email) {
          this.showMsg("2069");
          return;
        }

        this.checkRegisteredMobileAndEmail(this.modelSvc.forgotPasswordModel.mobileNo, this.modelSvc.forgotPasswordModel.email);
      }
      else if (this.modelSvc.forgotPasswordModel.isSMSCode) {

        if (!this.modelSvc.forgotPasswordModel.mobileNo) {
          this.showMsg("2070");
          return;
        }

        this.checkRegisteredMobile(this.modelSvc.forgotPasswordModel.mobileNo);
      }
      else if (this.modelSvc.forgotPasswordModel.isEmailCode) {
        if (!this.modelSvc.forgotPasswordModel.mobileNo) {
          this.showMsg("2071");
          return;
        }
        this.checkRegisteredEmail(this.modelSvc.forgotPasswordModel.email);
      }

    } catch (ex) {
      this.showErrorMsg(ex);
    }
  }

  checkRegisteredMobile(mobileNo: string) {
    try {
      this.modelSvc.isSubmitted = true;
      this.authSvc.getUserIDByMobileOrEmail(mobileNo, null, true).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.modelSvc.forgotPasswordModel.userID = res.body;
            if (this.modelSvc.forgotPasswordModel.userID > 0) {
              this.setUserInformation({ userPKID: this.modelSvc.forgotPasswordModel.userID })
              this.sendOTP(mobileNo, null);
            }
          }
          else {
            this.showMsg('2063');
            this.modelSvc.isSubmitted = false;
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
          this.modelSvc.isSubmitted = false;
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  checkRegisteredEmail(email: string) {
    try {
      this.modelSvc.isSubmitted = true;
      this.authSvc.getUserIDByMobileOrEmail(null, email, false).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.modelSvc.forgotPasswordModel.userID = res.body;
            if (this.modelSvc.forgotPasswordModel.userID > 0) {
              this.setUserInformation({ userPKID: this.modelSvc.forgotPasswordModel.userID })
              this.sendOTP(null, email);
            }
          }
          else {
            this.showMsg('2064');
            this.modelSvc.isSubmitted = false;
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
          this.modelSvc.isSubmitted = false;
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  checkRegisteredMobileAndEmail(mobileNo: string, email: string) {
    try {
      this.modelSvc.isSubmitted = true;
      forkJoin([
        this.authSvc.getUserIDByMobileOrEmail(mobileNo, null, true),
        this.authSvc.getUserIDByMobileOrEmail(null, email, false)
      ]).subscribe({
        next: (results: any) => {
          // if mobile no registered.
          if (results[0].body) {
            this.modelSvc.forgotPasswordModel.userID = results[0].body;
          }
          else {
            if (this.modelSvc.forgotPasswordModel.mobileNo) {
              this.showMsg('2063');
            }
            mobileNo = null;
          }

          // if email registered.
          if (results[1].body) {
            this.modelSvc.forgotPasswordModel.userID = results[1].body;
          }
          else {
            if (this.modelSvc.forgotPasswordModel.email) {
              this.showMsg('2064');
            }
            email = null;
          }

          if (this.modelSvc.forgotPasswordModel.userID > 0) {
            //this.configSvc.setLocalStorage('userID', this.modelSvc.forgotPasswordModel.userID);
            this.setUserInformation({ userPKID: this.modelSvc.forgotPasswordModel.userID })
            this.sendOTP(mobileNo, email);
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
          this.modelSvc.isSubmitted = false;
        }
      });
    } catch (e) {
      this.showMsg(e);
    }
  }

  // checkEmailAndSendOTP() {
  //   try {
  //     this.isSubmitted = true;
  //     this.authSvc.getUserIDByEmail(this.email).subscribe({
  //       next: (res) => {
  //         let userID = res.body;
  //         if (userID > 0) {
  //           this.setUserInformation({ userPKID: userID });
  //           this.sendOTP(this.email);
  //         } else {
  //           this.showMsg(this.msgCode.emailNotFound);
  //           this.isSubmitted = false;
  //         }
  //       },
  //       error: (res: any) => {
  //         this.showErrorMsg(res);
  //         this.isSubmitted = false;
  //       }
  //     })
  //   } catch (e) {
  //     this.showErrorMsg(e);
  //   }
  // }

  navigateToConfirmOTP(userOTPID: number, mobileNo: string, email: string) {
    try {
      this.modelSvc.prepareOTPModel(userOTPID, mobileNo, email, 'forgotpassword');
      this.router.navigateByUrl("confirmOTP");
    } catch (e) {
      //this.showErrorMsg(e);
    }
  }

  sendOTP(mobileNo: string, email: string) {
    try {
      this.modelSvc.isSubmitted = true;
      this.optSvc.sendOTP(mobileNo, email).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.navigateToConfirmOTP(res.body, mobileNo, email);
          }
          else {
            this.showMsg('2059');
          }
          this.modelSvc.isSubmitted = false;
        },
        error: (err: any) => {
          this.showErrorMsg(err);
          this.modelSvc.isSubmitted = false;
        },
        complete: () => {
          this.modelSvc.isSubmitted = false;
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  prepareOTPModel(userOTPID: number, email: string) {
    try {
      this.confirmOTPModel.userOTPID = userOTPID;
      this.confirmOTPModel.email = email;
      this.configSvc.setLocalStorage('oTPModel', this.confirmOTPModel);
    } catch (e) {
      throw e;
    }
  }

  getOTPConfig() {
    try {
      this.adminSvc.getModuleWisePageConfig(this.modelSvc.moduleName, this.modelSvc.adminPageConfig.OTPConfiguration).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareOTPConfig(res);
        },
        error: (res: any) => { 
          this.showErrorMsg(res); 
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private setUserInformation(userInfo) {
    let mergedObj = Object.assign({}, GlobalConstants.userInfo, userInfo);
    GlobalMethods.setLoginInfo(mergedObj);
    this.configSvc.setLocalStorage('userInfo', GlobalConstants.userInfo);
  }

}

