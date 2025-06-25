import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalConstants, ValidatorDirective } from '../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  QueryData,
} from '../index';
import { OrgService } from "src/app/app-shared/services/org.service";
import { ChequeBookModelService } from "../services/cheque-book/cheque-book-model.service";
import { ChequeBookDataService } from "../services/cheque-book/cheque-book-data.service";
import { ChequeBookDTO, chequeBookValidation } from "../models/cheque-book/cheque-book";
import { SharedModule } from "src/app/shared/shared.module";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";

@Component({
  selector: 'app-cheque-book',
  templateUrl: './cheque-book.component.html',
  providers: [ChequeBookDataService, ChequeBookModelService],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class ChequeBookComponent extends BaseComponent implements OnInit {

  gridOption: GridOption;
  spData: any = new QueryData();
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("chequeBookForm", { static: true, read: NgForm }) chequeBookForm: NgForm;
  public validationMsgObj: any;
  banks: any = [];
  branchList: any = [];

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ChequeBookModelService,
    private dataSvc: ChequeBookDataService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    public coreAccService: CoreAccountingService,
  ) {
    super(providerSvc);
    this.validationMsgObj = chequeBookValidation();
  }

  ngOnInit(): void {
    this.modelSvc.chequeBookDTO = new ChequeBookDTO();
    this.modelSvc.chequeBookDTO.companyID = GlobalConstants.userInfo.companyID;
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.chequeTypeList = FixedIDs.getList(FixedIDs.chequeTypeDrop);
    this.getDefaultData();
  }

  getDefaultData() {
    try {
      this.getChequeBookList(true);
      this.getCompanyList();
      this.getChequeBankAccountList();
      this.initGridOption();
    } catch (error) {
      throw error;
    }
  }

  getChequeBookList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getChequeBookList(this.spData).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);

          let data = res[res.length - 1] || [];
          this.modelSvc.chequeBookList = data;
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
          if (this.modelSvc.isBranchModuleActive) {
            this.getOfficeBranchList(this.modelSvc.chequeBookDTO.companyID);

          }
          if (this.modelSvc.isProjectModuleActive) {
            this.getProjectList(this.modelSvc.chequeBookDTO.companyID);
          }

          if (this.modelSvc.companyList.length == 1) {
            this.modelSvc.chequeBookDTO.companyID = this.modelSvc.companyList[0].id;
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

  getChequeBankAccountList() {
    try {
      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getChequeBankAccountList(spData, this.modelSvc.chequeBookDTO.orgID, this.modelSvc.chequeBookDTO.projectID).subscribe({
        next: (res: any) => {
          this.modelSvc.bankAccountList = res[res.length - 1] || [];
          if (this.modelSvc.bankAccountList.length == 1) {
            this.modelSvc.chequeBookDTO.cOAStructureID = this.modelSvc.bankAccountList[0].id;
          }
          this.banks = res[res.length - 1] || [];
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

  getProjectList(companyId: any) {
    try {
      this.coreAccService
        .getProject(companyId)
        .subscribe({
          next: (res: any) => {
            this.modelSvc.projectList = res || [];
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany() {
    try {
      this.modelSvc.chequeBookDTO.orgID = null;
      if (this.modelSvc.isBranchModuleActive) {
        this.getOfficeBranchList(this.modelSvc.chequeBookDTO.companyID);
        //this.chequeBookForm.form.markAsPristine();
        
       }
      if (this.modelSvc.isProjectModuleActive) {
        this.getProjectList(this.modelSvc.chequeBookDTO.companyID);
      }
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getOfficeBranchList(companyId: any) {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString(), companyId).subscribe({
        next: (res: any) => {
          this.branchList = res || [];
          if (this.branchList.length == 1) {
            this.modelSvc.chequeBookDTO.orgID = this.branchList[0].id;
          }
          if(this.branchList.length == 0){
          this.modelSvc.chequeBookDTO.orgID = null;

          }
         
          this.getChequeBankAccountList();
          this.modelSvc.officeBranchUnitList = this.modelSvc.prepareOfficeBranchUnit(res || []).categories;
          //this.formResetByDefaultValue(this.chequeBookForm.form, this.modelSvc.chequeBookDTO);
          
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

  onSelectOrg() {
    try {
      this.getChequeBankAccountList();

    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  onSelectProject() {
    try {

      this.getChequeBankAccountList();

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChequeEndNumber() {
    try {debugger
      let startNo = this.modelSvc.chequeBookDTO.leafStartNo == null ? 0 : Number(this.modelSvc.chequeBookDTO.leafStartNo);
      let noOfLeaf = this.modelSvc.chequeBookDTO.noOfLeaf == null ? 0 : Number(this.modelSvc.chequeBookDTO.noOfLeaf);
      this.modelSvc.chequeBookDTO.leafEndNo = startNo == 0 && noOfLeaf == 0 ? null :  startNo + (noOfLeaf - 1);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.chequeBookList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["chequebooklist"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "company", header: this.fieldTitle['company'], isDDFilter: true, dataList: this.modelSvc.companyDDList, labelField: 'company' },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "org", header: this.fieldTitle['unit/branch'], isDDFilter: true, dataList: this.modelSvc.officeBranchUnitDDList, labelField: 'org' }] : []),
      ...(this.modelSvc.isProjectModuleActive ? [{ field: "project", header: this.fieldTitle['project'], isDDFilter: true, dataList: this.modelSvc.projectDDList, labelField: 'project' }] : []),
      { field: "bankAccount", header: this.fieldTitle['bankaccount'], isDDFilter: true, dataList: this.modelSvc.bankAccountDDList, labelField: 'bankAccount' },
      { field: "accountName", header: this.fieldTitle['accountholdername'], styleClass: 'd-center' },
      { field: "chequeType", header: this.fieldTitle['chequetype'], isDDFilter: true, dataList: this.modelSvc.chequeTypeDDList, labelField: 'chequeType' },
      { field: "chequeBookNo", header: this.fieldTitle['chequebooknumber'], isDDFilter: true, dataList: this.modelSvc.chequeBookNumberDDList, labelField: 'chequeBookNo' },
      { field: "noOfLeaf", header: this.fieldTitle['noofleaf'], styleClass: 'd-center' },
      { field: "leafStartNo", header: this.fieldTitle['chequeleafnostart'], isDDFilter: true, dataList: this.modelSvc.chequeLeafNoStartDDList, labelField: 'leafStartNo' },
      { field: "leafEndNo", header: this.fieldTitle['chequeleafnoend'], isDDFilter: true, dataList: this.modelSvc.chequeLeafNoEndDDList, labelField: 'leafEndNo' },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass: 'd-center' },
      { header: this.fieldTitle['action'] }
    ]
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("company, company");
      ddlProperties.push("org, org");
      ddlProperties.push("project, project");
      ddlProperties.push("bankAccount, bankAccount");
      ddlProperties.push("chequeType, chequeType");
      ddlProperties.push("chequeBookNo, chequeBookNo");
      ddlProperties.push("leafStartNo, leafStartNo");
      ddlProperties.push("leafEndNo, leafEndNo");

      return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.companyDDList = data[0];
      this.modelSvc.officeBranchUnitDDList = data[1];
      this.modelSvc.projectDDList = data[2];
      this.modelSvc.bankAccountDDList = data[3];
      this.modelSvc.chequeTypeDDList = data[4];
      this.modelSvc.chequeBookNumberDDList = data[5];
      this.modelSvc.chequeLeafNoStartDDList = data[6];
      this.modelSvc.chequeLeafNoEndDDList = data[7];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  refresh() {
    try {
      this.getChequeBookList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveChequeBook(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.save(this.modelSvc.chequeBookDTO);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private save(chequeDTO: ChequeBookDTO) {
    try {
      let messageCode = chequeDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
      //chequeDTO.orgID = chequeDTO.orgID == null ? chequeDTO.companyID : chequeDTO.orgID;
      this.dataSvc.saveChequeBook(chequeDTO).subscribe({
        next: (res: any) => {
          this.modelSvc.chequeBookList.push(res.body);
          this.setNew();
          this.showMsg(messageCode);
        },
        error: (res: any) => {
          if (res.error.messageCode == this.messageCode.duplicateEntry) {
            this.showMsg(this.messageCode.duplicateEntry);
          }
          else {
            this.showErrorMsg(res);
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(entity: any) {
    try {debugger
      if (this.chequeBookForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              // this.getOfficeBranchList(entity.companyID);
              // this.getChequeBankAccountList();
              this.modelSvc.prepareEditForm(entity);
              this.chequeBookForm.form.markAsPristine();
              this.formResetByDefaultValue(this.chequeBookForm.form, this.modelSvc.chequeBookDTO);
            }
          });
      } else {
        // this.getOfficeBranchList(entity.companyID);
        // this.getChequeBankAccountList();
        this.modelSvc.prepareEditForm(entity);
        this.chequeBookForm.form.markAsPristine();
        this.formResetByDefaultValue(this.chequeBookForm.form, this.modelSvc.chequeBookDTO);
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
            this.dataSvc.remove(entity.id).subscribe({
              next: (res: any) => {
                this.modelSvc.deleteCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.initGridOption();
                this.gridOption.totalRecords = this.modelSvc.chequeBookList.length;
                if (entity.id == this.modelSvc.tempchequeBookDTO.id) {
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
      this.modelSvc.chequeBookDTO = new ChequeBookDTO();
      this.modelSvc.chequeBookDTO.companyID = GlobalConstants.userInfo.companyID;
      this.getDefaultData();
      this.formResetByDefaultValue(this.chequeBookForm.form, this.modelSvc.chequeBookDTO);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      if (this.modelSvc.chequeBookDTO.id > 0) {
        this.getDefaultData();
        this.chequeBookForm.form.markAsPristine();
        this.formResetByDefaultValue(this.chequeBookForm.form, this.modelSvc.tempchequeBookDTO);
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