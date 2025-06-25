import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { GlobalMethods, ValidatorDirective } from '../../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";
import { chequeStatusNotifyValidation } from '../../models/business-config/business-config.model'

@Component({
  selector: 'app-cheque-status-notify',
  templateUrl: './cheque-status-notify.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
  standalone:true,
  imports:[
      SharedModule
    ]
})
export class ChequeStatusNotifyComponent extends BaseComponent implements OnInit{
  gridOptionChequeNotify: GridOption;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("chequeStatusNotifyForm", { static: true, read: NgForm }) chequeStatusNotifyForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = chequeStatusNotifyValidation();
  }

  ngOnInit(): void {
    this.getChequeStatusNotifyBizConfig();
    this.initGridOption();

    // setTimeout(() => {
    //   this.getDefault();
    // }, 50);
  }

  getDefault() {
    try {
      this.getChequeStatusNotifyBizConfig();
      this.initGridOption();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getChequeStatusNotifyBizConfig() {
    try {
      this.dataSvc.getChequeStatusNotifyBizConfig().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.chequeStatusNotifyList = data;
          this.modelSvc.tempChequeStatusNotifyList = GlobalMethods.jsonDeepCopy(data);
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

    
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.chequeStatusNotifyList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        paginator: false,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["chequestatusnotify"]
        }
      } as GridOption;
      this.gridOptionChequeNotify = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "name", header: this.fieldTitle['notify'] },
      { field: "value", isRequired: true, header: this.fieldTitle['days'] },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass: "d-center" },
    ]
  }

  refresh(){
    try {
      this.getChequeStatusNotifyBizConfig();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  changeData(entity, formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form.controls['child_'+ entity.id] as UntypedFormGroup);
        return;
      }

      const isChanged = this.modelSvc.checkChangeData(entity);
      if(isChanged)
      {
        this.updateChequeStatusNotify(entity);
      }
      else
      {
        return;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  updateChequeStatusNotify(entity)
  {
    this.dataSvc.updateChequeStatusNotify(entity.id, entity.value, entity.isActive).subscribe({
      next: (res: any) => { 
        this.showMsg(this.messageCode.editCode);
        this.modelSvc.modifyAfterSave(entity);
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }
  
}


