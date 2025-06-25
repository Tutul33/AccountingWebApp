import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatorDirective } from 'src/app/app-shared';
import { GridOption } from 'src/app/shared/models/common.model';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { AccountingReportDataService } from '../../services/accounting-report/accounting-report-data.service';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CashBookModelService } from '../..';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-cash-book',
  templateUrl: './cash-book.component.html',
  providers: [AccountingReportDataService, CashBookModelService],
  standalone:true,
  imports:[SharedModule]
})
export class CashBookComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive;
  @ViewChild("cashBookListForm", { static: true, read: NgForm }) cashBookListForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  spData: any = new QueryData();
  isRefresh: boolean = true;
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public dataSvc: AccountingReportDataService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    public modelSvc: CashBookModelService

  ) {
    super(providerSvc);
    this.validationMsgObj = this.modelSvc.formValidation();
  }

  ngOnInit(): void {
    this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.getDefaultData();
    this.initGridOption();

  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.cashBookList",
        getServerData: this.onPage,
        refreshEvent: this.refreshEventHandler,
        filterFromServer: this.filterFromServer,
        lazy: true,
        columns: this.GridColumns(),
        isClear: false,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          exportDataEvent: this.onExportData,
          title: this.fieldTitle['cashbook']
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
      { field: "debitVal", header: this.fieldTitle["debit(bdt)"], styleClass: 'd-center' },
      { field: "creditVal", header: this.fieldTitle["credit(bdt)"], styleClass: 'd-center' },
      { field: "balance", header: this.fieldTitle["balance(bdt)"], styleClass: 'd-center' },
    ];
  }

  onPage(event: any, isRefresh: boolean = false) {
    try {
      if (!this.cashBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.cashBookListForm.form as UntypedFormGroup);
        return;
      }
      this.spData.pageNo = this.gridOption.serverPageNumber(event);
      this.spData.pageDataCount = event.rows;
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  refreshEventHandler(isRefresh: boolean = true) {
    try {
      if (!this.cashBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.cashBookListForm.form as UntypedFormGroup);
        return;
      }
      this.spData.pageNo = this.gridOption.resetPageNumber(this.gridOption.first);
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterFromServer(event: any, filters: any[]) {
    try {
      if (!this.cashBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.cashBookListForm.form as UntypedFormGroup);
        return;
      }
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

  getDefaultData() {
    try {
      this.isRefresh = true;
      this.modelSvc.searchParam.companyID = GlobalConstants.userInfo.companyID;
      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      forkJoin([
        this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
        this.orgSvc.getOrgStructure(elementCode, this.modelSvc.searchParam.companyID),
        this.coreAccountingSvc.getProject(this.modelSvc.searchParam.companyID),
        this.coreAccountingSvc.getCOAStructure(this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID)
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res[0] || [];

          this.modelSvc.prepareOfficeBranchUnitList(res[1] || []);
          this.modelSvc.projectList = res[2] || [];
          let results = res[3] || [];
          let bankNature = results.filter(x => x.transactionNatureCode == FixedIDs.transationNature.IsCashNature);
          const uniqueBankNature = Array.from(new Map(bankNature.map(item => [item.id, item])).values());
          this.modelSvc.cashList = uniqueBankNature;
          this.modelSvc.setNewSearchParam();

          if (this.modelSvc.cashList.length == 1) {
            this.modelSvc.searchParam.cashLedgerID = this.modelSvc.cashList[0].id;
            this.modelSvc.ledgerId = this.modelSvc.cashList[0].id;
          }
          if (this.modelSvc.companyList.length == 1) {
            this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
          }
          setTimeout(() => {
            //this.getCashBookList();
            // if(!this.isBranchModuleActive){
            //   this.getCashBookList();
            // }
            this.cashBookListForm.form.markAsPristine();
          }, 20)

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

  getCashLedgerList() {
    try {
      this.coreAccountingSvc.getCOAStructure(this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID).subscribe({
        next: (res: any) => {
          let results = res || []; 
          let bankNature = results.filter(x => x.transactionNatureCode == FixedIDs.transationNature.IsCashNature);
          const uniqueBankNature = Array.from(new Map(bankNature.map(item => [item.id, item])).values());
          this.modelSvc.cashList = uniqueBankNature;

          if (this.modelSvc.cashList.length ==1) {
            this.modelSvc.searchParam.cashLedgerID = this.modelSvc.cashList[0].id;
            this.modelSvc.ledgerId = this.modelSvc.cashList[0].id;
           this.formResetByDefaultValue(this.cashBookListForm.form,this.modelSvc.searchParam);
           this.cashBookListForm.form.markAsDirty();
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

  onChangeFromDate() {
    try {
      this.isRefresh = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeToDate() {
    try {
      this.isRefresh = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeOrg() {
    try {
      if (this.modelSvc.searchParam.orgID == null) {
        this.modelSvc.searchParam.unitBranch = null;
      }
      this.modelSvc.cashList = [];
      this.getCashLedgerList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeProject() {
    try {
      if (this.modelSvc.searchParam.projectID == null) {
        this.modelSvc.searchParam.project = null;
      }
      this.modelSvc.cashList = [];
      this.getCashLedgerList();
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany() {
    try {
      this.isRefresh = true;
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

  search(formGroup: NgForm) {
      try {
        if (!formGroup.valid) {
          this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
          return;
        }
      if (this.isRefresh == false) {
        this.spData.pageNo = 1;
        this.pageReset(0);
      }
      this.getCashBookList();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      this.modelSvc.cashBookList = [];
      this.spData.isRefresh = isRefresh;
      this.dataSvc.getCashBookList(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.cashLedgerID).subscribe({
        next: (res: any) => {
          this.modelSvc.cashBookList = res[res.length - 1] || [];
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isRefresh = false;
          this.modelSvc.summaryData(this.modelSvc.cashBookList);
          //this.modelSvc.cashBookList = this.modelSvc.calculateBalance( this.modelSvc.cashBookList );

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {
          this.spData.isRefresh = false;
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset(formGroup: NgForm) {
    try {
      this.isRefresh = true;
      this.formResetByDefaultValue(formGroup.form, this.modelSvc.searchParam);
      this.modelSvc.setNewSearchParam();
      this.modelSvc.searchParam.cashLedgerID = null;
      this.modelSvc.cashBookList = [];
      this.modelSvc.totalDebit = 0;
      this.modelSvc.totalCredit = 0;
      this.modelSvc.closeingBalance = 0;
      this.gridOption.totalRecords = 0;
      formGroup.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getCashBookList() {
    try {
      if (!this.cashBookListForm.form.valid) {
        return;
      }
      this.spData = new QueryData({
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'cashBook',
        pageNo: 1
      });

      this.populateGrid(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onExportData(event: any) {
    try {
      if (!this.cashBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.cashBookListForm.form as UntypedFormGroup);
        return;
      }
      event.exportOption.title = this.fieldTitle['cashbook'] //+ "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en");

      let spData = new QueryData();
      spData.pageNo = 0;

      return this.dataSvc.getCashBookList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.cashLedgerID).pipe(
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
      this.modelSvc.summaryData(list);
      list.push(
        { date: this.fieldTitle['transactionalbalance'], debitVal: this.modelSvc.totalDebit !=null ? this.modelSvc.totalDebit.toFixed(2) :0.00, creditVal: this.modelSvc.totalCredit !=null ? this.modelSvc.totalCredit.toFixed(2):0.00 },
      )

      list.push(
        { date: this.fieldTitle['closingbalance'] + ':(' + this.modelSvc.fromBank + ':' + this.modelSvc.showDate + ')', balance: this.modelSvc.closeingBalance !=null ? this.modelSvc.closeingBalance.toFixed(2):0.00 },
      )
      return list;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }



  /*********************Print*************************/

  onExport(isExport: boolean) {
    try {
      if (!this.cashBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.cashBookListForm.form as UntypedFormGroup);
        return;
      }
      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getCashBookList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.cashLedgerID).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          let reportData = this.prepareCashBookOption(data);

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
        width: '40%',
        closable:true
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private prepareCashBookOption(data: any[]) {
    try {
      return {
        reportName: 'CashBook',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "spACM_RptCashBook",
      };
    } catch (e) {
      throw e;
    }
  }

}

