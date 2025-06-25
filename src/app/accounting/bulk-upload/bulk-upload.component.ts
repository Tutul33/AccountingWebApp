import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, FixedIDs, GlobalConstants, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { ModalService } from 'src/app/shared';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OpeningBalanceModelService } from '../services/opening-balance/opening-balance-model.service';
import { OpeningBalanceDataService } from '../services/opening-balance/opening-balance-data.service';
import { LedgerSummary, OpeningBalanceBulkUploadValidation } from '../models/opening-balance/opening-balance';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { ColumnType, FileOption, GridOption } from 'src/app/shared/models/common.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  providers: [OpeningBalanceModelService, OpeningBalanceDataService, ModalService],
  standalone:true,
  imports:[
   SharedModule
  ]
})
export class BulkUploadComponent extends BaseComponent implements OnInit {

  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("openingBalanceForm", { static: true, read: NgForm }) openingBalanceForm: NgForm;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  fileName: string;
  dataList: any=[];
  gridOption: GridOption;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: OpeningBalanceModelService,
    public modalService: ModalService,
    public dataSvc: OpeningBalanceDataService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    public coreAccService: CoreAccountingService,
  ) {
    super(providerSvc);
    this.validationMsgObj = OpeningBalanceBulkUploadValidation();
  }

  ngOnInit(): void {
    this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.getFinancialYearDate();
    this.getCompanyList();
    this.modelSvc.ledgerSummaryDTO = new LedgerSummary();
    this.modelSvc.fileUpload = this.modelSvc.fileUploadOption();
    this.modelSvc.configFilePath();
  
  }

  getFinancialYearDate() {
    try {
      this.coreAccService.getFinancialYear().subscribe({
        next: (res: any) => {
          let results = res || [];
          if (results.length > 0) {
            this.modelSvc.ledgerSummaryDTO.name = results[0].name;
            this.modelSvc.ledgerSummaryDTO.year = results[0].year;
            this.modelSvc.ledgerSummaryDTO.financialYearID = results[0].id;
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

  getCompanyList() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString(), '').subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res;
          this.modelSvc.ledgerSummaryDTO.companyID = GlobalConstants.userInfo.companyID;
          if(this.modelSvc.ledgerSummaryDTO.companyID == null &&  this.modelSvc.companyList.length == 1){
            this.modelSvc.ledgerSummaryDTO.companyID =res[0].id;
          }
          if(this.isBranchModuleActive){
            this.getOfficeBranchList(GlobalConstants.userInfo.companyID);
          }
          this.getProjectList(GlobalConstants.userInfo.companyID);
          this.getOrgAndProjectCOAList();

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

  branchList:any;
  getOfficeBranchList(companyId: any) {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString(), companyId).subscribe({
        next: (res: any) => {
          this.branchList = res || [];
          if(this.branchList.length ==1){
            this.modelSvc.ledgerSummaryDTO.orgID = this.branchList[0].id;
            this.getOrgAndProjectCOAList();
            this.formResetByDefaultValue(this.openingBalanceForm.form,this.modelSvc.ledgerSummaryDTO);
          }
          this.modelSvc.officeBranchList = this.modelSvc.prepareOfficeBranchUnit(res || []).categories;
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

  onSelectToCompany() {
    try {
      this.modelSvc.projectList = [];
      this.modelSvc.officeBranchList = [];
      if(this.isBranchModuleActive){
      this.getOfficeBranchList(this.modelSvc.ledgerSummaryDTO.companyID);
      }
      this.getProjectList(this.modelSvc.ledgerSummaryDTO.companyID);
      this.getOrgAndProjectCOAList();

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getOrgAndProjectCOAList() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgAndProjectCOAList(this.spData, this.modelSvc.ledgerSummaryDTO.companyID, this.modelSvc.ledgerSummaryDTO.orgID, this.modelSvc.ledgerSummaryDTO.projectID).subscribe({
        next: (res: any) => {
          if (res != null) {
            this.dataList = res[res.length - 1];
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

  onSelectProject(item) {
    try {
      if (this.modelSvc.ledgerSummaryDTO.companyID != null) {
        this.getOrgAndProjectCOAList();

      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  onSelectOrg(item) {
    try {
      if (this.modelSvc.ledgerSummaryDTO.companyID != null) {
        this.getOrgAndProjectCOAList();
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  closeModal() {
    try {
      if (this.modalService.isModal) {
        this.modalService.close();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  exportToExcel(): void {
    try {
debugger
      this.initGridOption();
      this.gridOption.exportOption.title = this.fieldTitle['openingbalanceimport(template)'];
      
      if(this.dataList.length >0){
        this.dataList.forEach(element=>{
          element.year =this.modelSvc.ledgerSummaryDTO.name;
        })
      }
      
      this.modelSvc.exportCSVReport( this.gridOption,this.dataList, this.gridOption.columns);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "dataList",
        columns: this.GridColumns(),
        paginator: true,
        isGlobalSearch: false,
        exportOption: {
          exportInPDF: false,
          exportInXL: true,
          title: "",
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  GridColumns(): ColumnType[] {

    let list = [
      { field: "company", header: this.fieldTitle["company"] }];
    if (this.modelSvc.ledgerSummaryDTO.orgID && this.modelSvc.ledgerSummaryDTO.projectID) {
      list.push({ field: "branchOffice", header: this.fieldTitle["unitbranch"] },
        { field: "project", header: this.fieldTitle["project"] });
    } else if (this.modelSvc.ledgerSummaryDTO.orgID) {
      list.push({ field: "branchOffice", header: this.fieldTitle["unitbranch"] });
    } else if (this.modelSvc.ledgerSummaryDTO.projectID) {
      list.push({ field: "project", header: this.fieldTitle["project"] });
    }
    list.push(
      { field: "year", header: this.fieldTitle["year"] },
      { field: "accountsNature", header: this.fieldTitle["exaccountnature"] },
      { field: "groupLedger", header: this.fieldTitle["exgroupledger"] },
      { field: "subGroupLedger", header: this.fieldTitle["exsubgroupledger"] },
      { field: "controlLedger", header: this.fieldTitle["excontrolledgername"] },
      { field: "ledger", header: this.fieldTitle["exledgername"] },
      { field: "debit", header: this.fieldTitle["debit"] },
      { field: "credit", header: this.fieldTitle["credit"] }
    )
    return list;
  }

  fileUploadModal() {
    try {
      this.fileName = this.modelSvc.dataSourceAttachment.imageFile.fileName;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onRemoveImage() {
    try {
      this.modelSvc.dataSourceAttachment.imageFile.id = 0;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveBulkUpload(openingBalanceForm: NgForm) {
    try {

      if (!openingBalanceForm.valid) {
        this.directive.validateAllFormFields(
          openingBalanceForm.form as UntypedFormGroup
        );
        return;
      }
      let messageCode = this.messageCode.saveCode;
      this.modelSvc.prepareBulkUpload();
      this.dataSvc
        .saveBulkUpload(this.spData, this.modelSvc.newFileInfo)
        .subscribe({
          next: (res: any) => {
            if (res.id != 0) {
              this.showMsg(messageCode);
              this.modalService.close(res);
            }
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
