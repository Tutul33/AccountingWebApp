import { Injectable } from '@angular/core';
import { Config } from '../index';
import { UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  ApiService
} from '../index';
import { OTPModel } from '../models/otp.model';

@Injectable()
export class OTPService {
  controllerName = Config.url.adminLocalUrl + "OTP";

  constructor(private apiSvc: ApiService) { }

  sendOTP(mobileNo:string, email:string): Observable<any>{
    try {
      return this.apiSvc.executeQuery(`${this.controllerName}/SendOTP`, {mobileNo : mobileNo, email: email});
    } catch (e) {
      throw e;
    }
  }

  confirmOTP(userOTPID:number, otp:string): Observable<any>{
    try {
      return this.apiSvc.executeQuery(`${this.controllerName}/ConfirmOTP`, {userOTPID : userOTPID, otp: otp});
    } catch (e) {
      throw e;
    }
  }
}

@Injectable()
export class OTPModelService {
   oTPModel: OTPModel;
   isSubmitted: boolean = false;
   isTimeCount:boolean = false;
   interval:any;
   oTPForm:UntypedFormGroup;
   constructor() {
   }
}




