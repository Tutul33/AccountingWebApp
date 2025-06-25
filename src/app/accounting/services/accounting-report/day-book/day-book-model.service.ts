import { Injectable } from '@angular/core';
import { GlobalConstants } from 'src/app/app-shared';


@Injectable()
export class DayBookModelService {
  keyValuePair: any;

  companyList: any;
  projectList: any;
  officeBranchUnitList: any;
  dayBookList: any;
  searchParam: any = {};
  minDate: Date = null;
  maxDate = null;
  ledgerId: any;

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
        project:null,
        projectID: null,
      };
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
          value: 'Day Book'
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
        { key: "FromAccount", value: "FromAccount" },
        { key: "FromSubLedger", value: "FromSubLedger" },
        { key: "Description", value: "Description" },
        { key: "ChequeNo", value: "ChequeNo" },
        { key: "ChequeDate", value: "ChequeDate" },
        { key: "ToAccount", value: "ToAccount" },
        { key: "ToSubLedger", value: "ToSubLedger" },
        { key: "InvoiceBillRefNo", value: "InvoiceBillRefNo" },
        { key: "DebitVal", value: "DebitVal" },
        { key: "CreditVal", value: "CreditVal" },
        { key: "InsertDateTime", value: "InsertDateTime" },
        { key: "LastUpdate", value: "LastUpdate" },
      ];

      
      return columns;
    } catch (e) {
      throw e;
    }
  }

  


}
