
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { ConfigService, GlobalConstants } from 'src/app/login';
import { environment } from 'src/environments/environment';
import {
  ProviderService,
  ValidatorDirective,
  ModalService
} from '../..';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { OTPModel, oTPValidation } from '../../models/otp.model';
import { OTPService, OTPModelService } from '../../services/otp.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-confirm-otp',
  templateUrl: `${environment.confirmOTPTemplete}`,
  providers: [OTPService, OTPModelService, ModalService],
  standalone:true,
  imports:[CommonModule,FormsModule]
})
export class ConfirmOTPComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("oTPForm", { static: true, read: NgForm }) oTPForm: NgForm;
  public validationMsgObj: any;
  isModal: boolean = false;
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: OTPModelService,
    private dataSvc: OTPService,
    public modalService: ModalService, 
    private configSvc: ConfigService
  ) {
    super(providerSvc);
    this.validationMsgObj = oTPValidation();
  }

  ngOnInit(): void {
    try {
      this.isModal = this.modalService.isModal;
      if(this.isModal)
      {
        this.modalService.setHeader('Confirm OTP');
        this.modalService.setWidth("60%");
      }
      this.modelSvc.oTPModel = new OTPModel();

      if (this.configSvc.getLocalStorage("oTPModel") != null) {
        this.modelSvc.oTPModel = this.configSvc.getLocalStorage("oTPModel");
        this.setCountingTime(this.modelSvc.oTPModel.oTPResendDuration);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  ngAfterViewInit(): void {
    this.modelSvc.oTPForm = this.oTPForm.form;
  }

  onSubmit(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.confirmOTP(this.modelSvc.oTPModel);
    } catch (ex) {
      this.showErrorMsg(ex);
    }
  }

  sendOTP(mobileNo: string, email: string) {
    try {
      this.modelSvc.isSubmitted = true;
      this.dataSvc.sendOTP(mobileNo, email).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.modelSvc.oTPModel.userOTPID = res.body;
            this.setCountingTime(this.modelSvc.oTPModel.oTPResendDuration);
          }
          else {
            this.showErrorMsg('2059');
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

  resendOTP() {
    try {
      this.sendOTP(this.modelSvc.oTPModel.mobileNo, this.modelSvc.oTPModel.email);
    } catch (e) {
      throw e;
    }
  }

  setCountingTime(resendDuration: number) {
    this.modelSvc.oTPModel.isTimeCount = true;
    this.modelSvc.oTPModel.countingTime = resendDuration;
    clearInterval(this.modelSvc.interval);
    this.modelSvc.interval = setInterval(() => {
      if (this.modelSvc.oTPModel.countingTime > 0) {
        this.modelSvc.oTPModel.countingTime = this.modelSvc.oTPModel.countingTime - 1;
      }
      else {
        this.modelSvc.oTPModel.isTimeCount = false;
        clearInterval(this.modelSvc.interval);
      }
    }, 1000);
  }


  confirmOTP(oTPModel: OTPModel) {
    try {
      this.modelSvc.isSubmitted = false;
      this.dataSvc.confirmOTP(oTPModel.userOTPID, oTPModel.oTP).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.modelSvc.oTPModel.isOTPConfirmed = true;
            this.configSvc.setLocalStorage('oTPModel', this.modelSvc.oTPModel);
            this.dataTransferSvc.broadcast("isOTPConfirmed", true);
            if (this.isModal) this.closeModal();
            else this.router.navigateByUrl(this.modelSvc.oTPModel.navigateUrl);

          }
          else {
            this.showMsg('2058');
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


  closeModal() {
    if (this.modalService.isModal) {
      this.modalService.close(GlobalConstants.customerInfo);
    }
  }

  onEnterFunction(event, formGroup: NgForm) {
    if (event.keyCode === 13) {
      if(formGroup.dirty) this.onSubmit(formGroup);
    }
  }


}