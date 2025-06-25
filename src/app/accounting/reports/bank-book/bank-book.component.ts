import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatorDirective } from 'src/app/app-shared';
import { GridOption } from 'src/app/shared/models/common.model';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { AccountingReportDataService } from '../../services/accounting-report/accounting-report-data.service';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { formatDate } from '@angular/common';
import { BankBookModelService } from '../..';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-bank-book',
  templateUrl: './bank-book.component.html',
  providers: [AccountingReportDataService, BankBookModelService],
  standalone:true,
  imports:[SharedModule]
})
export class BankBookComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive;
  @ViewChild("bankBookListForm", { static: true, read: NgForm }) bankBookListForm: NgForm;
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
    public modelSvc: BankBookModelService

  ) {
    super(providerSvc);
    this.validationMsgObj = this.modelSvc.bankBookValidation();
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
        dataSource: "modelSvc.bankBookList",
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
          title: this.fieldTitle['bankbook']
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
      { field: "debitVal", header: this.fieldTitle["debit(bdt)"], styleClass: "d-center" },
      { field: "creditVal", header: this.fieldTitle["credit(bdt)"], styleClass: "d-center" },
      { field: "balance", header: this.fieldTitle["balance(bdt)"], styleClass: "d-center" },
    ];
  }

  getBankLedgerList() {
    try {
      this.coreAccountingSvc.getCOAStructure(this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID).subscribe({
        next: (res: any) => {
          let results = res || [];
          let bankNature = results.filter(x => x.transactionNatureCode == FixedIDs.transationNature.IsBankNature);
          const uniqueBankNature = Array.from(new Map(bankNature.map(item => [item.id, item])).values());
          this.modelSvc.bankList = uniqueBankNature;

          if (this.modelSvc.bankList.length == 1) {
            this.modelSvc.searchParam.bankLedgerID = this.modelSvc.bankList[0].id;
            this.modelSvc.ledgerId = this.modelSvc.bankList[0].id;
            this.formResetByDefaultValue(this.bankBookListForm.form, this.modelSvc.searchParam);
            this.bankBookListForm.form.markAsDirty();
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

  onPage(event: any, isRefresh: boolean = false) {
    try {
      if (!this.bankBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.bankBookListForm.form as UntypedFormGroup);
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
      if (!this.bankBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.bankBookListForm.form as UntypedFormGroup);
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
      if (!this.bankBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.bankBookListForm.form as UntypedFormGroup);
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
          let bankNature = results.filter(x => x.transactionNatureCode == FixedIDs.transationNature.IsBankNature);
          const uniqueBankNature = Array.from(new Map(bankNature.map(item => [item.id, item])).values());
          this.modelSvc.bankList = uniqueBankNature;
          this.modelSvc.setNewSearchParam();
          if (this.modelSvc.companyList.length == 1) {
            this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
          }
          if (this.modelSvc.bankList.length == 1) {
            this.modelSvc.searchParam.bankLedgerID = this.modelSvc.bankList[0].id;
            this.modelSvc.ledgerId = this.modelSvc.bankList[0].id;
          }

          setTimeout(() => {
           // this.getBankBookList();
            // if (!this.isBranchModuleActive) {
            //   this.getBankBookList();
            // }
            this.bankBookListForm.form.markAsPristine();
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


  onChangeOrg() {
    try {
      if (this.modelSvc.searchParam.orgID == null) {
        this.modelSvc.searchParam.unitBranch = null;
      }
      this.modelSvc.bankList = [];

      this.getBankLedgerList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeProject() {
    try {
      if (this.modelSvc.searchParam.projectID == null) {
        this.modelSvc.searchParam.project = null;
      }
      this.modelSvc.bankList = [];
      this.getBankLedgerList();
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
      this.getBankBookList();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      this.modelSvc.bankBookList = [];
      this.spData.isRefresh = isRefresh;
      this.dataSvc.getBankBookList(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.bankLedgerID).subscribe({
        next: (res: any) => {
          this.modelSvc.bankBookList = res[res.length - 1] || [];
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isRefresh = false;
          this.modelSvc.summaryData(this.modelSvc.bankBookList);
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


  reset(formGroup: NgForm) {
    try {
      this.isRefresh = true;
      this.formResetByDefaultValue(formGroup.form, this.modelSvc.searchParam);
      this.modelSvc.setNewSearchParam();
      this.modelSvc.searchParam.bankLedgerID = null;
      //this.getDefaultData();
        this.modelSvc.bankBookList = [];
        this.gridOption.totalRecords = 0;
      formGroup.form.markAsPristine();

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getBankBookList() {
    try {

      this.spData = new QueryData({
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'bankBook',
        pageNo: 1
      });

      this.populateGrid(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onExportData(event: any) {
    try {
      if (!this.bankBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.bankBookListForm.form as UntypedFormGroup);
        return;
      }
      event.exportOption.title = this.fieldTitle['bankbook'] //+ "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en");

      let spData = new QueryData();
      spData.pageNo = 0;

      return this.dataSvc.getBankBookList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.bankLedgerID).pipe(
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
      //list = this.modelSvc.calculateBalance( list );
      this.modelSvc.summaryData(list);
      list.push(
        { date: this.fieldTitle['transactionalbalance'], debitVal: this.modelSvc.totalDebit != null ? this.modelSvc.totalDebit.toFixed(2) : 0.00, creditVal: this.modelSvc.totalCredit != null ? this.modelSvc.totalCredit.toFixed(2) : 0.00 },
      )

      list.push(
        { date: this.fieldTitle['closingbalance'] + ':(' + this.modelSvc.fromBank + ':' + this.modelSvc.showDate + ')', balance: this.modelSvc.closeingBalance != null ? this.modelSvc.closeingBalance.toFixed(2) : 0.00 },
      )



      return list;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  /*********************Print and mail*************************/
  onExport(isExport: boolean) {
    try {
      if (!this.bankBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.bankBookListForm.form as UntypedFormGroup);
        return;
      }
      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getBankBookList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.bankLedgerID).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          let reportData = this.prepareBankBookOption(data);

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

  private prepareBankBookOption(data: any[]) {
    try {
      return {
        reportName: 'BankBook',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "spACM_RptBankBook",
      };
    } catch (e) {
      throw e;
    }
  }

}

