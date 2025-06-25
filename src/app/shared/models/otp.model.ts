
import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class OTPModel {
  userOTPID: number = 0;
  oTP: string = null;
  mobileNo: string = null;
  email: string = null;
  navigateUrl: string = null;
  oTPResendDuration: number = 0;
  countingTime: number = null;
  isTimeCount: boolean = false;
  isOTPConfirmed: boolean = false;
  otpLength: number = 0;
  otpLengthArray: any = [];
  isTCChecked:boolean = false;
  constructor(defaultData?: Partial<OTPModel>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function oTPValidation(): any {
  return {
    oTPValidateModel: {
      oTP:
      {
        required: GlobalConstants.validationMsg.otp,
      }
    } as ValidatingObjectFormat,
  };
}
