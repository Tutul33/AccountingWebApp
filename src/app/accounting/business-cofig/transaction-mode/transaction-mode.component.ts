import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, ValidatorDirective } from '../../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';
import { TransactionModeDTO, transactionModeValidation } from "../../models/business-config/business-config.model";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-transaction-mode',
  templateUrl: './transaction-mode.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class TransactionModeComponent  extends BaseComponent implements OnInit {
  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;
  transactionMode: any = FixedIDs.TransactionMode;

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("transactionModeForm", { static: true, read: NgForm }) transactionModeForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = transactionModeValidation();
  }

  ngOnInit(): void {
    this.getDefaultData();
  }


  getDefaultData() {
    try {
      this.modelSvc.transactionModeDTO = new TransactionModeDTO();
      this.getUDC_TransactionModeList();
      this.initGridOption();
    } catch (error) {
      throw error;
    }
  }


  getUDC_TransactionModeList() {
    try {
      this.dataSvc.getUDC_TransactionModeList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.transactionModeList = data;
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
        dataSource: "modelSvc.transactionModeList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["transactionmode"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "code", header: this.fieldTitle['code'] },
      { field: "value", header: this.fieldTitle['name'] },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true },
      { header: this.fieldTitle['action'] }
    ]
  }

  refresh(){
    try {
      this.getUDC_TransactionModeList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveTransactionMode (formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      this.save(this.modelSvc.transactionModeDTO);
      
    } catch (error) {
      
    }
  }

  private save(transactionModeDTO: TransactionModeDTO) {
    try {
      let messageCode = transactionModeDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.saveTransactionMode(transactionModeDTO).subscribe({ 
        next: (res: any) => {
          this.modelSvc.transactionModeList.push(res.body);

          this.setNew();
          this.showMsg(messageCode);
        },
        error: (res: any) => {
          if(res.error.message == "896")
          {
            this.showMsg(this.messageCode.duplicateEntry);
          }
          else
          {
            this.showErrorMsg(res.status);
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(entity: any) {
    try {
      
      if (this.transactionModeForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.modelSvc.prepareTransactionModeEditForm(entity);
              this.transactionModeForm.form.markAsPristine();
            }
          });
      } else {
        this.modelSvc.prepareTransactionModeEditForm(entity);
        this.transactionModeForm.form.markAsPristine();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  delete(entity: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.removeTransactionMode(entity.code).subscribe({
              next: (res: any) => { 
                this.modelSvc.deleteTransactionModeCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.gridOption.totalRecords = this.modelSvc.transactionModeList.length;
                if (entity.id == this.modelSvc.tempTransactionModeDTO.id) {
                  this.setNew();
                }
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
          }
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.modelSvc.isCodeEntryDisabled = false;
      this.getDefaultData();
      this.formResetByDefaultValue(this.transactionModeForm.form, this.modelSvc.transactionModeDTO);
      this.focus(this.transactionModeForm.form, 'TransactionModeDTO');
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.focus(this.transactionModeForm.form, "TransationMode");
      if (this.modelSvc.transactionModeDTO.id > 0) {
        this.transactionModeForm.form.markAsPristine();
        this.formResetByDefaultValue(this.transactionModeForm.form, this.modelSvc.tempTransactionModeDTO);
      } 
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }
}
