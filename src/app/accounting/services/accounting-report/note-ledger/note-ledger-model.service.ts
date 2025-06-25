import { Injectable } from "@angular/core";
import { 
  GlobalConstants,
 } from "../../..";
import { formatDate } from "@angular/common";
@Injectable()
export class NoteLedgerModelService {
  fieldTitle:any;
  searchParam:any = {};
  companyList:any[] = [];
  officeBranchList:any[] = [];
  projectList:any[] = [];
  financialYearList:any[] = [];
  noteLedgerList:any[] = [];
  noteLedgerBalanceList:any[] = [];
  totalBalance:number = 0;
  constructor() {}

  setNewSearch(){
    this.searchParam = {
      companyID : GlobalConstants.userInfo.companyID,
      company: GlobalConstants.userInfo.company,
      orgID:null,
      unitBranch: null,
      projectID:null,
      project:null,
      financialYearID:null,
      date:null,
      noteNo:null,
      subGroupLedger:null
    }
  }
  prepareOrgList(res) {
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
        }
        else if (item.value == "Unit") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "unit");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
      });
      return orgList;
    } catch (error) {
      throw error;
    }
  }
  prepareTotalBalance(){
    try {
      this.totalBalance = this.noteLedgerBalanceList.reduce((sum, account) => sum + account.balance, 0) || 0;
    } catch (e) {
      throw e;
    }
  }
 
  getRptParameter() {
    try {
      let date = formatDate(this.searchParam.date, 'dd-MMM-yy', "en");
      var params = [
        {
          key: "CompanyLogoUrl",
          value: GlobalConstants.companyInfo.companyLogoUrl,
        },
        {
          key: "Currency",
          value: GlobalConstants.companyInfo.currency
        },
        {
          key: "Company",
          value: this.searchParam.company || null
        },
     
        {
          key: "UnitBranch",
          value: this.searchParam.orgID > 0 ? this.searchParam.unitBranch : null
        },
        {
          key: "Project",
          value: this.searchParam.projectID > 0 ? this.searchParam.project : null
        },
        {
          key: "Date",
          value: date 
        },
        {
          key: "CompanyShortAddress",
          value: this.noteLedgerBalanceList[0]?.companyShortAddress || null
        },
        {
          key: "NoteNo",
          value: this.searchParam.noteNo || null
        },
        {
          key: "SubGroupLedger",
          value: this.searchParam.subGroupLedger || null
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "ReportName",
          value: this.fieldTitle['noteledger']
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
        { key: 'SerialNo', value: 'SerialNo' },
        { key: 'Ledger', value: 'Ledger' },
        { key: 'Balance', value: 'Balance' }
      ];
      return columns;
    } catch (e) {
      throw e;
    }
  }
}
