
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiService, Config, GlobalMethods, QueryData } from 'src/app/app-shared';

@Injectable()
export class AccountingReportDataService {
controllerName = Config.url.accountingLocalUrl + "AccountingReport";
spData: any = new QueryData();
constructor(private apiSvc: ApiService) {}

    GetTrialBalanceReport(  
      spData: any,
      companyID:number,
      orgID:number,
      projectID:number,
      fromDate:Date,
      toDate:Date,
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetTrialBalanceReport`, {
          data: JSON.stringify(spData),
          companyID:companyID,
          orgID:orgID==null?'':orgID, 
          projectID:projectID==null?'':projectID,
          fromDate:GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate:GlobalMethods.convertDateToServerDateString(toDate, void 0, null),

        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getDayBookList(spData: any,companyID?:number,orgID?:number,projectID?:number, fromDate?:Date,toDate?:Date) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetDayBookList",
        {
          data: JSON.stringify(spData),companyID:companyID, orgID:orgID == null ? '' :orgID, projectID:projectID == null ? '' :projectID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getReceiptsAndPayments(
      spData: any,
      companyID:number,
      fromDate:Date,
      toDate:Date,
      isAcrualBasis:boolean,
      orgID?:number,
      projectID?:number
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetReceiptsAndPayments`, {
          data: JSON.stringify(spData),
          companyID:companyID,
          fromDate:GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate:GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          isAcrualBasis:isAcrualBasis||false,
          orgID:orgID==null?'':orgID, 
          projectID:projectID==null?'':projectID
        })
        .pipe(
          map((response: any) => {
            return response.body[response.body.length - 1] || [];
          })
        );
    }

    getCashFlowStatments(
      spData: any,
      companyID:number,
      fromDate:Date,
      toDate:Date,
      orgID?:number,
      projectID?:number
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetCashFlowStatments`, {
          data: JSON.stringify(spData),
          companyID:companyID,
          fromDate:GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate:GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          orgID:orgID==null?'':orgID, 
          projectID:projectID==null?'':projectID
        })
        .pipe(
          map((response: any) => {
            return response.body[response.body.length - 1] || [];
          })
        );
    }

    getGroupLedgerList() {
      let spData = new QueryData({pageNo: 0}); 
      return this.apiSvc.executeQuery(this.controllerName + "/GetGroupLedgerList",
      {
        data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
    }

    getBankBookList(spData: any,companyID?:number,orgID?:number,projectID?:number, fromDate?:Date,toDate?:Date,bankLedgerId?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetBankBookList",
        {
          data: JSON.stringify(spData),companyID:companyID, orgID:orgID == null ? '' :orgID, projectID:projectID == null ? '' :projectID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          bankLedgerId:bankLedgerId == null ? '' :bankLedgerId
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getGroupLedgerReport(spData: any,companyID?:number,orgID?:number,projectID?:number, fromDate?:Date,toDate?:Date, groupLedgerID?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetGroupLedgerReport",
        {
          data: JSON.stringify(spData),
          companyID: companyID, 
          orgID: orgID == null ? '' : orgID, 
          projectID: projectID == null ? '' : projectID, 
          groupLedgerID: groupLedgerID == null ? '' : groupLedgerID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getCashBookList(spData: any,companyID?:number,orgID?:number,projectID?:number, fromDate?:Date,toDate?:Date,cashLedgerID?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetCashBookList",
        {
          data: JSON.stringify(spData),companyID:companyID, orgID:orgID == null ? '' :orgID, projectID:projectID == null ? '' :projectID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          cashLedgerID:cashLedgerID == null ? '' :cashLedgerID
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getSubLedgerDetailList(spData: any,companyID?:number,orgID?:number,projectID?:number, fromDate?:Date,toDate?:Date,ledgerID?:number,subLedgerDetailID?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetSubLedgerDetailList",
        {
          data: JSON.stringify(spData),companyID:companyID, 
          orgID:orgID == null ? '' :orgID, 
          projectID:projectID == null ? '' :projectID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          ledgerID:ledgerID ,//== null ? '' :ledgerID,
          subLedgerDetailID:subLedgerDetailID //== null ? '' :subLedgerDetailID
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }
    getAgingReport(spData: any,companyID?:number,orgID?:number,projectID?:number, asOnDate?:Date,ledgerID?:number,subLedgerTypeID?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetAgingReport",
        {
          data: JSON.stringify(spData),companyID:companyID, 
          orgID:orgID == null ? '' :orgID, 
          projectID:projectID == null ? '' :projectID,
          asOnDate: asOnDate == null ? '' : GlobalMethods.convertDateToServerDateString(asOnDate, void 0, null), 
          ledgerID:ledgerID ,
          subLedgerTypeID:subLedgerTypeID 
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }


    getBalanceSheet(
      spData: any,
      companyID:number,
      financialYearID?:number,
      orgID?:number,
      projectID?:number,
      stockValuationMethodCd?:number,
      fromDate?:Date,
      toDate?:Date
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetBalanceSheet`, {
          data : JSON.stringify(spData),
          companyID : companyID == null  ? '' : companyID,
          financialYearID : financialYearID == null  ? '' : financialYearID,
          orgID : orgID == null ? '' : orgID, 
          projectID : projectID == null ? '' : projectID,
          stockValuationMethodCd : stockValuationMethodCd == null ? '' : stockValuationMethodCd,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
        })
        .pipe(
          map((response: any) => {
            return response.body[response.body.length - 1] || [];
          })
        );
    }

    getLedgerList() {
      let spData = new QueryData({pageNo: 0}); 
      return this.apiSvc.executeQuery(this.controllerName + "/GetLedgerList",
      {
        data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
    }

    getLedgerReport(spData: any,companyID?:number,orgID?:number,projectID?:number, fromDate?:Date,toDate?:Date, ledgerID?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetLedgerReport",
        {
          data: JSON.stringify(spData),
          companyID: companyID, 
          orgID: orgID == null ? '' : orgID, 
          projectID: projectID == null ? '' : projectID, 
          ledgerID: ledgerID == null ? '' : ledgerID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    
    GetIncomeStatementReport(  
      spData: any,
      companyID:number,
      orgID:number,
      projectID:number,
      isCustomDateRange:boolean,
      fromDate:Date,
      toDate:Date,
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetIncomeStatementReport`, {
          data: JSON.stringify(spData),
          companyID:companyID,
          orgID:orgID==null?'':orgID, 
          projectID:projectID==null?'':projectID,
          isCustomDateRange:isCustomDateRange,
          fromDate:GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate:GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getSubLedgerReport(spData: any,companyID?:number,orgID?:number,projectID?:number, fromDate?:Date,toDate?:Date, ledgerID?:number, subLedgerTypeID?: number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetSubLedgerReport",
        {
          data: JSON.stringify(spData),
          companyID: companyID, 
          orgID: orgID == null ? '' : orgID, 
          projectID: projectID == null ? '' : projectID, 
          ledgerID: ledgerID == null ? '' : ledgerID,
          fromDate: fromDate == null ? '' : GlobalMethods.convertDateToServerDateString(fromDate, void 0, null), 
          toDate: toDate == null ? '' : GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          subLedgerTypeID: subLedgerTypeID == null ? '' : subLedgerTypeID,
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }
    getNoteLedger(
      spData: any,
      orgID?:number,
      projectID?:number
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetNoteLedger`, {
          data: JSON.stringify(spData),
          orgID:orgID==null?'':orgID, 
          projectID:projectID==null?'':projectID
        })
        .pipe(
          map((response: any) => {
            return response.body[response.body.length - 1] || [];
          })
        );
    }

    getNoteLedgerBalance(
      spData: any,
      companyID:number,
      financialYearID:number,
      date:Date,
      noteNo:string,
      orgID?:number,
      projectID?:number
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetNoteLedgerBalance`, {
          data: JSON.stringify(spData),
          companyID:companyID,
          financialYearID : financialYearID == null  ? '' : financialYearID,
          date:GlobalMethods.convertDateToServerDateString(date, void 0, null),
          noteNo: noteNo == null ? '' : noteNo,
          orgID:orgID== null ? '' : orgID, 
          projectID:projectID == null ? '' : projectID
        })
        .pipe(
          map((response: any) => {
            return response.body[response.body.length - 1] || [];
          })
        );
    }

    getFixedAssetsSchedule(
      spData: any,
      companyID:number,
      fromDate:Date,
      toDate:Date,
      orgID?:number,
      projectID?:number
    ) {
      return this.apiSvc
        .executeQuery(`${this.controllerName}/GetFixedAssetsSchedule`, {
          data: JSON.stringify(spData),
          companyID: companyID,
          fromDate: GlobalMethods.convertDateToServerDateString(fromDate, void 0, null),
          toDate: GlobalMethods.convertDateToServerDateString(toDate, void 0, null),
          orgID: orgID == null ? '' : orgID, 
          projectID: projectID == null ? '' : projectID
        })
        .pipe(
          map((response: any) => {
            return response.body[response.body.length - 1] || [];
          })
        );
    }


   

}
