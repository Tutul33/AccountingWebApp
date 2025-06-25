import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, ValidatorDirective } from '../../../shared';
import { NgForm } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";


@Component({
  selector: 'app-cheque-leaf-status',
  templateUrl: './cheque-leaf-status.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
  standalone:true,
  imports:[
      SharedModule
    ]
})
export class ChequeLeafStatusComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;
  transactionMode: any = FixedIDs.TransactionMode;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("chequeLeafStatusForm", { static: true, read: NgForm }) chequeLeafStatusForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getUDC_ChequeLeafStatusList();
    this.initGridOption();

    // setTimeout(() => {
    //   this.getDefault();
    // }, 50);
  }

  getDefault() {
    try {
      this.getUDC_ChequeLeafStatusList();
      this.initGridOption();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getUDC_ChequeLeafStatusList() {
    try {
      this.dataSvc.getUDC_ChequeLeafStatusList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.chequeLeafStatusList = data;
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
        dataSource: "modelSvc.chequeLeafStatusList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["chequeleafstatus"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "value", header: this.fieldTitle['chequeleafstatus'] },
      { field: "description", header: this.fieldTitle['description'] },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass: "d-center" },
    ]
  }

  refresh(){
    try {
      this.getUDC_ChequeLeafStatusList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  changeActiveStatus(entity) {
    try {
      this.dataSvc.updateChequeLeafStatus(entity.code, entity.isActive).subscribe({
        next: (res: any) => { 
          this.showMsg(this.messageCode.editCode);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

}
