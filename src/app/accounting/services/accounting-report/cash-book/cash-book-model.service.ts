import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { GlobalConstants, ValidatingObjectFormat } from 'src/app/app-shared';


@Injectable()
export class CashBookModelService {
  keyValuePair: any;

  companyList: any;
  projectList: any;
  officeBranchUnitList: any;
  cashBookList: any;
  searchParam: any = {};
  minDate: Date = null;
  maxDate = null;
  ledgerId: any;
  cashList: any;

  formValidation(): any {
    return {
      formValidateModel: {

        companyID: {
          required: GlobalConstants.validationMsg.companyID,
        },
        // orgID: {
        //   required: GlobalConstants.validationMsg.orgID,
        // },
        cashLedgerID: {
          required: GlobalConstants.validationMsg.cashLedgerID,
        },
        fromDate: {
          required: GlobalConstants.validationMsg.fromDate,
        },
        toDate: {
          required: GlobalConstants.validationMsg.toDate,
        }
      } as ValidatingObjectFormat,
    };
  }

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
        project: null,
        projectID: null,
        cashLedgerID: this.ledgerId
      };
    } catch (e) {
      throw e;
    }
  }




  calculateBalance(cashBookList: any) {
    try {
      let closeingBal = cashBookList[0].balance;
      let countRow = 0;
      cashBookList.forEach(element => {
        if (countRow >= 1) {
          closeingBal += element.balance
          if (Number(element.creditVal) == 0) {
            closeingBal += Number(element.debitVal)
            element.balance = closeingBal;
          } else {
            closeingBal -= Number(element.creditVal)
            element.balance = closeingBal;
          }
        }
        countRow++;

      });
      return cashBookList;
    } catch (e) {
      throw e;
    }
  }
  
  totalDebit: number = 0;
  totalCredit: number = 0;
  closeingBalance: number = 0;
  fromBank: any = null;
  showDate: any;

  summaryData(cashBookList:any) {
    try {
      if (cashBookList.length > 0) {
          this.totalDebit = cashBookList[0].totalDebit;
          this.totalCredit = cashBookList[0].totalCredit;
          this.closeingBalance = 0;
          this.fromBank = null;
          this.closeingBalance = cashBookList[0].closingBalance;
          this.fromBank = this.cashList.find(x => x.id == this.searchParam.cashLedgerID).ledger;
          this.showDate = formatDate(this.searchParam.toDate, "dd-MMM-yyyy", "en")
        }
    } catch (e) {
      throw e;
    }
  }
  prepareSearchParams() {
    try {
      let searchParams = [];
      if (this.searchParam.orgID) searchParams.push(this.keyValuePair('orgID', this.searchParam.orgID || null));
      if (this.searchParam.projectID) searchParams.push(this.keyValuePair('projectID', this.searchParam.projectID || null));
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
          value: this.searchParam.companyName || null
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
          value: 'Cash Book'
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "LedgerName",
          value: this.fromBank
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
