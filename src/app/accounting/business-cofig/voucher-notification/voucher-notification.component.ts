import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { FixedIDs, GlobalMethods, ValidatorDirective } from '../../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";
import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';
import { VoucherNotificationDTO } from "../../models/business-config/business-config.model";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-voucher-notification',
  templateUrl: './voucher-notification.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class VoucherNotificationComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("voucherNotificationForm", { static: true, read: NgForm }) voucherNotificationForm: NgForm;
  public validationMsgObj: any;
  voucherType: any = FixedIDs.voucherType;


  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.modelSvc.voucherCode = this.voucherType.DebitVoucher.code;
    this.modelSvc.voucherNotificationDTO = new VoucherNotificationDTO();
    this.modelSvc.tempVoucherNotificationDTO = new VoucherNotificationDTO();
    this.getVoucherNotificationList();
  }


  getVoucherNotificationList() {
    try {
      this.dataSvc.getVoucherNotificationList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.voucherNotificationList = data;

          this.modelSvc.prepareVoucherNotificationSaveData();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  changeVoucher(code: number){
    try {
      this.modelSvc.voucherCode = code;
      this.modelSvc.prepareVoucherNotificationSaveData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveVoucherNotification (formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.modelSvc.prepareDataBeforeSave();
      this.save(this.modelSvc.voucherNotificationDTO);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  private save(voucherNotificationDTO: VoucherNotificationDTO) {
    try {
      let messageCode = voucherNotificationDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
  
      this.dataSvc.saveVoucherNotification(voucherNotificationDTO).subscribe({ 
        next: (res: any) => {
          this.modelSvc.updateVoucherListCollection(res.body);
          //this.modelSvc.voucherNotificationDTO.id = 0;
          this.showMsg(messageCode);
          this.voucherNotificationForm.form.markAsPristine();
        },
        error: (e) => {
          this.showErrorMsg(e);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      this.focus(this.voucherNotificationForm.form, "voucherNotification");
      if (this.modelSvc.voucherNotificationDTO.id > 0) {
        this.voucherNotificationForm.form.markAsPristine();
        this.modelSvc.voucherNotificationDTO = GlobalMethods.jsonDeepCopy(this.modelSvc.tempVoucherNotificationDTO);
      } 
      else {
        this.modelSvc.prepareVoucherNotificationSaveData();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }
}

