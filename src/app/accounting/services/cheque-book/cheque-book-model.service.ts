import { Injectable } from '@angular/core';
import { GridOption, UtilityService } from '../../index';
import { FixedIDs, GlobalMethods } from 'src/app/shared';
import { ChequeBookDTO } from '../../models/cheque-book/cheque-book';

@Injectable()
export class ChequeBookModelService {

  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  chequeBookDTO: ChequeBookDTO;
  tempchequeBookDTO: ChequeBookDTO;
  chequeBookList: any = [];
  companyList: any = [];
  officeBranchUnitList: any = [];
  projectList: any = [];
  bankAccountList: any = [];
  chequeTypeList: any = [];

  companyDDList: any = [];
  officeBranchUnitDDList: any = [];
  projectDDList: any = [];
  bankAccountDDList: any = [];
  accountDDList: any = [];
  chequeTypeDDList: any = [];
  chequeBookNumberDDList: any = [];
  chequeLeafNoDDList: any = [];
  amountDDList: any = [];
  usedDDList: any = [];
  clearedOnDateDDList: any = [];
  voucherNoDDList: any = [];
  voucherDateDDList: any = [];
  toAccountDDList: any = [];
  subLedgerNameDDList: any = [];
  chequedateDDList: any = [];
  lastUpdatedateDDList: any = [];
  statusDDList: any = [];
  chequeLeafNoStartDDList: any = [];
  chequeLeafNoEndDDList: any = [];

  //list
  chequeBookLeafManagementList: any = [];

  constructor(private utilitySvc: UtilityService) { }

  prepareEditForm(entity: any) {
    try {
      this.chequeBookDTO = new ChequeBookDTO(entity);
      this.tempchequeBookDTO = new ChequeBookDTO(entity);
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(entity: ChequeBookDTO) {
    try {
      this.utilitySvc.deleteCollection(this.chequeBookList, entity);
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

  prepareOfficeBranchUnit(data: any) {
    try {
      let categories = [
        {
          label: "-- Office --",
          value: "Office",
          items: [],
        },
        {
          label: "-- Branch --",
          value: "Branch",
          items: [],
        },

        {
          label: "-- Unit --",
          value: "Unit",
          items: [],
        }
      ];

      data.forEach((item) => {
        if (item.organizationElementID == FixedIDs.orgType.Office) {// office
          let catObj = categories.find((x) => x.value == "Office");
          if (catObj) {
            catObj.items.push(item);
          }
        } else if (item.organizationElementID == FixedIDs.orgType.Branch) {// Branch
          let catObj = categories.find((x) => x.value == "Branch");
          if (catObj) {
            catObj.items.push(item);
          }
        }
        else if (item.organizationElementID == FixedIDs.orgType.Unit) {// Unit
          let catObj = categories.find((x) => x.value == "Unit");
          if (catObj) {
            catObj.items.push(item);
          }
        }
      });
      return {
        categories: categories,
      };
    } catch (error) {
      throw error;
    }
  }

  exportCSVReport(gridOption: GridOption, values: any, column?: any[]) {
    this.utilitySvc.exportCSVReport(gridOption, values, column);
  }

}
