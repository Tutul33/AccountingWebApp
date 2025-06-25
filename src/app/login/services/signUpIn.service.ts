import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
    ForgotPasswordModel,
    ChangePasswordModel,
    PasswordRuleModel,
} from '../models/sign-up-in.model';
import {
    GlobalMethods,
} from '../index';
//import { GlobalConstants } from 'src/app/shared';
import { Router } from '@angular/router';
import { OTPModel } from 'src/app/shared/models/otp.model';
import { ConfigService } from 'src/app/core/services/config.service';


@Injectable()
export class SignUpInModelService {
    forgotPasswordModel: ForgotPasswordModel;
    confirmOTPModel: OTPModel;
    isSubmitted: boolean = false;
    forgotPasswordVerifyOption: any = {};
    changePasswordMoel: ChangePasswordModel;
    passwordRuleModel: PasswordRuleModel;
    moduleName: any;
    pageConfigType: any;
    adminPageConfig: any;
    constructor(private router: Router,
         private configSvc: ConfigService,
        ) {
    }


    preparePasswordRulesConfig(configList: any) {
        try {
            this.passwordRuleModel.isEnablePasswordRule = configList.filter(a => a.value == this.pageConfigType.EPR)[0].isActive;
            this.passwordRuleModel.isMixLetterAndNumber = configList.filter(a => a.value == this.pageConfigType.MCAMOLAN)[0].isActive;
            this.passwordRuleModel.isMustContainSpecialCharacter = configList.filter(a => a.value == this.pageConfigType.MCSC)[0].isActive;
            this.passwordRuleModel.isMustContainUpperAndLower = configList.filter(a => a.value == this.pageConfigType.MCULCC)[0].isActive;
            this.passwordRuleModel.passwordLength = Number(configList.filter(a => a.value == this.pageConfigType.PL)[0].pageConfigValue || 0);
            this.passwordRuleModel.passwordNote = configList.filter(a => a.value == this.pageConfigType.PN)[0].pageConfigValue;
            this.passwordRuleModel.passwordExpiryPeriod = configList.filter(a => a.value == this.pageConfigType.PEP)[0].pageConfigValue;
        } catch (e) {
            throw e;
        }
    }

    prepareOTPConfig(configList: any) {
        try {
            this.confirmOTPModel.oTPResendDuration = Number(configList.filter(a => a.value == this.pageConfigType.ORD)[0].pageConfigValue || 0);
        } catch (e) {
            throw e;
        }
    }

    prepareOTPModel(userOTPID: number, mobileNo: string, email: string, navigateUrl: string) {
        try {
            this.confirmOTPModel.userOTPID = userOTPID;
            this.confirmOTPModel.mobileNo = mobileNo;
            this.confirmOTPModel.email = email;
            this.confirmOTPModel.navigateUrl = navigateUrl;
            this.configSvc.setLocalStorage('oTPModel', this.confirmOTPModel);
        } catch (e) {
            throw e;
        }
    }

    prepareForgotPasswordConfig(configList: any) {
        try {
            this.forgotPasswordModel.isSMSCode = configList.filter(a => a.value == this.pageConfigType.VSC)[0].isActive;
            this.forgotPasswordModel.isEmailCode = configList.filter(a => a.value == this.pageConfigType.VEC)[0].isActive;
        } catch (e) {
            throw e;
        }
    }

    passwordValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value || !this.passwordRuleModel.isEnablePasswordRule) {
                return null;
            }

            if (this.passwordRuleModel.isMustContainUpperAndLower) {
                const hasUpperAndLowerCase = /(?=.*?[A-Z])(?=.*?[a-z])+/.test(value);
                if (!hasUpperAndLowerCase) return { Password: { message: "The password must include upper and lower case characters." } };
            }

            if (this.passwordRuleModel.isMustContainSpecialCharacter) {
                const hasSpecialCharacter = /[!@#\$%\^\&*\)\(+=._-]+/.test(value);
                if (!hasSpecialCharacter) return { Password: { message: "The password must be at least one special character." } };
            }

            if (this.passwordRuleModel.isMixLetterAndNumber) {
                const hasMixLetterAndNumber = /(?=.*?[A-Za-z])(?=.*?[0-9])+/.test(value);
                if (!hasMixLetterAndNumber) return { Password: { message: "The password must include at least one letter and one number." } };
            }

            if (this.passwordRuleModel.passwordLength) {
                if (value.length < this.passwordRuleModel.passwordLength) return { Password: { message: "The password must be at least (" + this.passwordRuleModel.passwordLength + ") character." } };
            }

            return null;
        };
    }


}




