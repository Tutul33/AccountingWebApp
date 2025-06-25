import { Injectable } from '@angular/core';
import { Config, GlobalConstants, GlobalMethods  } from 'src/app/shared';
import { BankReconciliationDTO } from "../../models/bank-reconciliation/bank-reconciliation";
import { map } from 'rxjs/operators';
import { FileUploadOption, QueryData } from 'src/app/shared/models/common.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { Observable} from 'rxjs';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Injectable()
export class BankReconciliationDataService {

  spData: any = new QueryData();
  controllerName = Config.url.accountingLocalUrl + "BankReconciliation";
  constructor(private apiSvc: ApiService, private fileUploadSvc: FileUploadService) { this.spData.pageNo = 0; }


  save(bankReconciliationDTO: BankReconciliationDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, bankReconciliationDTO, true);
  }

  getBankReconciliationLedgerList(): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetBankReconciliationLedgerList`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }

  getBankReconciliationList(spData : any): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetBankReconciliationList`, { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getBankReconciliationTransactionsList(): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetBankReconciliationTransactionsList`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }

  getOpenFinancialYearDateList(): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetOpenFinancialYearDateList`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1];
        })
      );
  }
}


@Injectable()
export class BankReconciliationModelService {
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  isSingleBrnach: boolean = false;
  isSingleProject: boolean = false;
  isSingleBank: boolean = false;

  bankReconciliationDTO: BankReconciliationDTO;
  tempBankReconciliationDTO: BankReconciliationDTO;
  companyList: any = [];
  officeBranchUnitList: any = [];
  projectList: any = [];
  openFinancialYearDateList: any = [];
  bankReconciliationList: any = [];
  bankReconciliationLedgerList: any = [];
  tempBankReconciliationLedgerList: any = [];
  bankReconciliationTransactionsList: any = [];
  minDate: Date = null;
  maxDate: Date = null;
  fileUploadOption: FileUploadOption;
  decimalPlace: number = 3;

  
  fromDateDDList: any = [];
  toDateDDList: any = [];
  companyDDList: any = [];
  orgDDList: any = [];
  projectDDList: any = [];
  bankAccountDDList: any = [];
  statusDDList: any = [];
  
  constructor() { }

  prepareData() {
    try {
      this.bankReconciliationDTO = new BankReconciliationDTO();
      this.tempBankReconciliationDTO = new BankReconciliationDTO();
      this.bankReconciliationDTO.companyID = GlobalConstants.userInfo.companyID;
      this.bankReconciliationDTO.imageFile.fileTick = GlobalMethods.timeTick();
      this.setFileUploadOption();

      this.tempBankReconciliationDTO = this.bankReconciliationDTO;
    } catch (error) {
      throw error;
    }
  }


  loadBankAccounts() {
    try {
      this.bankReconciliationLedgerList = this.tempBankReconciliationLedgerList;
      
      const dto = this.bankReconciliationDTO;
      const { companyID, orgID, projectID } = dto;
  
      // if (companyID) {
      //   let filteredList = this.bankReconciliationLedgerList.filter(item => {
      //     return item.companyID === companyID &&
      //       (orgID == null || item.orgID === orgID) &&
      //       (projectID == null || item.projectID === projectID);
      //   });
  
      //   this.bankReconciliationLedgerList = filteredList;
      // } last final ok this


      if (companyID) {
        if(orgID || projectID)
        { 
          let filteredList = this.bankReconciliationLedgerList.filter(item => {
            if(orgID && projectID)
            {
              return item.companyID === companyID &&
              item.orgID === orgID &&
              item.projectID === projectID;
            }
            else if(orgID && projectID == null)
            {
              return item.companyID === companyID &&
              item.orgID === orgID &&
              item.projectID == null;
            }
            else if(projectID && orgID == null)
            {
              return item.companyID === companyID &&
              item.projectID === projectID &&
              item.orgID == null;
            }
          });
    
          this.bankReconciliationLedgerList = filteredList;
        }
        else {
          let filteredList = this.bankReconciliationLedgerList.filter(item => {
            return item.companyID == null && item.orgID == null && item.projectID == null;
          });

          this.bankReconciliationLedgerList = filteredList;
        }
        
      }
    } catch (error) {
      throw error;
    }
  }
  

  prepareOfficeBranchUnitList(res) {
    try {
      if(res.length == 1)
      {
        this.officeBranchUnitList = res || [];
      }
      else
      {
        this.bankReconciliationDTO.orgID = null;

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
      }


    } catch (error) {
      throw error;
    }
  }

  setFileUploadOption() {
    try {  
      this.fileUploadOption = new FileUploadOption();
      this.fileUploadOption.folderName = Config.imageFolders.bankReconciliation;
      this.fileUploadOption.acceptedFiles = ".png,.jpg,.jpeg,.ico,.svg,.pdf";
      this.fileUploadOption.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  checkFinancialYearValidation() {
    try {
      let fDate = new Date(this.bankReconciliationDTO.reconcilationDateFrom);
      let tDate = new Date(this.bankReconciliationDTO.reconcilationDateTo);
      let fromDate = this.dateConvertion(fDate);
      let toDate = this.dateConvertion(tDate);

      let fyFDate = new Date(this.openFinancialYearDateList[0].financialYearFromDate);
      let fyTDate = new Date(this.openFinancialYearDateList[0].financialYearToDate);
      let financilaYearFromDate = this.dateConvertion(fyFDate);
      let financilaYearToDate = this.dateConvertion(fyTDate);

      if(fromDate >= financilaYearFromDate && toDate <= financilaYearToDate)
      {
        return true;
      }
      else
      {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  prepareDataBeforeSave() {
    try {
      this.bankReconciliationDTO.fileName = this.bankReconciliationDTO.imageFile.fileName;
      this.bankReconciliationDTO.auditedDiscrepancy = this.bankReconciliationDTO.bankBalance;
      
    } catch (error) {
      throw error;
    }
  }

  dateConvertion(date) {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // JS months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      throw error;
    }
  }

  public hasValidBranchProject() {
    try {
      let isInValid=false;

      if(this.isBranchModuleActive && !this.bankReconciliationDTO.orgID){
        isInValid=true;
      }

      return isInValid;
    } catch (error) {
      throw error;
      
    }
  }

  manageDropdownList() {
    try {
      if(this.officeBranchUnitList.length == 1)
      {
        this.isSingleBrnach = true;
        this.bankReconciliationDTO.orgID = this.officeBranchUnitList[0].id;
      }
      else
      {
        this.isSingleBrnach = false;
        this.bankReconciliationDTO.orgID = null;
      }
      if(this.projectList.length == 1)
      {
        this.isSingleProject = true;
        this.bankReconciliationDTO.projectID = this.projectList[0].id;
      }
      else
      {
        this.isSingleProject = false;
        this.bankReconciliationDTO.projectID = null;
      }
      if(this.bankReconciliationLedgerList.length == 1)
      {
        this.isSingleBank = true;
        this.bankReconciliationDTO.cOAStructID = this.bankReconciliationLedgerList[0].cOAStructureID;
      }
      else
      {
        this.isSingleBank = false;
        this.bankReconciliationDTO.cOAStructID = null;
      }
    } catch (error) {
      throw error;
    }
  }


}