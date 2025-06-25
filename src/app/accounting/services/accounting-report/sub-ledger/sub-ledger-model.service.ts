import { Injectable } from '@angular/core';
import { GlobalConstants } from 'src/app/app-shared';
import { formatDate } from '@angular/common';


@Injectable()
export class SubLedgerModelService {
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  keyValuePair: any;
  companyList: any;
  projectList: any;
  officeBranchUnitList: any;
  ledgerNameList: any = [];
  subLedgerTypeList: any = [];
  ledgerList: any;
  tempLedgerList: any;
  subLedgerList: any = [];
  searchParam: any = {};
  minDate: Date = null;
  maxDate = null;
  totalDebit: number = 0;
  totalCredit: number = 0;
  closeingBalance: number = 0;
  fromLedger: any = null;
  showDate: any;


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
        subLedgerTypeID: null,
        subLedgerTypeName: null,
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

      if (this.ledgerNameList.length > 0) {
        this.searchParam.ledgerID = this.ledgerNameList[0].id;
        this.searchParam.ledgerName = this.ledgerNameList[0].ledger;
      }
    } catch (error) {
      throw error;
    }
  }

  prepareGridData() {
    try {
      //let sl = 0;
      this.totalDebit = 0;
      this.totalCredit = 0;
      this.fromLedger = null;

      this.fromLedger = this.searchParam.ledgerName;
      this.showDate = formatDate(this.searchParam.toDate, "dd-MM-yyyy", "en")

      this.totalDebit = Number(this.subLedgerList[0].totalDebit);
      this.totalCredit = Number(this.subLedgerList[0].totalCredit);

      this.subLedgerList.forEach(element => {
        // sl++;
        // element.sL = sl;
        // if(element.payableVal < 0)
        // {
        //   element.receivableVal -= element.payableVal;
        //   element.payableVal = 0;
        // }
        // if(element.receivableVal < 0)
        // {
        //   element.payableVal -= element.receivableVal;
        //   element.receivableVal = 0;
        // }

        // this.totalDebit += Number(element.payableVal);
        // this.totalCredit += Number(element.receivableVal);

        if(element.payableVal == 0)
        {
          element.payableVal = "";
        } 
        else if(element.receivableVal == 0)
        {
          element.receivableVal = "";
        }
      });
    } catch (error) {
      throw error;
    }
  }


  /********************* Report *************************/


  prepareGridDataForReport(subLedgerList) {
    try {
      let sl = 0;
      this.totalDebit = 0;
      this.totalCredit = 0;
      this.fromLedger = null;

      this.fromLedger = this.searchParam.ledgerName;
      this.showDate = formatDate(this.searchParam.toDate, "dd-MM-yyyy", "en");

      // this.totalDebit = Number(this.subLedgerList[0].totalDebit);
      // this.totalCredit = Number(this.subLedgerList[0].totalCredit);

      subLedgerList.forEach(element => {
        // sl++;
        // element.sL = sl;
        // if(element.payableVal < 0)
        // {
        //   element.receivableVal -= element.payableVal;
        //   element.payableVal = 0;
        // }
        // if(element.receivableVal < 0)
        // {
        //   element.payableVal -= element.receivableVal;
        //   element.receivableVal = 0;
        // }

        // this.totalDebit += Number(element.payableVal);
        // this.totalCredit += Number(element.receivableVal);

        if(element.payableVal == 0)
        {
          element.payableVal = 0;
        } 
        else if(element.receivableVal == 0)
        {
          element.receivableVal = 0;
        }
      });
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
          value: 'Sub Ledger'
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "LedgerName",
          value: this.searchParam.ledgerName || null
        },
        {
          key: "SubLedgerTypeName",
          value: this.searchParam.subLedgerTypeName || null
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
        //{ key: "Date", value: "Date" },
        { key: "SL", value: "SL" },
        { key: "Particulars", value: "Particulars" },
        { key: "PayableVal", value: "PayableVal" },
        { key: "ReceivableVal", value: "ReceivableVal" },
      ];

      return columns;
    } catch (e) {
      throw e;
    }
  }

}
