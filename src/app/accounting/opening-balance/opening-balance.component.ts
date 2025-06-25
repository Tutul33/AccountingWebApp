import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { FileUploadComponent } from 'src/app/shared';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { OpeningBalanceDataService } from '../services/opening-balance/opening-balance-data.service';
import { OpeningBalanceModelService } from '../services/opening-balance/opening-balance-model.service';
import { FileOption, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { LedgerSummary, LedgerSummaryDetail, OpeningBalanceValidation } from '../models/opening-balance/opening-balance';
import { formatDate } from '@angular/common';
import { forkJoin } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-opening-balance',
  templateUrl: './opening-balance.component.html',
  providers: [OpeningBalanceModelService, OpeningBalanceDataService],
  standalone:true,
  imports:[SharedModule]
})
export class OpeningBalanceComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("openingBalanceForm", { static: true, read: NgForm }) openingBalanceForm: NgForm;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  gridOption: GridOption;
  isSubmitted: boolean = false;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: OpeningBalanceModelService,
    public dataSvc: OpeningBalanceDataService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    public coreAccService: CoreAccountingService,
  ) {
    super(providerSvc);
    this.validationMsgObj = OpeningBalanceValidation();
  }

  ngOnInit(): void {
    this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.getDefaultData();
    this.initGridOption();
  }

   getDefaultData(){
        try {
          forkJoin([
            this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString(), ''),
            this.coreAccService.getFinancialYear(),
            this.coreAccService.getCOAStructure(null),
            this.coreAccService.getSubLedgerDetail(null)
          ]).subscribe({
              next: (res: any) => {
                this.modelSvc.companyList = res[0];
                this.modelSvc.ledgerSummaryDTO.companyID = GlobalConstants.userInfo.companyID;
                if(this.modelSvc.ledgerSummaryDTO.companyID == null &&  this.modelSvc.companyList.length == 1){
                  this.modelSvc.ledgerSummaryDTO.companyID = this.modelSvc.companyList[0].id;
                }

              let financialYearList = res[1];
              if (financialYearList.length > 0) {
                let countCloseStatus = 0;
                financialYearList.forEach(element => {
                  if (element.status == 12) {
                    countCloseStatus++;
                    if (countCloseStatus == 2) {
                      this.isClose = true;
                    }
                  }
                });
              }else{
                this.isClose = true;
              }

              if(this.isClose)
              {
                this.showMsg('2263');
              }
              else{
                this.modelSvc.financialYearTitle = financialYearList[0].name;
                this.modelSvc.financialYearID = financialYearList[0].id;
                this.modelSvc.financialYearEndDate = formatDate(financialYearList[0].toDate, FixedIDs.fixedIDs.format.dateFormat, "en");
              }

              var ledgerData = res[2];
              this.modelSvc.ledgerList = ledgerData.filter(x => x.accountNatureCd == FixedIDs.accountingNature.Assets || x.accountNatureCd == FixedIDs.accountingNature.Liabilities || x.accountNatureCd == FixedIDs.accountingNature.Equity);

              this.modelSvc.subLedgerList = res[3] || [];


              if(this.modelSvc.ledgerSummaryDTO.companyID > 0)
                {
                  this.onSelectToCompany();
                }
                else{
                  this.modelSvc.initiate();
                }
                },
                error: (res: any) => {
                  this.showErrorMsg(res);
                },
              });
        } catch (e) {
          this.showErrorMsg(e);
        }
  }


  ngAfterViewInit() {
    try {
      this.modelSvc.openingBalanceForm = this.openingBalanceForm.form;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList",
        columns: this.gridColumns(),
        paginator: false,
        isGlobalSearch: false,
        exportOption: {
          exportInPDF: false,
          exportInXL: false,
          title: "",
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    try {
      return [
        { field: "cOAStructureID", header: this.fieldTitle["fromaccountname"], isRequired: true },
        { field: "subLedgerDetailID", header: this.fieldTitle["subledger"] },
        { field: "debitVal", header: this.fieldTitle["debit(bdt)"], isRequired: true },
        { field: "creditVal", header: this.fieldTitle["credit(bdt)"], isRequired: true },
        { field: "", header: this.fieldTitle["action"] },
      ];
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSubmit(openingBalanceForm: NgForm) {
    try {
      this.modelSvc.checkDebitCreditZero();
      if (!openingBalanceForm.valid) {
        this.directive.validateAllFormFields(
          openingBalanceForm.form as UntypedFormGroup
        );
        return;
      }
      //check empty list
      if (this.modelSvc.checkEmptyList()) {
        this.showMsg(this.messageCode.emptyList);
        return;
      }

      if(this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList.length > 0){
        this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList = this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList.filter(x=>x.cOAStructureID !=null);
      }

      //check duplicate
      if (this.modelSvc.checkDuplicateByProperty(this.modelSvc.ledgerSummaryDTO.ledgerSummaryDetailList, 'cOAStructureID', 'subLedgerDetailID')) {
        this.showMsg(this.messageCode.duplicateCheck);
        return;
      }
      this.modelSvc.ledgerSummaryDTO.locationID = GlobalConstants.userInfo.locationID;
      this.modelSvc.ledgerSummaryDTO.InsertUserID = GlobalConstants.userInfo.userPKID;
      this.save(this.modelSvc.ledgerSummaryDTO);

    } catch (error) {

    }
  }

  private save(ledgerSummaryDTO: any) {
    try {
      this.isSubmitted = true;
      let messageCode = ledgerSummaryDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
      this.dataSvc.save(ledgerSummaryDTO).subscribe({
        next: (res: any) => {
          if (res.body) {
            this.modelSvc.ledgerSummaryDTO = new LedgerSummary(res.body);
            this.showMsg(messageCode);
            this.modelSvc.openingBalanceForm.markAsPristine();
            this.isSubmitted = false;
          }
        },
        error: (res: any) => {
          this.isSubmitted = false;
          this.showErrorMsg(res);
          this.isSubmitted = false;
        },
        complete: () => {
          this.isSubmitted = false;
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  fileUploadModal(item: LedgerSummary) {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = this.fieldTitle["fileupload"];
      modalConfig.closable = false;
      modalConfig.data = {
        uploadOption: item.imageFileUploadOpton,
        targetObjectList: item.ledgerSummaryAttachmnetList,
      };

      this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.modelSvc.ledgerSummaryDTO.ledgerSummaryAttachmnetList = item.ledgerSummaryAttachmnetList;
          if (data) {
            this.modelSvc.openingBalanceForm.markAsDirty();
          }
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onReset() {
    try {
      if (this.modelSvc.ledgerSummaryDTO.id > 0) {
        this.getOpeningBalanceByCorrespondingID();
      } else {
        this.isSubmitted = false;
        this.modelSvc.totalCredit = 0;
        this.modelSvc.totalDebit = 0;
        this.modelSvc.onReset();
        this.modelSvc.ledgerSummaryDTO.companyID = GlobalConstants.userInfo.companyID;
        if(this.modelSvc.ledgerSummaryDTO.companyID == null &&  this.modelSvc.companyList.length == 1){
          this.modelSvc.ledgerSummaryDTO.companyID = this.modelSvc.companyList[0].id;
        }
        this.formResetByDefaultValue(this.openingBalanceForm.form, this.modelSvc.ledgerSummaryDTO);
        this.modelSvc.addNewItem();
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getOpeningBalanceByCorrespondingID() {
    try {
      let comId = this.modelSvc.ledgerSummaryDTO.companyID;
      let proId = this.modelSvc.ledgerSummaryDTO.projectID;
      let orgId = this.modelSvc.ledgerSummaryDTO.orgID;
      
      this.dataSvc.getOpeningBalanceByCorrespondingID(this.spData, this.modelSvc.ledgerSummaryDTO.companyID, this.modelSvc.ledgerSummaryDTO.orgID, this.modelSvc.ledgerSummaryDTO.projectID).subscribe({
        next: (res: any) => {
            if (res != null) {
            if (res.id > 0) {
              this.modelSvc.ledgerSummaryDTO = res;
              this.modelSvc.ledgerSummaryDTO.name =  this.modelSvc. financialYearTitle;
              this.modelSvc.ledgerSummaryDTO.financialYearID =  this.modelSvc. financialYearID;
              this.modelSvc.ledgerSummaryDTO.financialDate =  this.modelSvc. financialYearEndDate;
              this.modelSvc.ledgerSummaryDTO.imageFileUploadOpton = this.modelSvc.imageFileUploadOption();
              if(res.ledgerSummaryDetailList.length ==0){
                this.modelSvc.addNewItem();
              }
            }
          } else {
            this.modelSvc.ledgerSummaryDTO = new LedgerSummary();
            this.modelSvc.ledgerSummaryDTO.companyID = comId;
            this.modelSvc.ledgerSummaryDTO.orgID = orgId;
            this.modelSvc.ledgerSummaryDTO.projectID = proId;
            this.modelSvc.ledgerSummaryDTO.name =  this.modelSvc. financialYearTitle;
            this.modelSvc.ledgerSummaryDTO.financialYearID =  this.modelSvc. financialYearID;
            this.modelSvc.ledgerSummaryDTO.financialDate =  this.modelSvc. financialYearEndDate;
            this.modelSvc.addNewItem();
          }
        
          this.modelSvc.checkTotalValue();
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
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString(), companyId).subscribe({
        next: (res: any) => {
          this.branchList = res || [];
          if(this.branchList.length ==1){
            this.modelSvc.ledgerSummaryDTO.orgID = this.branchList[0].id;
            this.formResetByDefaultValue(this.openingBalanceForm.form,this.modelSvc.ledgerSummaryDTO);
            this.getOpeningBalanceByCorrespondingID();
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
      this.modelSvc.totalCredit = 0;
      this.modelSvc.totalDebit = 0;
      if(this.isBranchModuleActive){
      this.getOfficeBranchList(this.modelSvc.ledgerSummaryDTO.companyID);
      }
      this.getProjectList(this.modelSvc.ledgerSummaryDTO.companyID);
      this.getOpeningBalanceByCorrespondingID();

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectProject(item) {
    try {
      //this.modelSvc.ledgerSummaryDTO.orgID = null;
      if (this.modelSvc.ledgerSummaryDTO.companyID != null) {
        this.getOpeningBalanceByCorrespondingID();
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectOrg(item) {
    try {
      //this.modelSvc.ledgerSummaryDTO.projectID = null;
      if (this.modelSvc.ledgerSummaryDTO.companyID != null) {
        this.getOpeningBalanceByCorrespondingID();
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectLedger(item) {
    try {
      item.subLedgerTypeID = this.modelSvc.ledgerList.find(x => x.id == item.cOAStructureID)?.subLedgerTypeID;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  onDebitFieldChange(entity: any) {
    try {
      this.modelSvc.onDebitFieldChange(entity);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onCreditFieldChange(entity: any) {
    try {
      this.modelSvc.onCreditFieldChange(entity);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onRemoveLedgerSummaryDetail(item: any) {
    try {
      this.modelSvc.removeLedgerSummaryDetail(item);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addNewItem() {
    try {
      this.modelSvc.addNewItem();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  isClose: boolean = false;


}


