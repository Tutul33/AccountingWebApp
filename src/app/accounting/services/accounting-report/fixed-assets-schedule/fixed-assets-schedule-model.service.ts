import { Injectable } from "@angular/core";
import { 
  GlobalConstants,
 } from "../../..";
import { formatDate } from "@angular/common";
@Injectable()
export class FixedAssetsScheduleModelService {
  fieldTitle:any;
  searchParam:any = {};
  companyList:any[] = [];
  officeBranchList:any[] = [];
  projectList:any[] = [];
  financialYearList:any[] = [];
  fixedAssetsScheduleList:any[] = [];
  total:any = {};
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
      fromDate:null,
      toDate:null
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
      this.total = {};
      this.total.assetsOpeningBalance = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.assetsOpeningBalance, 0) || 0;
      this.total.assetsDebitVal = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.assetsDebitVal, 0) || 0;
      this.total.assetsCreditVal = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.assetsCreditVal, 0) || 0;
      this.total.assetsTotal = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.assetsTotal, 0) || 0;
      this.total.depOpeningBalance = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.depOpeningBalance, 0) || 0;
      this.total.depCreditVal = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.depCreditVal, 0) || 0;
      this.total.depTotal = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.depTotal, 0) || 0;
      this.total.writtenDownValue = this.fixedAssetsScheduleList.reduce((sum, item) => sum + item.writtenDownValue, 0) || 0;
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
          key: "CompanyShortAddress",
          value: this.fixedAssetsScheduleList[0]?.companyShortAddress || null
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "FilterDate",
          value: 'As On: ' +  formatDate(this.searchParam.toDate, 'dd-MMM-yy', "en") || null
        },
        {
          key: "ReportName",
          value: this.fieldTitle['scheduleoffixedassets']
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
       
      ];
      return columns;
    } catch (e) {
      throw e;
    }
  }

}
