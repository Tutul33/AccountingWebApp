import { Injectable } from '@angular/core';
import { Config, GlobalConstants, GlobalMethods  } from 'src/app/shared';
import { BankReconcilVoucherTransactionDTO } from "../../models/bank-reconciliation/bank-reconciliation";
import { map } from 'rxjs/operators';
import { QueryData } from 'src/app/shared/models/common.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { Observable} from 'rxjs';

@Injectable()
export class BankReconciliationTransactionsDataService {

  spData: any = new QueryData();
  controllerName = Config.url.accountingLocalUrl + "BankReconciliation";
  constructor(private apiSvc: ApiService) { this.spData.pageNo = 0; }

  save(bankReconcilVoucherTransactionDTO: BankReconcilVoucherTransactionDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveBankReconcilVoucherTransaction`, bankReconcilVoucherTransactionDTO, true);
  }

  getBankReconciliationList(spData : any): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetBankReconciliationList`, { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getBankReconciliationTransactionsList(spData: any, companyID: number, orgID: number, projectID: number, fromDate: Date, toDate: Date, cOAStructID?: number, bankReconcilationID?: number) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetBankReconciliationTransactionsList`,
        {
          data: JSON.stringify(spData),
          companyID: companyID == null ? '' : companyID,
          orgID: orgID == null ? '' : orgID,
          projectID: projectID == null ? '' : projectID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          cOAStructID: cOAStructID == null ? '' : cOAStructID,
          bankReconcilationID: bankReconcilationID == null ? '' : bankReconcilationID
        })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }

  getBankReconciliationTransactionsSummaryBlockList(spData: any, companyID: number, orgID: number, projectID: number, fromDate: Date, toDate: Date, cOAStructID?: number, bankReconcilationID?: number) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetBankReconciliationTransactionsSummaryBlockList`,
        {
          data: JSON.stringify(spData),
          companyID: companyID == null ? '' : companyID,
          orgID: orgID == null ? '' : orgID,
          projectID: projectID == null ? '' : projectID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          cOAStructID: cOAStructID == null ? '' : cOAStructID,
          bankReconcilationID: bankReconcilationID == null ? '' : bankReconcilationID
        })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }

}


@Injectable()
export class BankReconciliationTransactionsModelService {

  closingBalanceData: any = {};
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  bankReconcilVoucherTransactionDTO: BankReconcilVoucherTransactionDTO;
  bankReconciliationTransactionsList: any = [];
  bankReconciliationTransactionsSummaryBlockList: any = [];
  bankReconciliationData: any = {};

  constructor() { }

  setClosingBalanceData(entity: any) {
    try {
      this.closingBalanceData = {
        bankReconcilationID: entity.id,
        companyName: entity.companyName, 
        companyID: entity.companyID, 
        orgID: entity.orgID, 
        orgName: entity.orgName, 
        projectID: entity.projectID, 
        projectName: entity.projectName, 
        fromDate : entity.fromDate, 
        toDate : entity.toDate,
        bankClosingBalance: entity.statementBalance,
        auditedDiscrepancy: entity.discrepancy,
        cOAStructID: entity.cOAStructID,
        bankAccount: entity.bankAccount,
        fromDateDb: null,
        toDateDb: null,
        approvedLedgerBalance: null,
        formattedApprovedLedgerBalance: null,
        nonApprovedLedgerBalance: null,
        formattedNonApprovedLedgerBalance: null,
        totalLedgerBalance: null,
        formattedTotalLedgerBalance: null,
        currentDiscrepancy: null,
        formattedCurrentDiscrepancy: null,
        isNegativeApprovedLedgerBalance: null,
        isNegativeNonApprovedLedgerBalance: null,
        isNegativeTotalLedgerBalance: null,
        isNegativeCurrentDiscrepancy: null,
      };

      const parseDate = (dateStr: string): Date => {
        const [month, day, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day); // JS Date expects 0-based month
      };

      if(entity.fromDate != null || entity.toDate)
      {
        const fromDateDb = parseDate(entity.fromDate);
        const toDateDb = parseDate(entity.toDate);

        this.closingBalanceData.fromDateDb = fromDateDb;
        this.closingBalanceData.toDateDb = toDateDb;
      }
    } catch (error) {
      throw error;
    }
  }

