import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { forkJoin, of } from 'rxjs';
import { formatDate } from '@angular/common';
import { noteLedgerValidation } from '../../models/report/report.model';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { NoteLedgerModelService } from '../../services/accounting-report/note-ledger/note-ledger-model.service';
import {
  ProviderService,
  BaseComponent,
  QueryData,
  FixedIDs,
  GlobalMethods,
  GlobalConstants,
  ValidatingObjectFormat,
  AccountingReportDataService,
  ValidatorDirective,
  GridOption,
  ColumnType
} from '../../index';
import { SharedModule } from 'src/app/shared/shared.module';


@Component({
  selector: 'app-note-ledger',
  templateUrl: './note-ledger.component.html',
  providers: [AccountingReportDataService, NoteLedgerModelService],
  standalone:true,
  imports:[SharedModule]
})
export class NoteLedgerComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("searchFilterForm", { static: true, read: NgForm }) searchFilterForm: NgForm;
  spData: any = new QueryData({pageNo:0});
  gridOption: GridOption;
  noteLedgerBalanceGridOption: GridOption;
  isShowNoteLedgerBalance:boolean = false;
  maxDate:Date = null;
  minDate:Date = null;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: NoteLedgerModelService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    private rptService: AccountingReportDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = noteLedgerValidation();
  }
  ngOnInit(): void {
    try {
      this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
      this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.modelSvc.fieldTitle = this.fieldTitle;
      this.initGridOption();
      this.getDefaultData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
      try {
        const gridObj = {
          dataSource: "modelSvc.noteLedgerList",
          columns: this.gridColumns(),
          paginator:false
        } as GridOption;
        this.gridOption = new GridOption(this, gridObj);


        const noteLedgerBalanceObj = {
          dataSource: "modelSvc.noteLedgerBalanceList",
          refreshEvent: this.refreshLedgerBalanceGrid,
          columns: this.noteLedgerBalanceGridColumns(),
          exportOption: {
            exportInPDF: true,
            exportInXL: true,
            exportDataEvent: this.onExport,
            title: this.fieldTitle['noteledger']
          }
        } as GridOption;
        this.noteLedgerBalanceGridOption = new GridOption(this, noteLedgerBalanceObj);


      } catch (e) {
        this.showErrorMsg(e);
      }
  }
  gridColumns(): ColumnType[] {
    return [
      { field: "subGroupLedger", header: this.fieldTitle["subgroupledger"] },
      { field: "noteNo", header: this.fieldTitle["noteno"] },
      { header: this.fieldTitle["action"] },
    ];
  }

  noteLedgerBalanceGridColumns(): ColumnType[] {
      return [
        { field: "serialNo", header: this.fieldTitle["serialno"] },
        { field: "ledger", header: this.fieldTitle["ledgername"] },
        { field: "balance", header: this.fieldTitle["balance"] + " (" + GlobalConstants.companyInfo.currency + ")" },
      ];
    }

   getDefaultData(){
      try {
        forkJoin([
          this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
          this.coreAccountingSvc.getFinancialYear()
        ]).subscribe({
            next: (res: any) => {
              this.modelSvc.companyList = res[0] || [];
              this.modelSvc.financialYearList = res[1] || [];
              this.modelSvc.setNewSearch();

              if(this.modelSvc.companyList.length == 1)
              {
                this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
                this.modelSvc.searchParam.company = this.modelSvc.companyList[0].name;
              }

              this.onChangeCompany();

              if(this.modelSvc.financialYearList.length == 1)
              {
                this.modelSvc.searchParam.financialYearID = this.modelSvc.financialYearList[0].id;
                this.modelSvc.searchParam.financialYear = this.modelSvc.financialYearList[0].name;
                this.onChangeFinancialYear();
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
  onChangeCompany(){
    try {
        let orgType = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
        forkJoin([
          this.orgSvc.getOrgStructure(orgType, this.modelSvc.searchParam.companyID),
          this.coreAccountingSvc.getProject(this.modelSvc.searchParam.companyID),
        ]).subscribe({
          next: (res: any) => { 
            this.modelSvc.officeBranchList = this.modelSvc.prepareOrgList(res[0] || []);
            this.modelSvc.projectList = res[1] || [];  
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
          complete: () => {},
        });
      } catch (error) {
        this.showErrorMsg(error);
      }
    }
  onChangeFinancialYear(){
    try {
      this.maxDate = null;
      this.minDate = null;
      this.modelSvc.searchParam.date = null;
      if(this.modelSvc.searchParam.financialYearID > 0)
      {
        let financialYear = this.modelSvc.financialYearList.find(f => f.id == this.modelSvc.searchParam.financialYearID);

        this.minDate = new Date(financialYear.fromDate);
        this.maxDate = new Date(financialYear.toDate);

        let currentDate = new Date(GlobalConstants.serverDate);
        if(this.maxDate > currentDate)
        {
          this.modelSvc.searchParam.date = currentDate;
        }
        else{
          this.modelSvc.searchParam.date = this.maxDate;
        }
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  onSubmit(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.getNoteLedger();
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }
  
  getNoteLedger() {
    try {
      this.rptService.getNoteLedger(this.spData, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID).subscribe({
        next: (data: any) => {
          this.modelSvc.noteLedgerList = data || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  showLedgerBalance(item:any, isExport?:boolean){
    try {
      this.modelSvc.searchParam.noteNo = item.noteNo;
      this.modelSvc.searchParam.subGroupLedger = item.subGroupLedger;
      if (isExport === undefined) this.isShowNoteLedgerBalance = true; 
      this.getNoteLedgerBalance(isExport);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  sendEmail(reportData: any){
      try {
        this.coreAccountingSvc.getReport(reportData).subscribe({
          next: (res: any) => {
            this.showEmailModal(res.body.message);
          },
          error: (e: any) => {
            this.showErrorMsg(e);
            }
        });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }
        
    showEmailModal(reportName:string){
      try {
        let obj = {
          attachmentName: [],
          moduleName: GlobalConstants.ERP_MODULES.ACM.name,
        };
        obj.attachmentName.push(reportName);
  
        this.dialogSvc.open(EmailSendComponent, {
          data: obj,
          header: this.fieldTitle['mailsendingoption'],
          width: '40%',
          closable:true
        });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }


  reset() {
    try {
      this.modelSvc.setNewSearch();
      this.modelSvc.noteLedgerList = [];
      this.formResetByDefaultValue(this.searchFilterForm.form, this.modelSvc.searchParam);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  refreshLedgerBalanceGrid()
  {
    try {
      this.getNoteLedgerBalance();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getNoteLedgerBalance(isExport?:boolean){
    try {
      this.rptService.getNoteLedgerBalance(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.financialYearID, this.modelSvc.searchParam.date, this.modelSvc.searchParam.noteNo, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID).subscribe({
        next: (data: any) => {
          this.modelSvc.noteLedgerBalanceList = data || [];
          this.modelSvc.prepareTotalBalance();
          if (isExport !== undefined) {
            const reportData = this.preparePrintOption(this.modelSvc.noteLedgerBalanceList);

            if (isExport) {
              this.coreAccountingSvc.printReport(reportData);
            } else {
              this.sendEmail(reportData);
            }
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

   onExport(event: any)
    {
      try {
        let list = GlobalMethods.jsonDeepCopy(this.modelSvc.noteLedgerBalanceList);

        list.forEach(element => {
          element.balance = GlobalMethods.convertToNumberFormat(element.balance, 'en-IN', 2, 2);
        });

        list.push({
          serialNo: null,
          ledger: "Total",
          balance: GlobalMethods.convertToNumberFormat(this.modelSvc.totalBalance, 'en-IN', 2, 2) 
        });
        event.exportOption.title =this.fieldTitle['noteledger'] + "_" + formatDate(this.modelSvc.searchParam.date, "yyyy", "en") + "_" + this.modelSvc.searchParam.company;
        return of({values: list, columns: this.noteLedgerBalanceGridColumns()})
      } catch (e) {
        this.showErrorMsg(e);
      }
    }

  /*********************Print*************************/
  private preparePrintOption(data: any[]) {
    try {
      return{
        reportName: 'NoteLedger',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "SpACM_RptNoteLedgerBalance",
      };
    } catch (e) {
      throw e;
    }
  }








}

