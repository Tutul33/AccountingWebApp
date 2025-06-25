import { Injectable } from '@angular/core';
import { FixedIDs, GlobalConstants, ValidatingObjectFormat } from 'src/app/app-shared';
import { formatDate } from '@angular/common';
import { TreeNode } from 'primeng/api';


@Injectable()
export class GroupLedgerModelService {
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  keyValuePair: any;
  groupLedgerList: any = [];
  companyList: any = [];
  projectList: any = [];
  officeBranchUnitList: any = [];
  searchParam: any = {};
  minDate: Date = null;
  maxDate = null;
  fromLedger: any = null;
  showDate: any;
  serverDataList: any[] = [];
  tempServerDataList: any[] = [];
  commonDropDownList: any = [];
  tempTreeData: any[] = [];
  selectedNode: any = null;
  treeDataList: TreeNode[];


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
        groupLedgerID: null,
        groupLedgerName: null,
        groupLedgerRptName: null
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

    // parent

    mapObjectProps(data: any[]) {
      try {
        return data.map((x) => {
          return {
            label: x.accountName,
            key: x.id,
            parentID: x.parentID,
            id: x.id,
            editParentID: x.editParentID,
            accountNatureCd: x.accountNatureCd,
            accountName: x.accountName,
            assetTypeCode: x.assetTypeCode,
            transactionNatureCode: x.transactionNatureCode,
            subLedgerTypeID: x.subLedgerTypeID,
            note: x.note,
            depreciationRate: x.depreciationRate,
            parentLedgerID: x.parentLedgerID,
            accountCode: x.accountCode,
            isHide: x.isHide,
            isActive: x.isActive,
            cOALevelCode: x.cOALevelCode,
  
            cOAStructureID: x.cOAStructureID, // for org and project
            selectedNode: false,
            cOAOrgMapID: x.cOAOrgMapID,
            orgID: x.orgID,
            projectID: x.projectID,
            tag: 0,
            isRoot: false,
            expandLevel: 0
  
          } as TreeNode;
        });
      } catch (error) {
        throw error;
      }
    }
  
    prepareTreeData(arr, parentID) {
      try {
        const master: any[] = [];
        let level = 1;
        for (let i = 0; i < arr.length; i++) {
          const val = arr[i];
          val.expandLevel = level;
          val.label = val.label;
          if (val.parentID == parentID) {
            const children = this.prepareTreeData(arr, val.key);
            if (children.length) {
              val.children = children;
            }
            level++;
            master.push(val);
          }
        }
        return master;
      } catch (error) {
        throw error;
      }
    }

    prepareTreeNodeLevel(node: any) {
      try {
        let treeLabelName = "";
        while (node && node.label) {
          treeLabelName += (treeLabelName ? " > " : "") + node.label;
          node = node.parent;
        }
        this.searchParam.groupLedgerRptName = treeLabelName;
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
            value: 'Group Ledger'
          },
          {
            key: "PrintedBy",
            value: GlobalConstants.userInfo.userName
          },
          {
            key: "GroupLedgerRptName",
            value: this.searchParam.groupLedgerRptName || null
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
          { key: "SL", value: "SL" },
          { key: "Date", value: "Date" },
          { key: "ToDate", value: "ToDate" },
          { key: "OrgID", value: "OrgID" },
          { key: "ProjectID", value: "ProjectID" },
          { key: "Particulars", value: "Particulars" },
          { key: "DebitVal", value: "DebitVal" },
          { key: "CreditVal", value: "CreditVal" },
        ];
  
        return columns;
      } catch (e) {
        throw e;
      }
    }

}
