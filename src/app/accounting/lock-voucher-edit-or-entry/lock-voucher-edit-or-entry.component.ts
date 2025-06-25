import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalConstants, ValidatorDirective } from '../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";
import {
  ProviderService,
  BaseComponent,
  LockVoucherEditOrEntryDataService,
  LockVoucherEditOrEntryModelService,
  QueryData
} from '../index';
import { LockVoucherDTO, lockVoucherValidation } from "../models/lock-voucher-edit-or-entry/lock-voucher.model";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { OrgService } from "src/app/app-shared/services/org.service";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-lock-voucher-edit-or-entry',
  templateUrl: './lock-voucher-edit-or-entry.component.html',
  providers: [LockVoucherEditOrEntryDataService, LockVoucherEditOrEntryModelService],
  standalone:true,
  imports:[SharedModule]
})
export class LockVoucherEditOrEntryComponent  extends BaseComponent implements OnInit {
  gridOption: GridOption;
  spData: any = new QueryData();

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("lockVoucherForm", { static: true, read: NgForm }) lockVoucherForm: NgForm;
  public validationMsgObj: any;
  isPlaceholderDisable: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: LockVoucherEditOrEntryModelService,
    private dataSvc: LockVoucherEditOrEntryDataService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    private commonSvc: CoreAccountingService,
  ) {
    super(providerSvc);
    this.validationMsgObj = lockVoucherValidation();
  }

  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.getDefaultData();
  }

  getDefaultData() {
    try {
      this.modelSvc.lockVoucherDTO = new LockVoucherDTO();
      this.getLockVoucherList(true);
      this.getCompanyList();
      this.initGridOption();
    } catch (error) {
      throw error;
    }
  }

  getLockVoucherList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getLockVoucherList(this.spData).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);

          let data = res[res.length - 1] || [];
          this.modelSvc.lockVoucherList = data;
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

  getCompanyList() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res || []; 

          if(this.modelSvc.companyList.length == 1) {
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
  
  onChangeCompany() {
    try {
      let elementCode = '';
      elementCode = FixedIDs.orgType.Branch.toString();
      elementCode += ','+ FixedIDs.orgType.Office.toString();
      elementCode += ','+ FixedIDs.orgType.Unit.toString();
      const companyID = this.modelSvc.lockVoucherDTO.companyID;
      
      if(companyID != null)
      {

        this.orgSvc.getOrgStructure(elementCode, companyID.toString()).subscribe({
          next: (res: any) => {
            this.modelSvc.prepareOrgList(res);   
            
            this.modelSvc.lockVoucherDTO.orgID = null;
            this.modelSvc.lockVoucherDTO.projectID = null;
            this.modelSvc.projectList = [];
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
      }
      else
      {
        this.modelSvc.lockVoucherDTO.orgID = null;
        this.modelSvc.orgList = [];

        this.modelSvc.lockVoucherDTO.projectID = null;
        this.modelSvc.projectList = [];
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeOffice() {
    try {
      return;  // Currently project business will not include, but later on it may inclue.

      let orgID = this.modelSvc.lockVoucherDTO.orgID;
      if(orgID != null)
      {
        this.commonSvc.getProject(orgID).subscribe({
          next: (res: any) => {
            this.modelSvc.projectList = res || []; 
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
          complete: () => { },
        });
      }
      else
      {
        this.modelSvc.lockVoucherDTO.projectID = null;
        this.modelSvc.projectList = [];
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("CompanyName, CompanyName");
      ddlProperties.push("OrgName, OrgName");
      ddlProperties.push("ProjectName, ProjectName");
    return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.companyNameDDList = data[0];
      this.modelSvc.orgNameDDList = data[1];
      this.modelSvc.projectNameDDList = data[2];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
   
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.lockVoucherList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["lockvouchereditorentry"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "companyName", header: this.fieldTitle['company'], isDDFilter: true, dataList: this.modelSvc.companyNameDDList, labelField: 'CompanyName' },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "orgName", header: this.fieldTitle['office/branch'] }] : []),
      // { field: "projectName", header: this.fieldTitle['project'], isDDFilter: true, dataList: this.modelSvc.projectNameDDList, labelField: 'ProjectName' },
      { field: "fromDate", header: this.fieldTitle['fromdate'] },
      { field: "toDate", header: this.fieldTitle['todate'] },
      { field: "status", header: this.fieldTitle['status'], styleClass:'d-center' },
      { header: this.fieldTitle['action'], styleClass:'d-center' }
    ]
  }

  refresh(){
    try {
      this.getLockVoucherList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveLockVoucher(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      
      if(this.modelSvc.lockVoucherDTO.projectID == null)
      {
        this.modelSvc.lockVoucherDTO.projectName = "";
      }
      if(this.modelSvc.lockVoucherDTO.orgID == null)
      {
        this.modelSvc.lockVoucherDTO.orgName = "";
      }

      if (this.modelSvc.checkDuplicate(this.modelSvc.lockVoucherDTO)) {
        this.showMsg(this.messageCode.duplicateCheck);
        return;
      }
 
      this.save(this.modelSvc.lockVoucherDTO);

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private save(lockVoucherDTO: LockVoucherDTO) {
    try {
      let messageCode = lockVoucherDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
      let isEdit = lockVoucherDTO.id ? true : false;

      this.dataSvc.saveLockVoucher(lockVoucherDTO).subscribe({ 
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
      if (this.lockVoucherForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.prepareforEdit(entity);
              setTimeout(() => {
                this.lockVoucherForm.form.markAsPristine();
              }, 50);
            }
          });
      } else {
        this.prepareforEdit(entity);
        setTimeout(() => {
          this.lockVoucherForm.form.markAsPristine();
        }, 50);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  prepareforEdit(entity: any) {
    try {
      this.modelSvc.lockVoucherDTO.companyID = entity.companyID;
      this.onChangeCompany();

      setTimeout(() => {
        this.modelSvc.lockVoucherDTO.orgID = entity.orgID;
        this.onChangeOffice();
      }, 70);

      setTimeout(() => {
        this.modelSvc.prepareEditForm(entity);
      }, 100);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  delete(entity: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.remove(entity.id).subscribe({
              next: (res: any) => { 
                this.modelSvc.deleteCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.initGridOption();
                this.gridOption.totalRecords = this.modelSvc.lockVoucherList.length;
                if (entity.id == this.modelSvc.tempLockVoucherDTO.id) {
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
      this.modelSvc.lockVoucherDTO = new LockVoucherDTO();
      this.formResetByDefaultValue(this.lockVoucherForm.form, this.modelSvc.lockVoucherDTO);
      this.focus(this.lockVoucherForm.form, 'LockVoucher');
      this.modelSvc.isCompanyDisabled = false;
      this.modelSvc.isOfficeDisabled = false;
      this.modelSvc.isProjectDisabled = false;
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.focus(this.lockVoucherForm.form, "LockVoucher");
      if (this.modelSvc.lockVoucherDTO.id > 0) {
        this.lockVoucherForm.form.markAsPristine();
        this.formResetByDefaultValue(this.lockVoucherForm.form, this.modelSvc.tempLockVoucherDTO);
      } 
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  onChangeDate()
  {
    try {
      this.lockVoucherForm.form.markAsDirty();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  
  // sendSMS(){
  //   const smsList = [
  //     { 
  //       VoucherID : 100000000000112, 
  //       Amount: 52200.00, 
  //       Currency: "BDT",
  //       OrgID: 101,
  //       CompanyName: "Next IT",
  //       Email:"shah@nextit.com",
  //       MobileNo:"01752135126",
  //       TemplateName:"SMSTemplate",
  //       LocationID: 1,
  //       CreatedByID: 1001
  //     },
  //     { 
  //       VoucherID : 100000000000113, 
  //       Amount: 52200.00, 
  //       Currency: "BDT",
  //       OrgID: 101,
  //       CompanyName: "Winbes",
  //       Email:"winbes@nextit.com",
  //       MobileNo:"01752135126",
  //       TemplateName:"SMSTemplate",
  //       LocationID: 1,
  //       CreatedByID: 1001
  //     },
  //   ];

  //   this.commonSvc.sendSMS(smsList).subscribe({
  //     next: (res: any) => {
  //     },
  //     error: (res: any) => {
  //       this.showErrorMsg(res);
  //     },
  //     complete: () => { },
  //   });
  // }

}
