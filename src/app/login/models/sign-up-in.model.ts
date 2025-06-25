import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, IPattern } from "src/app/shared/models/common.model";


export class ForgotPasswordModel {
  userID:number = null;
  mobileNo: string = null;
  email:string = null;
  isSMSCode:boolean = true;
  isEmailCode:boolean = true;
  constructor(defaultData?: Partial<ForgotPasswordModel>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function forgotPasswordValidation(): any {
    return {
        forgotPasswordValidateModel: {
         mobileNo: {
          maxlength:{
            message: "Value max length 14",
            length: 14,
          } as ICharachterLength,
          pattern:{
            message:"Enter Valid Mobile No",
            regex:"(^(\\+88)?(01){1}[3456789]{1}(\\d){8})$"
          } as IPattern
        },
        email: {
          maxlength:{
            message: "Value max length 30",
            length: 30,
          } as ICharachterLength,
          pattern:{
            message:"Enter Valid Email",
            regex:"[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}"
          } as IPattern
        },
      } as ValidatingObjectFormat,
    };
}

export class ChangePasswordModel {
  userID:number = null;
  password: string = null;
  reEnterPassword:string = null;
  currentPassword:string = null;
  isCurrentPasswordMatch:boolean = false;
  type: number;
  constructor(defaultData?: Partial<ChangePasswordModel>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function changePasswordValidation(): any {
    return {
      changePasswordValidateModel: {
        password: {
          required: GlobalConstants.validationMsg.password,
          maxlength:{
            message: "Value max length 16",
            length: 16,
         } as ICharachterLength
        },
        reEnterPassword: {
          required: GlobalConstants.validationMsg.reenterpassword,
        },
        currentPassword:{
          required: GlobalConstants.validationMsg.currentPassword,
        }
      } as ValidatingObjectFormat,
    };
}

export class PasswordRuleModel {
  isEnablePasswordRule:boolean = false;
  isMixLetterAndNumber: boolean = false;
  isMustContainSpecialCharacter: boolean = null;
  isMustContainUpperAndLower: boolean = null;
  passwordLength:number = null;
  passwordNote:string = null;
  passwordExpiryPeriod:number = null;
  
  constructor(defaultData?: Partial<PasswordRuleModel>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}







