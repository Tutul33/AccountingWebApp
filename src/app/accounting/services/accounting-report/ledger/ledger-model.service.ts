import { Injectable } from '@angular/core';
import { FixedIDs, GlobalConstants, ValidatingObjectFormat } from 'src/app/app-shared';
import { formatDate } from '@angular/common';


@Injectable()
export class LedgerModelService {
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  keyValuePair: any;
  companyList: any;
  projectList: any;
  officeBranchUnitList: any;
  ledgerNameList: any;
  ledgerList: any;
  searchParam: any = {};
  minDate: Date = null;
  maxDate = null;
  totalDebit: number = 0;
  totalCredit: number = 0;
  closeingBalance: number = 0;
  fromLedger: any = null;
  showDate: any;
  accountNatureCd: number = null;


  setNewSearchParam() {
    try {
      let currentDate = new Date(GlobalConstants.serverDate);
      this.searchParam = {
        companyName: GlobalConstants.userInfo.company,
        companyID: GlobalConstants.userInfo.companyID,
        fromDate: currentDate,
        toDate: currentDate,
        orgID: null,
        unitBranch: null,
        projectID: null,
        project: null,
        ledgerID: null,
        ledgerName: null,
      };
    } catch (e) {
      throw e;
    }
  }

  prepareSearchParams(){
    try {
      let searchParams = [];
      if(this.searchParam.orgID) searchParams.push(this.keyValuePair('orgID', this.searchParam.orgID || null));
      if(this.searchParam.projectID) searchParams.push(this.keyValuePair('projectID', this.searchParam.projectID || null));
      
      return searchParams;
    } catch (e) {
      throw e;
    }
  }


  setDateRange() {
    try {
      this.searchParam.toDate = this.searchParam.fromDate;
      this.maxDate = null;
      if (this.searchParam.fromDate) {
        let date = new Date(this.searchParam.fromDate);
        date.setDate(date.getDate() + 365);
        this.maxDate = date;
      }
    } catch (e) {
      throw e;
    }
  }

  prepareOfficeBranchUnitList(res) {
    try {
      let orgList = [
        {
          label: "-- Office --",
          value: "office",
          items: [],
        },
        {
          label: "-- Branch --",
          value: "branch",
          items: [],
        },
        {
          label: "-- Unit --",
          value: "unit",
          items: [],
        },
      ];
      res.forEach((item) => {
        if (item.value == "Office") {
          //3 Office
          let objOffice = orgList.find((x) => x.value == "office");
          if (objOffice) {
            objOffice.items.push(item);
          }
        } else if (item.value == "Branch") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "branch");
          if (objBranch) {
            objBranch.items.push(item);
          }
        } else if (item.value == "Unit") {
          //5 Unit
          let objUnit = orgList.find((x) => x.value == "unit");
          if (objUnit) {
            objUnit.items.push(item);
          }
        }
      });
      this.officeBranchUnitList = orgList || [];
    } catch (error) {
      throw error;
    }
  }

  prepareLegdreNameList(results: any) {
    try {
      if(this.searchParam.orgID == null && this.searchParam.projectID == null)
      {
        this.ledgerNameList = results.filter(x => x.orgID == null && x.projectID == null);
      }
      else
      {
        this.ledgerNameList = results;
      }

      // if (this.ledgerNameList.length > 0) {
      //   this.searchParam.ledgerID = this.ledgerNameList[0].id;
      //   this.searchParam.ledgerName = this.ledgerNameList[0].ledger;
      // }
    } catch (error) {
      throw error;
    }
  }

  prepareGridData() {
    try {
      this.totalDebit = 0;
      this.totalCredit = 0;
      this.closeingBalance = 0;
      this.fromLedger = null;
      debugger
      this.fromLedger = this.ledgerList[0].ledger;
      this.showDate = formatDate(this.searchParam.toDate, "dd-MM-yyyy", "en");

      this.totalDebit = Number(this.ledgerList[0].totalDebit);
      this.totalCredit = Number(this.ledgerList[0].totalCredit);
      this.closeingBalance = Number(this.ledgerList[0].closingBalance);
      //this.ledgerList[0].particulars='Opening Balance';

      // let list = [];
      // let balance = this.ledgerList[0].balance;

      // this.ledgerList.forEach(element => {
      //   if(this.accountNatureCd == FixedIDs.accountingNature.Assets || this.accountNatureCd == FixedIDs.accountingNature.Expenses)
      //   {
      //     balance += element.debitVal - element.creditVal;
      //     element.balance = balance;
      //   }
      //   else if(this.accountNatureCd == FixedIDs.accountingNature.Liabilities || this.accountNatureCd == FixedIDs.accountingNature.Income)
      //   {
      //     balance += element.creditVal - element.debitVal;
      //     element.balance = balance;
      //   }

      //   list.push(element);
      //   this.totalDebit += Number(element.debitVal);
      //   this.totalCredit += Number(element.creditVal);
      // });

      // this.ledgerList = [];
      // this.ledgerList = list;
      // this.closeingBalance = balance;

    } catch (error) {
      throw error;
    }
  }

  prepareRptData(ledgerList) {
    try {
      this.totalDebit = 0;
      this.totalCredit = 0;
      this.closeingBalance = 0;
      this.fromLedger = null;
      this.fromLedger = this.searchParam.ledgerName;
      this.showDate = formatDate(this.searchParam.toDate, "dd-MM-yyyy", "en");

      this.totalDebit = Number(ledgerList[0].totalDebit);
      this.totalCredit = Number(ledgerList[0].totalCredit);
      this.closeingBalance = Number(ledgerList[0].closingBalance);

      // let list = [];
      // let balance = this.ledgerList[0].balance;

      // this.ledgerList.forEach(element => {
      //   if(this.accountNatureCd == FixedIDs.accountingNature.Assets || this.accountNatureCd == FixedIDs.accountingNature.Expenses)
      //   {
      //     balance += element.debitVal - element.creditVal;
      //     element.balance = balance;
      //   }
      //   else if(this.accountNatureCd == FixedIDs.accountingNature.Liabilities || this.accountNatureCd == FixedIDs.accountingNature.Income)
      //   {
      //     balance += element.creditVal - element.debitVal;
      //     element.balance = balance;
      //   }

      //   list.push(element);
      //   this.totalDebit += Number(element.debitVal);
      //   this.totalCredit += Number(element.creditVal);
      // });

      // this.ledgerList = [];
      // this.ledgerList = list;
      // this.closeingBalance = balance;

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
          value: "Next Accessories Limited" 
        },
        {
          key: "UnitBranch",
          value: this.searchParam.unitBranch || null
        },
        {
          key: "Project",
          value: this.searchParam.project || null
        },
        {
          key: "FromDate",
          value: this.searchParam.fromDate || null
        },
        {
          key: "ToDate",
          value: this.searchParam.toDate || null
        },
        {
          key: "RptName",
          value: 'Ledger'
        },
        {
          key: "ClosingBalance",
          value: this.closeingBalance.toString() || null
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "LedgerName",
          value: this.searchParam.ledgerName || null
        },
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
        { key: "Particulars", value: "Particulars" },
        { key: "VoucherNo", value: "VoucherNo" },
        { key: "DebitVal", value: "DebitVal" },
        { key: "CreditVal", value: "CreditVal" },
        { key: "Balance", value: "Balance" },
      ];

      return columns;
    } catch (e) {
      throw e;
    }
  }

}
