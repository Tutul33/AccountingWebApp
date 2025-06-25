import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColumnType, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { FixedIDs, ValidatorDirective } from '../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  SubLedgerDataService,
  SubLedgerModelService,
  QueryData,
  SubLedgerUploadComponent
} from '../index';
import { SubLedgerDTO, subLedgerValidation } from "../models/sub-ledger/sub-ledger.model";
import { SharedModule } from "src/app/shared/shared.module";


@Component({
  selector: 'app-sub-ledger',
  templateUrl: './sub-ledger.component.html',
  providers: [SubLedgerDataService, SubLedgerModelService],
  standalone:true,
  imports:[SharedModule]
})
export class SubLedgerComponent  extends BaseComponent implements OnInit {
  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;
  spData: any = new QueryData();
  isPlaceholderDisable: boolean = false;
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("subLedgerForm", { static: true, read: NgForm }) subLedgerForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: SubLedgerModelService,
    private dataSvc: SubLedgerDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = subLedgerValidation();
  }

  ngOnInit(): void {
    this.getDefaultData();
  }


  getDefaultData() {
    try {
      this.modelSvc.subLedgerDTO = new SubLedgerDTO();
      this.getSubLedgerList(true);
      this.getSubLedgerTypeList();
      this.initGridOption();
    } catch (error) {
      throw error;
    }
  }


  getSubLedgerList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getSubLedgerList(this.spData).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);

          let data = res[res.length - 1] || [];
          this.modelSvc.subLedgerList = data;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { 
          this.spData.isRefresh = false;
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("SubLedgerType, SubLedgerType");
      ddlProperties.push("Name, Name");
      ddlProperties.push("Email, Email");
      ddlProperties.push("Mobile, Mobile");
    return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.subLedgerTypeDDList = data[0];
      this.modelSvc.subLedgerDDList = data[1];
      this.modelSvc.subLedgerEmailDDList = data[2];
      this.modelSvc.subLedgerMobileDDList = data[3];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getSubLedgerTypeList() {
    try {
      this.dataSvc.getSubLedgerTypeList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.subLedgerTypeList = data;

          if(this.modelSvc.subLedgerTypeList.length == 1) {
            this.isPlaceholderDisable = true;
          }
          else
          {
            this.isPlaceholderDisable = false;
          }
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
        dataSource: "modelSvc.subLedgerList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["subledger"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "subLedgerType", header: this.fieldTitle['subledgertype'], isDDFilter: true, dataList: this.modelSvc.subLedgerTypeDDList, labelField: 'SubLedgerType' },
      { field: "name", header: this.fieldTitle['subledger'], isDDFilter: true, dataList: this.modelSvc.subLedgerDDList, labelField: 'Name' },
      { field: "email", header: this.fieldTitle['email'], isDDFilter: true, dataList: this.modelSvc.subLedgerEmailDDList, labelField: 'Email' },
      { field: "mobile", header: this.fieldTitle['mobileno'], isDDFilter: true, dataList: this.modelSvc.subLedgerMobileDDList, labelField: 'Mobile' },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass:'d-center' },
      { header: this.fieldTitle['action'], styleClass:'d-center' }
    ]
  }

  refresh(){
    try {
      this.getSubLedgerList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveSubLedger(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      //check duplicate entry
      if (this.modelSvc.checkDuplicate(this.modelSvc.subLedgerDTO)) {
        this.showMsg(this.messageCode.duplicateCheck);
        return;
      }

      this.save(this.modelSvc.subLedgerDTO);

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private save(subLedgerDTO: SubLedgerDTO) {
    try {
      let messageCode = subLedgerDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
      let isEdit = subLedgerDTO.id ? true : false;

      this.dataSvc.saveSubLedger(subLedgerDTO).subscribe({ 
        next: (res: any) => {
          this.modelSvc.updateCollection(res.body, isEdit);
          this.initGridOption();
          this.setNew();
          this.showMsg(messageCode);
        },
        error: (res: any) => { 
          if(res.error.messageCode == this.messageCode.duplicateEntry)
          {
            this.showMsg(this.messageCode.duplicateEntry);
          }
          else
          {
            this.showErrorMsg(res);
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(entity: any) {
    try {
      if (this.subLedgerForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.modelSvc.prepareEditForm(entity);
              this.subLedgerForm.form.markAsPristine();
            }
          });
      } else {
        this.modelSvc.prepareEditForm(entity);
        this.subLedgerForm.form.markAsPristine();
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
            this.dataSvc.removeSubLedger(entity.id).subscribe({
              next: (res: any) => { 
                this.modelSvc.deleteCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.initGridOption();
                this.gridOption.totalRecords = this.modelSvc.subLedgerList.length;
                if (entity.id == this.modelSvc.tempSubLedgerDTO.id) {
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
      this.focus(this.subLedgerForm.form, 'SubLedger');
      this.modelSvc.subLedgerDTO = new SubLedgerDTO();
      setTimeout(() => {
        this.formResetByDefaultValue(this.subLedgerForm.form, this.modelSvc.subLedgerDTO);
      }, 30); 
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      if (this.modelSvc.subLedgerDTO.id > 0) {
        this.focus(this.subLedgerForm.form, "subLedger");
        this.subLedgerForm.form.markAsPristine();
        this.formResetByDefaultValue(this.subLedgerForm.form, this.modelSvc.tempSubLedgerDTO);
      } 
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  ref: DynamicDialogRef;
  
    bulkUploadModal() {
      try {
  
        const modalConfig = new ModalConfig();
        const obj = {};
        modalConfig.data = obj;
        modalConfig.header = this.fieldTitle['subledgerupload'];
        this.ref = this.dialogService.open(SubLedgerUploadComponent, modalConfig);
        this.ref.onClose.subscribe((data: any) => {
          if (data) {
            this.getSubLedgerList(true);
          }
  
        });
  
      } catch (error) {
  
      }
    }

}
