import { Component, OnInit } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { FixedIDs, GlobalConstants, GlobalMethods } from '../../shared';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { forkJoin, Subject, takeUntil } from "rxjs";

import {
  ProviderService,
  BaseComponent,
  BankReconciliationTransactionsDataService,
  BankReconciliationTransactionsModelService,
  QueryData
} from '../index';
import { BankReconcilVoucherTransactionDTO } from "../models/bank-reconciliation/bank-reconciliation";
import { SharedModule } from "src/app/shared/shared.module";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { MenuService } from 'src/app/shared/services/menu.service';

@Component({
  selector: 'app-bank-reconciliation-transactions',
  templateUrl: './bank-reconciliation-transactions.component.html',
  providers: [BankReconciliationTransactionsDataService, BankReconciliationTransactionsModelService],
  standalone:true,
  imports:[SharedModule]
})
export class BankReconciliationTransactionsComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  isPlaceholderDisableCompany: boolean = false;
  fileName: string = "";
  isInValidBranch: boolean = false;
  gridOption: GridOption;
  list = [];
  approvalStatus = FixedIDs.approvalStatus;
  pageHeader: string;

  private $unsubscribe = new Subject<void>();

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BankReconciliationTransactionsModelService,
    private dataSvc: BankReconciliationTransactionsDataService,
    public dialogService: DialogService,
    private menuService: MenuService,
    private coreAccountingSvc: CoreAccountingService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.modelSvc.bankReconcilVoucherTransactionDTO = new BankReconcilVoucherTransactionDTO();
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.pageHeader = this.fieldTitle["transactions"];
    this.initGridOption();

    this.dataTransferSvc
      .on("entity")
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((response) => {
        if (response) {
          let entity = response;
          this.modelSvc.bankReconciliationData = entity;
          this.modelSvc.setClosingBalanceData(entity);
          this.getBankReconciliationTransactionsList();
        }
        this.dataTransferSvc.unsubscribe(this.$unsubscribe);
      });
    this.dataTransferSvc.broadcast("voucherID", null);
  }

  getBankReconciliationTransactionsList() {
    try { 
      this.spData = new QueryData({
        pageNo: 0,
        isRefresh: true
      });

      forkJoin([
        this.dataSvc.getBankReconciliationTransactionsList(this.spData, this.modelSvc.closingBalanceData.companyID, this.modelSvc.closingBalanceData.orgID, this.modelSvc.closingBalanceData.projectID, this.modelSvc.closingBalanceData.fromDateDb, this.modelSvc.closingBalanceData.toDateDb,  this.modelSvc.closingBalanceData.cOAStructID, this.modelSvc.closingBalanceData.bankReconcilationID),
        this.dataSvc.getBankReconciliationTransactionsSummaryBlockList(this.spData, this.modelSvc.closingBalanceData.companyID, this.modelSvc.closingBalanceData.orgID, this.modelSvc.closingBalanceData.projectID, this.modelSvc.closingBalanceData.fromDateDb, this.modelSvc.closingBalanceData.toDateDb,  this.modelSvc.closingBalanceData.cOAStructID, this.modelSvc.closingBalanceData.bankReconcilationID)
      ]).subscribe({
        next: (res: any) => {
          let data = res[0] || [];
          let summarydata = res[1] || [];
          this.modelSvc.bankReconciliationTransactionsList = data;
          this.modelSvc.bankReconciliationTransactionsSummaryBlockList = summarydata;
          this.modelSvc.prepareData(); 
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

  initGridOption() {
    try {
      const gridObj = {
        title: this.pageHeader,
        isGlobalSearch: true,
        dataSource: "modelSvc.bankReconciliationTransactionsList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        paginator: true,
        // exportOption: {
        //   exportInPDF: true,
        //   exportInXL: true,
        //   title: this.fieldTitle["chequestatusnotify"]
        // }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "date", header: this.fieldTitle['date'] },
      { field: "voucherNo", header: this.fieldTitle['vouchernumber'] },
      { field: "description", header: this.fieldTitle['description'] },
      { field: "account", header: this.fieldTitle['account'] },
      { field: "amount", header: this.fieldTitle['amount'] },
      { field: "status", header: this.fieldTitle['status'], styleClass: "d-center" },
      { field: "isActive", header: this.fieldTitle['action'], isBoolean: true, styleClass: "d-center" },
    ]
  }

  refresh(){
    try {
      this.getBankReconciliationTransactionsList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  newPayment() {
    try {
      // Redirect to Debit Payment Voucher Page
      let navigateUrl = '/ACC-PAGE/debit-payment-voucher-entry';
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  newReceived() {
    try {
      // Redirect to Credit Receipt Voucher Page
      let navigateUrl = '/ACC-PAGE/credit-receipt-voucher-entry';
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onClickGoToApproval() {
    try {
      // Redirect to Voucher Approval List Page
      let navigateUrl = '/ACC-PAGE/voucher-approval-list';
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveBankReconciliation(entity: any) {
    try {
      this.modelSvc.prepareDataBeforeSave(entity);
      this.save(this.modelSvc.bankReconcilVoucherTransactionDTO);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  save(bankReconcilVoucherTransactionDTO: BankReconcilVoucherTransactionDTO) {
    try {
      this.dataSvc.save(bankReconcilVoucherTransactionDTO).subscribe({
        next: (res: any) => {
          this.modelSvc.bankReconcilVoucherTransactionDTO = new BankReconcilVoucherTransactionDTO();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onClickPrint() {
    try {
      let reportData = [];
      reportData.push(this.prepareReportOption(this.modelSvc.bankReconciliationTransactionsList));
      reportData.push(this.prepareReportOptionDateSummaryBlock(this.modelSvc.bankReconciliationTransactionsList));
      reportData.push(this.prepareReportOptionTransactionSummaryBlock(this.modelSvc.bankReconciliationTransactionsSummaryBlockList));
      this.coreAccountingSvc.printReports(reportData);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private prepareReportOption(data: any[]) {
    try {
      return {
        reportName: 'BankReconciliationTransactions',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "SpACM_GetBankReconciliationTransactions",
      };
    } catch (e) {
      throw e;
    }
  }

    private prepareReportOptionDateSummaryBlock(data: any[]) {
    try {
      return {
        reportName: 'BankReconciliationTransactionsDateSummaryBlock',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        dataSetName: "SpACM_GetBankReconciliationTransactions",
      };
    } catch (e) {
      throw e;
    }
  }

    private prepareReportOptionTransactionSummaryBlock(data: any[]) {
    try {

      return {
        reportName: 'BankReconciliationTransactionsSummaryBlock',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        dataSetName: "SpACM_GetBankReconciliationTransactionsSummaryBlock",
      };
    } catch (e) {
      throw e;
    }
  }

}
