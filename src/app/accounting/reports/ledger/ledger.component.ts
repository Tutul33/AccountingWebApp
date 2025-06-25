import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatorDirective } from 'src/app/app-shared';
import { 
  LedgerModelService,
} from '../../index'
import { GridOption } from 'src/app/shared/models/common.model';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { AccountingReportDataService } from '../../services/accounting-report/accounting-report-data.service';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { formatDate } from '@angular/common';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { ledgerValidation } from '../../models/report/report.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.component.html',
  providers: [AccountingReportDataService, LedgerModelService],
  standalone:true,
  imports:[SharedModule]
})
export class LedgerRptComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("ledgerReportForm", { static: true, read: NgForm }) ledgerReportForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  spData: any = new QueryData();
  isSPParamChange: boolean = false;
  isPlaceholderDisableCompany: boolean = false;
  isPlaceholderDisableLedger: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public dataSvc: AccountingReportDataService,
    public modelSvc: LedgerModelService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,

  ) {
    super(providerSvc);
    this.validationMsgObj = ledgerValidation();
  }

  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.keyValuePair = GlobalMethods.createKeyValuePair;
    this.initGridOption();
    this.getDefaultData();
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.ledgerList",
        getServerData: this.onPage,
        refreshEvent: this.refreshEventHandler,
        filterFromServer:this.filterFromServer,
        lazy: true,
        columns: this.GridColumns(),
        isClear: false,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          exportDataEvent: this.onExportData,
          title: this.fieldTitle['ledger']
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  GridColumns(): ColumnType[] {
    return [
      { field: "date", header: this.fieldTitle["date"] },
      { field: "particulars", header: this.fieldTitle["particulars"] },
      { field: "voucherNo", header: this.fieldTitle["vouchernumber"] },
      { field: "debitVal", header: this.fieldTitle["debit(bdt)"], styleClass:'d-center' },
      { field: "creditVal", header: this.fieldTitle["credit(bdt)"], styleClass:'d-center' },
      { field: "balance", header: this.fieldTitle["balance(bdt)"], styleClass:'d-center' },
    ];
  }

  onPage(event: any, isRefresh: boolean = false) {
    try {
      this.spData.pageNo = this.gridOption.serverPageNumber(event);
      this.spData.pageDataCount = event.rows;
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  refreshEventHandler(isRefresh: boolean = true) {
    try {
      this.spData.pageNo = this.gridOption.resetPageNumber(this.gridOption.first);
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterFromServer(event: any, filters: any[]) {
    try {
      this.spData.searchParams = this.modelSvc.prepareSearchParams();
      this.spData.pageNo = 1;
      this.populateGrid(false);
      this.pageReset(0);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  pageReset(pageNumber: number) {
    try {
      this.gridOption.first = pageNumber;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

    onExportData(event: any) {
      try {
        if (!this.ledgerReportForm.form.valid) {
          this.directive.validateAllFormFields(this.ledgerReportForm.form as UntypedFormGroup);
          return;
        }
        //event.exportOption.title =this.fieldTitle['ledger'] + "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en") + "_" + this.modelSvc.searchParam.companyName;
        event.exportOption.title =this.fieldTitle['ledger'];

        let spData = GlobalMethods.jsonDeepCopy(this.spData);
        spData.pageNo = 0;
  
        return this.dataSvc.getLedgerReport(spData, this.modelSvc.searchParam.companyID,this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID,this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.ledgerID).pipe(
          map((response: any) => {
            return { values: this.prepareDataToExport(response[response.length - 1]), columns: this.GridColumns() }
          })
        );
      } catch (e) {
        this.showErrorMsg(e);
      }
    }
  
    prepareDataToExport(data: any) {
      try {
        let list = GlobalMethods.jsonDeepCopy(data);
        let totalDebit = 0;
        let totalCredit = 0;
        let closeingBalance = 0;
        let fromLedger = null;
        fromLedger = this.modelSvc.searchParam.ledgerName;
        let showDate = formatDate(this.modelSvc.searchParam.toDate, "dd-MM-yyyy", "en");

        totalDebit = Number(list[0].totalDebit);
        totalCredit = Number(list[0].totalCredit);
        closeingBalance = Number(list[0].closingBalance);

        // let tempList = [];
        // let balance = list[0].balance;
  
        // list.forEach(element => {
        //   if(this.modelSvc.accountNatureCd == FixedIDs.accountingNature.Assets || this.modelSvc.accountNatureCd == FixedIDs.accountingNature.Expenses)
        //   {
        //     balance += element.debitVal - element.creditVal;
        //     element.balance = balance;
        //   }
        //   else if(this.modelSvc.accountNatureCd == FixedIDs.accountingNature.Liabilities || this.modelSvc.accountNatureCd == FixedIDs.accountingNature.Income)
        //   {
        //     balance += element.creditVal - element.debitVal;
        //     element.balance = balance;
        //   }
        //   tempList.push(element);
        //   totalDebit += Number(element.debitVal);
        //   totalCredit += Number(element.creditVal);
        // });
  
        // closeingBalance = balance;

        // list = [];
        // list = tempList;
  
        // list.push(
        //   { date: this.fieldTitle['transactionalbalance'], debitVal: totalDebit.toFixed(2), creditVal: totalCredit.toFixed(2) },
        // )
  
        // list.push(
        //   { date: this.fieldTitle['closingbalance'] + ':(' + fromLedger + ':' + showDate + ')', balance: closeingBalance.toFixed(2) },
        // )
  
        // list.forEach(element => {
        //   if (element.debitVal != null) {
        //     element.debitVal = Number(element.debitVal).toFixed(2);
        //   }
        //   if (element.creditVal != null) {
        //     element.creditVal = Number(element.creditVal).toFixed(2);
        //   }
        //   if (element.balance != null) {
        //     element.balance = Number(element.balance).toFixed(2);
        //   }
        // });
  
        list.forEach(element => {
          if (element.debitVal != null) {
            element.debitVal = Number(element.debitVal).toFixed(2);
          }
          if (element.creditVal != null) {
            element.creditVal = Number(element.creditVal).toFixed(2);
          }
          if (element.balance != null) {
            element.balance = Number(element.balance).toFixed(2);
          }
        });

        list.push(
          { date: this.fieldTitle['transactionalbalance'], debitVal: totalDebit.toFixed(2), creditVal: totalCredit.toFixed(2) },
        )
  
        list.push(
          { date: this.fieldTitle['closingbalance'] + ':(' + fromLedger + ':' + showDate + ')', balance: closeingBalance.toFixed(2) },
        )
        return list;
      } catch (e) {
        this.showErrorMsg(e);
      }
    }


  getDefaultData() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res || [];

          this.modelSvc.setNewSearchParam();
          this.onChangeCompany();
          this.getLedgerRptList();
          this.getLedgerList();
          // setTimeout(() => {
          //   this.preparePlaceholderData();
          // }, 50);
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

  preparePlaceholderData() {
    try {
      if(this.modelSvc.companyList.length == 1) {
        this.isPlaceholderDisableCompany = true;
      }
      else
      {
        this.isPlaceholderDisableCompany = false;
      }
      if(this.modelSvc.ledgerNameList.length == 1) {
        this.isPlaceholderDisableLedger = true;
      }
      else
      {
        this.isPlaceholderDisableLedger = false;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany() {
    try {
      this.onChangeSPParameterData();

      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      forkJoin([
        this.orgSvc.getOrgStructure(elementCode, this.modelSvc.searchParam.companyID),
        this.coreAccountingSvc.getProject(this.modelSvc.searchParam.companyID),
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareOfficeBranchUnitList(res[0] || []);
          this.modelSvc.projectList = res[1] || [];
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

  getLedgerList() {
    try {
      this.onChangeSPParameterData();
      this.modelSvc.searchParam.ledgerID = null;
      this.modelSvc.searchParam.ledgerName = null;
      this.coreAccountingSvc.getCOAStructure(this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID).subscribe({
        next: (res: any) => {
          let results = res || [];
          this.modelSvc.prepareLegdreNameList(results);
          this.preparePlaceholderData();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeFromDate() {
    try {
      
       this.onChangeSPParameterData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeToDate() {
    try {
      this.onChangeSPParameterData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeGroupLedger() {
    try {
      this.modelSvc.accountNatureCd = this.modelSvc.ledgerNameList.find(x => x.id == this.modelSvc.searchParam.ledgerID).accountNatureCd;
      this.onChangeSPParameterData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeSPParameterData() {
    try {
      if(this.modelSvc.searchParam.orgID == null)
      {
        this.modelSvc.searchParam.unitBranch = null;
      }
      if(this.modelSvc.searchParam.projectID == null)
      {
        this.modelSvc.searchParam.project = null;
      }
      
      this.isSPParamChange = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  search(form: NgForm){
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.ledgerReportForm.form);
        return;
      }

      this.spData.searchParams = this.modelSvc.prepareSearchParams();
      this.spData.pageNo = 1;
      this.pageReset(0);

      if(this.isSPParamChange) { 
        this.populateGrid(true);
      }
      else {
        this.populateGrid(false);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  populateGrid(isRefresh: boolean) {
    try {
      this.spData.isRefresh = isRefresh;
      this.dataSvc.getLedgerReport(this.spData, this.modelSvc.searchParam.companyID,this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.ledgerID).subscribe({
        next: (res: any) => {
          this.modelSvc.ledgerList = res[res.length - 1] || [];
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isSPParamChange = false;


          if (this.modelSvc.ledgerList.length > 0) {
            this.modelSvc.prepareGridData();
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {
          this.spData.isRefresh = false;
          this.isSPParamChange = false;
          if (this.modelSvc.ledgerList.length == 0) {
            this.modelSvc.totalDebit = 0;
            this.modelSvc.totalCredit = 0;
            this.modelSvc.closeingBalance = 0;
            this.modelSvc.fromLedger = null;
            this.modelSvc.showDate = null;
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset(){
    try {
      this.modelSvc.setNewSearchParam();
      this.onChangeCompany();
      this.getLedgerList();
      this.modelSvc.ledgerList = [];
      this.modelSvc.totalCredit = 0;
      this.modelSvc.totalDebit = 0;
      this.modelSvc.closeingBalance = 0;
      this.modelSvc.fromLedger = null;
      this.modelSvc.showDate = null;
      this.gridOption.totalRecords = 0;

      this.formResetByDefaultValue(this.ledgerReportForm.form, this.modelSvc.searchParam);
      this.ledgerReportForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  getLedgerRptList() {
    try {
      this.spData = new QueryData({
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'ledgerRpt',
        pageNo: 1
      });
    } catch (error) {
      this.showMsg(error);
    }
  }

  /*********************Print and mail*************************/
  onExport(form: NgForm, isExport: boolean) {
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.ledgerReportForm.form);
        return;
      }
      
      let spData = GlobalMethods.jsonDeepCopy(this.spData);
      spData.pageNo = 0;
      this.dataSvc.getLedgerReport(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.ledgerID).subscribe({
        next: (res: any) => {
          this.modelSvc.searchParam.ledgerName = this.modelSvc.ledgerNameList.find(x=>x.id == this.modelSvc.searchParam.ledgerID)?.ledger;
          let ledgerList = res[res.length - 1] || [];
          if (ledgerList.length > 0) {
            this.modelSvc.prepareRptData(ledgerList);
          }
          let reportData = this.prepareReportOption(ledgerList);
          if (isExport) {
            this.coreAccountingSvc.printReport(reportData);
          } else {
            this.sendEmail(reportData);
          }
        },
        error: (res: any) => { },
      });
    } catch (e) {
      throw e;
    }
  }

  private prepareReportOption(data: any[]) {
    try {
      return {
        reportName: 'Ledger',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "SpACM_RptLedger",
      };
    } catch (e) {
      throw e;
    }
  }

  sendEmail(reportData: any) {
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

  showEmailModal(reportName: string) {
    try {
      let obj = {
        attachmentName: [],
        moduleName: GlobalConstants.ERP_MODULES.ACM.name,
      };
      obj.attachmentName.push(reportName);

      this.dialogSvc.open(EmailSendComponent, {
        data: obj,
        header: this.fieldTitle['mailsendingoption'],
        width: '40%'
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

}

