import { Injectable } from "@angular/core";
import { 
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
 } from "../../..";
import { formatDate } from "@angular/common";
@Injectable()
export class BalanceSheetModelService {
  fieldTitle:any;
  searchParam:any = {};
  financialYearHead:any = {
    firstFinancialYear : null,
    secondFinancialYear : null, 
    thirdFinancialYear : null,
    fourthFinancialYear : null
  };
  keyValuePair:any;
  gridInvRefNoFilterValue:string = null;
  voucherList:any[] = [];
  companyList:any[] = [];
  officeBranchList:any[] = [];
  projectList:any[] = [];
  financialYearList:any[] = [];
  stockValuationMethodList:any[] = [];
  tempBalanceSheetList:any[] = [];
  balanceSheetList:any[] = [];
  isRefresh:boolean = true;
  assetTotal:any = {
    firstFinancialYearBalance: 0,
    secondFinancialYearBalance: 0,
    thirdFinancialYearBalance: 0,
    fourthFinancialYearBalance: 0
  };
  liabilitiesTotal:any = {
    firstFinancialYearBalance: 0,
    secondFinancialYearBalance: 0,
    thirdFinancialYearBalance: 0,
    fourthFinancialYearBalance: 0
  };
  serialNo:any = {
    firstFinancialYear: 0,
    secondFinancialYear: 1,
    thirdFinancialYear: 2,
    fourthFinancialYear: 3,
  }
  isSkippedControlLedger:boolean = false;
  constructor() {}

  setNewSearch(){
    let currentDate = new Date(GlobalConstants.serverDate);
    this.searchParam = {
      companyID : GlobalConstants.userInfo.companyID,
      company: GlobalConstants.userInfo.company,
      orgID:null,
      unitBranch: null,
      projectID:null,
      project:null,
      financialYearID:null,
      financialYearTodate:null,
      stockValuationMethodCd:null,
      fromDate: currentDate,
      toDate: currentDate,
      resultType:"1", // 1 = t shape, 2 = l shape 
      reportType:"1", // 1 = date as on, 2 = date range
      isAccountNature:true,
      isGroupLedger:true,
      isSubGroupLedger:true,
      isControlLedger: this.isSkippedControlLedger == false ? true : false,
      accountHead:null,
      isRequired:true
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
  prepareData(data){
    try {
      let list = [], accountHeadList = [];
      this.searchParam.accountHead = null;
      const accountNatureList = [...new Set(data.map(item => item.accountsNatureID))];
      accountNatureList.forEach(accountsNatureID => {
          let accountNature = data.find(a => a.accountsNatureID == accountsNatureID);
          let isShowAccountNatureTotal = !this.searchParam.isGroupLedger && !this.searchParam.isSubGroupLedger && !this.searchParam.isControlLedger;
          let accountNatureHeadCd = FixedIDs.accountHead.AccountNature;
          if(this.searchParam.isAccountNature)
          {
            if(isShowAccountNatureTotal)
            {
              list.push({
                accountNatureCd: accountNature.accountNatureCd,
                particular: accountNature.accountsNature,
                firstFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.firstFinancialYear, Number(accountsNatureID)),
                secondFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.secondFinancialYear, Number(accountsNatureID)),
                thirdFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.thirdFinancialYear, Number(accountsNatureID)),
                fourthFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.fourthFinancialYear, Number(accountsNatureID)),
              });
            }
            else{
              list.push({
                accountNatureCd: accountNature.accountNatureCd,
                particular: accountNature.accountsNature,
                firstFinancialYearBalance: null,
                secondFinancialYearBalance: null,
                thirdFinancialYearBalance: null,
                fourthFinancialYearBalance: null,
              });
            }
          }
        
          const groupLedgerList = [...new Set(data.filter(f => f.accountsNatureID == accountsNatureID).map(item => item.groupLedgerID))]; 
          groupLedgerList.forEach(groupLedgerID => {
            let groupLedger = data.find(a => a.groupLedgerID == groupLedgerID);
            
            let isShowGroupLedgerTotal = (!this.searchParam.isAccountNature && !this.searchParam.isSubGroupLedger && !this.searchParam.isControlLedger) ||
                     (this.searchParam.isAccountNature && !this.searchParam.isControlLedger && !this.searchParam.isSubGroupLedger);

            let groupLedgerCd = FixedIDs.accountHead.GroupLedger;
            let groupLedgerName = this.prepareSpace(groupLedgerCd) + groupLedger.groupLedger;
              if(this.searchParam.isGroupLedger)
              {
                if(isShowGroupLedgerTotal)
                {
                  list.push({
                    accountNatureCd: accountNature.accountNatureCd,
                    particular: groupLedgerName,
                    firstFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.firstFinancialYear, Number(groupLedgerID)),
                    secondFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.secondFinancialYear, Number(groupLedgerID)),
                    thirdFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.thirdFinancialYear, Number(groupLedgerID)),
                    fourthFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.fourthFinancialYear, Number(groupLedgerID)),
                  });
                }
                else{
                  list.push({
                    accountNatureCd: accountNature.accountNatureCd,
                    particular: groupLedgerName,
                    firstFinancialYearBalance: null,
                    secondFinancialYearBalance: null,
                    thirdFinancialYearBalance: null,
                    fourthFinancialYearBalance: null
                  });
                }
              }