  prepareData() {
    try {
      if(this.bankReconciliationTransactionsList.length > 0)
      {
        this.closingBalanceData.approvedLedgerBalance = this.bankReconciliationTransactionsList[0].approvedLedgerBalance;
        this.closingBalanceData.formattedApprovedLedgerBalance = this.bankReconciliationTransactionsList[0].formattedApprovedLedgerBalance;
        this.closingBalanceData.isNegativeApprovedLedgerBalance = this.bankReconciliationTransactionsList[0].isNegativeApprovedLedgerBalance;

        this.closingBalanceData.nonApprovedLedgerBalance = this.bankReconciliationTransactionsList[0].nonApprovedLedgerBalance;
        this.closingBalanceData.formattedNonApprovedLedgerBalance = this.bankReconciliationTransactionsList[0].formattedNonApprovedLedgerBalance;
        this.closingBalanceData.isNegativeNonApprovedLedgerBalance = this.bankReconciliationTransactionsList[0].isNegativeNonApprovedLedgerBalance;

        this.closingBalanceData.totalLedgerBalance = this.bankReconciliationTransactionsList[0].totalLedgerBalance;
        this.closingBalanceData.formattedTotalLedgerBalance = this.bankReconciliationTransactionsList[0].formattedTotalLedgerBalance;
        this.closingBalanceData.isNegativeTotalLedgerBalance = this.bankReconciliationTransactionsList[0].isNegativeTotalLedgerBalance;

        this.closingBalanceData.currentDiscrepancy = this.bankReconciliationTransactionsList[0].currentDiscrepancy;
        this.closingBalanceData.formattedCurrentDiscrepancy = this.bankReconciliationTransactionsList[0].formattedCurrentDiscrepancy;
        this.closingBalanceData.isNegativeCurrentDiscrepancy = this.bankReconciliationTransactionsList[0].isNegativeCurrentDiscrepancy;

        this.closingBalanceData.isNegativeBankClosingBalance = this.bankReconciliationTransactionsList[0].isNegativeBankClosingBalance;
        this.closingBalanceData.isNegativeAuditedDiscrepancy = this.bankReconciliationTransactionsList[0].isNegativeAuditedDiscrepancy;
      }
    } catch (error) {
      throw error;
    }
  }


  prepareDataBeforeSave(entity: any) {
    try {
      this.bankReconcilVoucherTransactionDTO.reconcilID = entity.bankReconcilationID;
      this.bankReconcilVoucherTransactionDTO.voucherItemID = entity.voucherItemID;

    } catch (error) {
      throw error;
    }
  }


  /********************* Report *************************/
  getRptParameter() {
    try {
      var params = [
        {
          key: "CompanyLogoUrl",
          value: GlobalConstants.companyInfo.companyLogoUrl,
        },
        {
          key: "CompanyShortAddress",
          value: GlobalConstants.companyInfo.companyAddress,
        },
        {
          key: "Currency",
          value: GlobalConstants.companyInfo.currency
        },
        {
          key: "CompanyName",
          value: this.closingBalanceData.companyName || null
        },
        {
          key: "UnitBranch",
          value: this.closingBalanceData.orgName || null
        },
        {
          key: "Project",
          value: this.closingBalanceData.project || null
        },
        {
          key: "FromDate",
          value: this.closingBalanceData.fromDate || null
        },
        {
          key: "ToDate",
          value: this.closingBalanceData.toDate || null
        },
        {
          key: "RptName",
          value: this.closingBalanceData.bankAccount || null
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        }
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }

  getColumnHeader() {
    try {
      var columns = [
        { key: "Date", value: "Date" },
        { key: "VoucherNo", value: "VoucherNo" },
        { key: "Description", value: "Description" },
        { key: "Account", value: "Account" },
        { key: "FormattedAmount", value: "FormattedAmount" },
        { key: "Status", value: "Status" },
      ];

      return columns;
    } catch (e) {
      throw e;
    }
  }
  
}