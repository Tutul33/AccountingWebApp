import { Injectable } from '@angular/core';
import { GlobalConstants, ValidatingObjectFormat } from 'src/app/app-shared';


@Injectable()
export class AgingReportModelService {
  keyValuePair: any;

  companyList: any;
  branchList: any;
  projectList: any;
  officeBranchUnitList: any;
  agingList: any;
  subLedgerList: any =[];
  contactList: any =[];
  searchParam: any = {};
  minDate: Date = null;
  maxDate = null;
  ledgerId: any;
  subLedgerId: any;
  ledgerList: any;
  templedgerList: any = [];
  subLedgerTypeList: any;
  subLedgerName: any;
  ledgerName: any;

  totalCurrentBalance: number = 0;
  total30DaysBalance: number = 0;
  total60DaysBalance: number = 0;
  total90DaysBalance: number = 0;
  total120DaysBalance: number = 0;
  fromBank: any = null;
  showDate: any;

  formValidation(): any {
    return {
      formValidateModel: {

        companyID: {
          required: GlobalConstants.validationMsg.companyID,
        },
        orgID: {
          required: GlobalConstants.validationMsg.orgID,
        },
        ledgerID: {
          required: GlobalConstants.validationMsg.ledgerID,
        },
        subLedgerTypeID: {
          required: GlobalConstants.validationMsg.subLedgerTypeID,
        },
        asOnDate: {
          required: GlobalConstants.validationMsg.asOnDate,
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
        asOnDate: currentDate,
        orgID: null,
        unitBranch: null,
        project: null,
        projectID: null,
        ledgerID: this.ledgerId,
        subLedgerTypeID: null,
        ledgerName: null,
        subLedgerName: null,
        contactNo:null
      };
    } catch (e) {
      throw e;
    }
  }

  totalAmountData(list: any) {
    this.totalCurrentBalance = 0;
    this.total30DaysBalance = 0;
    this.total60DaysBalance = 0;
    this.total90DaysBalance = 0;
    this.total120DaysBalance = 0;
    list.forEach(element => {
      this.totalCurrentBalance += element.currentBalance;
      this.total30DaysBalance += element.daysBalance30;
      this.total60DaysBalance += element.daysBalance60;
      this.total90DaysBalance += element.daysBalance90;
      this.total120DaysBalance += element.daysBalance120;
    });
  }

    prepareFilterValue(filters:any){
    try {
      this.searchParam.subLedgerName = filters['subLedgerName'][0].value;
      this.searchParam.contactNo = filters['contactNo'][0].value;
    } catch (e) {
      throw e;
    }
  }

  prepareSearchParams() {
    try {
      let searchParams = [];
      if (this.searchParam.subLedgerName) searchParams.push(this.keyValuePair('subLedgerName', this.searchParam.subLedgerName || null));
      if (this.searchParam.contactNo !=null) searchParams.push(this.keyValuePair('contactNo', this.searchParam.contactNo || null));
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


  getRptParameter() {
    try {
      let asOndate = this.searchParam.asOnDate;
      const convertDate = new Date(asOndate);
      const formattedDate = convertDate.toDateString();//.split('T')[0];

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
          key: "AsOnDate",
          value: formattedDate || null
        },
        {
          key: "RptName",
          value: 'Aging Report'
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
          key: "SubLedgerName",
          value: this.searchParam.subLedgerName || null
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
        { key: "SubLedgerName", value: "SubLedgerName" },
        { key: "ContactNo", value: "ContactNo" },
        { key: "CurrentBalance", value: "CurrentBalance" },
        { key: "DaysBalance30", value: "DaysBalance30" },
        { key: "DaysBalance60", value: "DaysBalance60" },
        { key: "DaysBalance90", value: "DaysBalance90" },
        { key: "DaysBalance120", value: "DaysBalance120" },
      ];

      return columns;
    } catch (e) {
      throw e;
    }
  }

}