              const subGroupLedgerList = [...new Set(data.filter(f => f.groupLedgerID == groupLedgerID).map(item => item.subGroupLedgerID))]; 
              subGroupLedgerList.forEach(subGroupLedgerID => {
                let subGroupLedger = data.find(a => a.subGroupLedgerID == subGroupLedgerID);
                
                let isShowSubGroupLedgerTotal = (!this.searchParam.isAccountNature && !this.searchParam.isGroupLedger && !this.searchParam.isControlLedger) ||
                                                ((this.searchParam.isAccountNature || this.searchParam.isGroupLedger) && !this.searchParam.isControlLedger);
                let subGroupLedgerCd = FixedIDs.accountHead.SubGroupLedger;
               let subGroupLedgerName = this.prepareSpace(subGroupLedgerCd) + subGroupLedger.subGroupLedger;
                if(this.searchParam.isSubGroupLedger)
                {
                  if(isShowSubGroupLedgerTotal == false)
                  {
                    list.push({
                      accountNatureCd: accountNature.accountNatureCd,
                      particular: subGroupLedgerName,
                      firstFinancialYearBalance: null,
                      secondFinancialYearBalance: null,
                      thirdFinancialYearBalance: null,
                      fourthFinancialYearBalance: null
                    });
                  }
                  else{
                    list.push({
                      accountNatureCd: accountNature.accountNatureCd,
                      particular: subGroupLedgerName,
                      firstFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.firstFinancialYear, Number(subGroupLedgerID)),
                      secondFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.secondFinancialYear, Number(subGroupLedgerID)),
                      thirdFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.thirdFinancialYear, Number(subGroupLedgerID)),
                      fourthFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.fourthFinancialYear, Number(subGroupLedgerID)),
                    });
                  }
                }
                
                if(this.searchParam.isControlLedger)
                {
                  const controlLedgerList = [...new Set(data.filter(f => f.subGroupLedgerID == subGroupLedgerID).map(item => item.controlLedgerID))]; 
                  controlLedgerList.forEach(controlLedgerID => {
                    let controlLedger = data.find(a => a.controlLedgerID == controlLedgerID);
                    let controllLedgerCd = FixedIDs.accountHead.ControlLedger;
                    let controlLedgerName = this.prepareSpace(controllLedgerCd) + controlLedger.controlLedger;
                    list.push({
                      accountNatureCd: accountNature.accountNatureCd,
                      particular: controlLedgerName,
                      firstFinancialYearBalance: this.prepareTotal(controllLedgerCd, null, this.serialNo.firstFinancialYear, Number(controlLedgerID)),
                      secondFinancialYearBalance: this.prepareTotal(controllLedgerCd, null, this.serialNo.secondFinancialYear, Number(controlLedgerID)),
                      thirdFinancialYearBalance: this.prepareTotal(controllLedgerCd, null, this.serialNo.thirdFinancialYear, Number(controlLedgerID)),
                      fourthFinancialYearBalance: this.prepareTotal(controllLedgerCd, null, this.serialNo.fourthFinancialYear, Number(controlLedgerID))
                    });
                  });
                }
                if(this.searchParam.isSubGroupLedger && !isShowSubGroupLedgerTotal)
                {
                  list.push({
                    accountNatureCd: accountNature.accountNatureCd,
                    particular: null,
                    firstFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.firstFinancialYear, Number(subGroupLedgerID)),
                    secondFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.secondFinancialYear, Number(subGroupLedgerID)),
                    thirdFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.thirdFinancialYear, Number(subGroupLedgerID)),
                    fourthFinancialYearBalance: this.prepareTotal(subGroupLedgerCd, null, this.serialNo.fourthFinancialYear, Number(subGroupLedgerID)),
                  });
                }
              });
              let isShowGroupLedgerLineTotal = this.searchParam.isGroupLedger && (!this.searchParam.isSubGroupLedger || !this.searchParam.isControlLedger);
              if(isShowGroupLedgerLineTotal && !isShowGroupLedgerTotal)
              {
                  list.push({
                    accountNatureCd: accountNature.accountNatureCd,
                    particular: null,
                    firstFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.firstFinancialYear, Number(groupLedgerID)),
                    secondFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.secondFinancialYear, Number(groupLedgerID)),
                    thirdFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.thirdFinancialYear, Number(groupLedgerID)),
                    fourthFinancialYearBalance: this.prepareTotal(groupLedgerCd, null, this.serialNo.fourthFinancialYear, Number(groupLedgerID)),
                  });
              }
          });

          let isShowAccountLedgerLineTotal = this.searchParam.isAccountNature && ((!this.searchParam.isSubGroupLedger && !this.searchParam.isControlLedger) || 
                                              (!this.searchParam.isGroupLedger && this.searchParam.isSubGroupLedger && !this.searchParam.isControlLedger) || 
                                              (!this.searchParam.isGroupLedger && !this.searchParam.isSubGroupLedger && this.searchParam.isControlLedger));
          
          if(isShowAccountLedgerLineTotal && !isShowAccountNatureTotal)
          {
            list.push({
              accountNatureCd: accountNature.accountNatureCd,
              particular: null,
              firstFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.firstFinancialYear, Number(accountsNatureID)),
              secondFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.secondFinancialYear, Number(accountsNatureID)),
              thirdFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.thirdFinancialYear, Number(accountsNatureID)),
              fourthFinancialYearBalance: this.prepareTotal(accountNatureHeadCd, null, this.serialNo.fourthFinancialYear, Number(accountsNatureID)),
            });
          }
      });

      /**************Prepare account head**************/
      if(this.searchParam.isAccountNature) accountHeadList.push(this.fieldTitle['accountnature']);
      if(this.searchParam.isGroupLedger) accountHeadList.push(this.fieldTitle['groupledger']);
      if(this.searchParam.isSubGroupLedger) accountHeadList.push(this.fieldTitle['subgroupledger']);
      if(this.searchParam.isControlLedger) accountHeadList.push(this.fieldTitle['controlledger']);
      this.searchParam.accountHead = '(' + accountHeadList.join(', ') + ')';
      return list;
    } catch (error) {
      throw error;
    }
  }
  prepareTotal(accountHeadCd:number, accountNatureCd:number, serialNo:number, accountHeadID?:number){
    try {
      let total = 0;
      switch (accountHeadCd) {
        case FixedIDs.accountHead.AccountNature:
          total = this.tempBalanceSheetList.filter(f => f.accountsNatureID == accountHeadID && f.serialNo == serialNo && f.balance != null).reduce((sum, account) => sum + account.balance, 0) || 0;
          break;
        case FixedIDs.accountHead.GroupLedger:
          total = this.tempBalanceSheetList.filter(f => f.groupLedgerID == accountHeadID && f.serialNo == serialNo && f.balance != null).reduce((sum, account) => sum + account.balance, 0) || 0;
          break;
        case FixedIDs.accountHead.SubGroupLedger:
          total = this.tempBalanceSheetList.filter(f => f.subGroupLedgerID == accountHeadID && f.serialNo == serialNo && f.balance != null).reduce((sum, account) => sum + account.balance, 0) || 0;
          break;
        case FixedIDs.accountHead.ControlLedger:
          total = this.tempBalanceSheetList.filter(f => f.controlLedgerID == accountHeadID && f.serialNo == serialNo && f.balance != null).reduce((sum, account) => sum + account.balance, 0) || 0;
          break;
        default:
          if(accountNatureCd == FixedIDs.accountingNature.Assets)
          {
            total = this.tempBalanceSheetList.filter(f => f.accountNatureCd == accountNatureCd && f.serialNo == serialNo && f.balance != null).reduce((sum, account) => sum + account.balance, 0) || 0;
          }
          else if(accountNatureCd == FixedIDs.accountingNature.Liabilities)
          {
            total = this.tempBalanceSheetList.filter(f => (f.accountNatureCd == accountNatureCd || f.accountNatureCd == FixedIDs.accountingNature.Equity) && f.serialNo == serialNo && f.balance != null).reduce((sum, account) => sum + account.balance, 0) || 0;
          }
          break;
      }
      return GlobalMethods.convertToNumberFormat(total, 'en-IN', 2, 2);
    } catch (e) {
      throw e;
    }
  }

  prepareSpace(accountHeadCd:number){
    try {
      let space = 0;
      switch (accountHeadCd) {
        case FixedIDs.accountHead.GroupLedger:
            if(this.searchParam.isAccountNature)
            {
              space += 5;
            }
          break;
        case FixedIDs.accountHead.SubGroupLedger:
          if(this.searchParam.isAccountNature)
          {
            space += 5;
          }
          if(this.searchParam.isGroupLedger)
          {
            space += 5;
          }
        break;
        case FixedIDs.accountHead.ControlLedger:
            if(this.searchParam.isAccountNature)
            {
              space += 5;
            }
            if(this.searchParam.isGroupLedger)
            {
              space += 5;
            }
            if(this.searchParam.isSubGroupLedger)
            {
              space += 5;
            }
        break;
        default:
          break;
      }
      return this.prepareTotalSpace(space);
    } catch (e) {
      throw e;
    }
  }

  prepareTotalSpace(space:number)
  {
    let spaceText = '';
    for (let index = 0; index < space; index++) {
      spaceText += ' '; 
    }
    return spaceText;
  }

  prepareGrandTotal(){
    try {
      this.assetTotal = {
        firstFinancialYearBalance: 0,
        secondFinancialYearBalance: 0,
        thirdFinancialYearBalance: 0,
        fourthFinancialYearBalance: 0
      };
      this.liabilitiesTotal = {
        firstFinancialYearBalance: 0,
        secondFinancialYearBalance: 0,
        thirdFinancialYearBalance: 0,
        fourthFinancialYearBalance: 0
      };
      if(this.searchParam.isAccountNature || this.searchParam.isGroupLedger || this.searchParam.isSubGroupLedger || this.searchParam.isControlLedger)
      {
          let assetsCd = FixedIDs.accountingNature.Assets;
          let liabilitiesCd = FixedIDs.accountingNature.Liabilities;
          //prepare asset total
          this.assetTotal ={
            firstFinancialYearBalance: this.prepareTotal(null, assetsCd, this.serialNo.firstFinancialYear),
            secondFinancialYearBalance: this.prepareTotal(null, assetsCd, this.serialNo.secondFinancialYear),
            thirdFinancialYearBalance: this.prepareTotal(null, assetsCd, this.serialNo.thirdFinancialYear),
            fourthFinancialYearBalance: this.prepareTotal(null, assetsCd, this.serialNo.fourthFinancialYear)
          };
          // prepare liabilities total
          this.liabilitiesTotal ={
            firstFinancialYearBalance: this.prepareTotal(null, liabilitiesCd, this.serialNo.firstFinancialYear),
            secondFinancialYearBalance: this.prepareTotal(null, liabilitiesCd, this.serialNo.secondFinancialYear),
            thirdFinancialYearBalance: this.prepareTotal(null, liabilitiesCd, this.serialNo.thirdFinancialYear),
            fourthFinancialYearBalance: this.prepareTotal(null, liabilitiesCd, this.serialNo.fourthFinancialYear)
          };
      }
    } catch (e) {
      throw e;
    }
  }
  prepareFinancialHeadName(){
    try {
      this.financialYearHead = {
        firstFinancialYear : (this.tempBalanceSheetList.find(f => f.serialNo == this.serialNo.firstFinancialYear)?.financialYear || '') + ' ' + this.fieldTitle['amount'] + ' (' + GlobalConstants.companyInfo.currency + ')',
        secondFinancialYear : (this.tempBalanceSheetList.find(f => f.serialNo == this.serialNo.secondFinancialYear)?.financialYear || '') + ' ' + this.fieldTitle['amount'] + ' (' + GlobalConstants.companyInfo.currency + ')',
        thirdFinancialYear : (this.tempBalanceSheetList.find(f => f.serialNo == this.serialNo.thirdFinancialYear)?.financialYear || '') + ' ' + this.fieldTitle['amount'] + ' (' + GlobalConstants.companyInfo.currency + ')',
        fourthFinancialYear : (this.tempBalanceSheetList.find(f => f.serialNo == this.serialNo.fourthFinancialYear)?.financialYear || '') + ' ' + this.fieldTitle['amount'] + ' (' + GlobalConstants.companyInfo.currency + ')'
      }
      

       } catch (e) {
      throw e;
    }
  }

  getRptParameter() {
    try {
      let reportType = null;
      if(this.searchParam.reportType == '1')
      {
        reportType = this.fieldTitle['ason'] + ': ' + this.searchParam.financialYearTodate;
      }
      else{
        reportType = this.fieldTitle['daterange'] + ': ' + formatDate(this.searchParam.fromDate, "dd-MMM-yyyy", "en") + ' to ' + formatDate(this.searchParam.toDate, "dd-MMM-yyyy", "en");
      }

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
          key: "CompanyShortAddress",
          value: this.tempBalanceSheetList[0]?.companyShortAddress || null
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
          key: "FinancialYearTodate",
          value: reportType || null
        },
        {
          key: "FirstFinancialYear",
          value: this.financialYearHead.firstFinancialYear || null
        },
        {
          key: "SecondFinancialYear",
          value: this.financialYearHead.secondFinancialYear || null
        },
        {
          key: "ThirdFinancialYear",
          value: this.financialYearHead.thirdFinancialYear || null
        },
        {
          key: "FourthFinancialYear",
          value: this.financialYearHead.fourthFinancialYear || null
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "AccountHead",
          value: this.searchParam.accountHead
        },
        {
          key: "ReportName",
          value: this.fieldTitle['balancesheetstatement']
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
        { key: 'Particular', value: 'Particular' },
        { key: 'FirstFinancialYearBalance', value: 'FirstFinancialYearBalance' },
        { key: 'SecondFinancialYearBalance', value: 'SecondFinancialYearBalance' },
        { key: 'ThirdFinancialYearBalance', value: 'ThirdFinancialYearBalance' },
        { key: 'FourthFinancialYearBalance', value: 'FourthFinancialYearBalance' },
      ];
      return columns;
    } catch (e) {
      throw e;
    }
  }





}
