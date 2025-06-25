import { Injectable } from "@angular/core";
import { Config, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods, GridOption, QueryData } from "src/app/app-shared";
import { FormControl, FormGroup, UntypedFormGroup } from "@angular/forms";
import { LedgerSummary, LedgerSummaryAttachmnet, LedgerSummaryDetail } from "../../models/opening-balance/opening-balance";
import { UtilityService } from "../..";


@Injectable()
export class OpeningBalanceModelService {

  ledgerSummaryDTO: LedgerSummary = new LedgerSummary();
  financialYearTitle: string = null;
  financialYearID: number = 0;
  financialYearEndDate: string = null;
  companyList: any = [];
  officeBranchList: any = [];
  projectList: any = [];
  coaStructureList: any[] = [];
  subLedgerDetailList: any[] = [];
  openingBalanceForm: UntypedFormGroup;
  subLedgerList: any;
  ledgerList: any;

  totalDebit = 0;
  totalCredit = 0;

  //for list
  openingBalanceList: any = [];
  spData: any = new QueryData();
  isSelectAll:boolean =false;

  //for bulk upload
  fileUpload: any;
  fileOption = new FileUploadOption();
  newFileInfo: any;
  //gridOption: GridOption;


  dataSourceAttachment: LedgerSummaryAttachmnet = new LedgerSummaryAttachmnet();

  constructor(private utilitySvc: UtilityService
  ) {

  }

  initiate() {
    this.ledgerSummaryDTO = new LedgerSummary({
      name :  this. financialYearTitle,
      financialYearID : this. financialYearID,
      financialDate : this. financialYearEndDate});
  }

  onReset() {
    try {
      this.initiate();
      // this.openingBalanceForm?.reset();
    } catch (error) {
      throw error;
    }
  }

  addNewItem() {
    try {
      let ledgerSummaryDetail = new LedgerSummaryDetail();
      this.ledgerSummaryDTO.ledgerSummaryDetailList.entityPush(ledgerSummaryDetail);
    } catch (error) {
      throw error;
    }
  }

  removeLedgerSummaryDetail(item) {
    try {
     // this.utilitySvc.deleteCollection(this.ledgerSummaryDTO.ledgerSummaryDetailList, item);
      //item.setDeleteTag();
      this.ledgerSummaryDTO.ledgerSummaryDetailList.entityPop(item);
      this.checkTotalValue();
      this.openingBalanceForm.markAsDirty();
    } catch (error) {
      throw error;
    }
  }


  onDebitFieldChange(entity) {
    try {
      if (entity.debitVal > 0) 
      {
        entity.creditVal = 0;
        let form=this.openingBalanceForm.controls['child_'+ entity.id] as FormGroup;
        form.controls['creditVal'].reset(0);
      }
      this.checkTotalValue();
      this.openingBalanceForm.markAsDirty();
    
    } catch (error) {
      throw error;
    }
  }

  onCreditFieldChange(entity) {
    try {
      if (entity.creditVal > 0)
        {
          entity.debitVal = 0;
          let form=this.openingBalanceForm.controls['child_'+ entity.id] as FormGroup;
          form.controls['debitVal'].reset(0);
        } 
      this.checkTotalValue();
      this.openingBalanceForm.markAsDirty();
    } catch (error) {
      throw error;
    }
  }

  checkEmptyList() {
    try {
      this.ledgerSummaryDTO.ledgerSummaryDetailList = this.ledgerSummaryDTO.ledgerSummaryDetailList.filter(x=>x.creditVal !=null && x.debitVal !=null);
    
      if(this.ledgerSummaryDTO.id >= 0){

      }
      if (this.ledgerSummaryDTO.ledgerSummaryDetailList.length > 0) return false;
      else return true;
    }
    catch (e) {
      throw e;
    }
  }

  checkEmptyListForEdit() {
    try {
      this.ledgerSummaryDTO.ledgerSummaryDetailList = this.ledgerSummaryDTO.ledgerSummaryDetailList.filter(x=>x.creditVal !=null && x.debitVal !=null);
    
      if (this.ledgerSummaryDTO.ledgerSummaryDetailList.length > 0) return false;
      else return true;
    }
    catch (e) {
      throw e;
    }
  }

  checkTotalValue() {
    try {
      if (this.ledgerSummaryDTO.ledgerSummaryDetailList.length > 0) {
        this.totalDebit = 0;
        this.totalCredit = 0;
        for (let i = 0; i < this.ledgerSummaryDTO.ledgerSummaryDetailList.length; i++) {
          if (this.ledgerSummaryDTO.ledgerSummaryDetailList[i].tag != 2) {
            this.totalDebit += Number(this.ledgerSummaryDTO.ledgerSummaryDetailList[i].debitVal) || 0;
            this.totalCredit += Number(this.ledgerSummaryDTO.ledgerSummaryDetailList[i].creditVal) || 0;
          }

        }

        return this.totalDebit === this.totalCredit;
      } else {
        this.totalDebit = 0;
        this.totalCredit = 0;
      }
    }
    catch (e) {
      throw e;
    }
  }

 

  checkDuplicateByProperty(arr: any[], propA: keyof any, propB: keyof any): boolean {
    try {
      arr =arr.filter(x=>x.tag !=2);
      const seen = new Set<string>();
      for (const item of arr) {
        const key = `${item[propA]}|${item[propB]}`;
        if (seen.has(key)) {
          return true; // Duplicate found
        }
        seen.add(key);
      }
      return false; // No duplicates
    } catch (error) {

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

  //start bulk upoad
  fileUploadOption() {
    try {
      this.fileOption.isMultipleSelection = false;
      this.fileOption.isMultipleUpload = false;
      this.fileOption.uploadServiceUrl = "File/UploadFiles";
      this.fileOption.acceptedFiles = '.csv,.xlsx,.xls';
      this.fileOption.folderName = Config.imageFolders.openingBalance;
      this.fileOption.fileTick = GlobalMethods.timeTick() + 1;
      return this.fileOption;
    } catch (error) {

    }

  }

  configFilePath() {
    try {
      this.newFileInfo = GlobalMethods.deepClone<any>(this.fileOption);
      this.newFileInfo.id = 0;
      this.newFileInfo.isThumbnailFormat = true;
      this.newFileInfo.userID = GlobalConstants.userInfo.userPKID;
      this.newFileInfo.name = GlobalConstants.userInfo.userName;
      this.newFileInfo.financialYearID = this.ledgerSummaryDTO.financialYearID;
      this.newFileInfo.companyID = this.ledgerSummaryDTO.companyID;
      this.newFileInfo.orgID = this.ledgerSummaryDTO.orgID;
      this.newFileInfo.projectID = this.ledgerSummaryDTO.projectID;
    } catch (error) {

    }

  }

  prepareBulkUpload() {
    try {
      this.newFileInfo.financialYearID = this.ledgerSummaryDTO.financialYearID;
      this.newFileInfo.companyID = this.ledgerSummaryDTO.companyID;
      this.newFileInfo.orgID = this.ledgerSummaryDTO.orgID;
      this.newFileInfo.projectID = this.ledgerSummaryDTO.projectID;
      this.newFileInfo.locationID = GlobalConstants.userInfo.locationID;
    } catch (error) {

    }
  }

  exportCSVReport(gridOption: GridOption, values: any, column?: any[]) {
    this.utilitySvc.exportCSVReport(gridOption, values, column);
  }
  //end bulk upolad

  checkDebitCreditZero(){
    try {
      this.ledgerSummaryDTO.ledgerSummaryDetailList.forEach(element => {
        
        if(element.creditVal == 0 && element.debitVal == 0 && element.tag != FixedIDs.objectState.deleted)
        {
          let creditValform = this.openingBalanceForm.controls['child_'+ element.id] as FormGroup;
          creditValform.controls['creditVal'].reset();

          let debitValform = this.openingBalanceForm.controls['child_'+ element.id] as FormGroup;
          debitValform.controls['debitVal'].reset();
        }
      });
    } catch (e) {
     throw e; 
    }
  }

   imageFileUploadOption(defaultObj?: any){
    const fileOption = new FileUploadOption()
    defaultObj = defaultObj || {};
    fileOption.acceptedFiles = '.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xlsx,.csv';
    fileOption.folderName = Config.imageFolders.openingBalance;
    fileOption.uploadServiceUrl = "File/UploadFiles";
    fileOption.fileTick = defaultObj?.fileTick || GlobalMethods.timeTick() + 1;
    fileOption.isMultipleUpload = false;
    fileOption.isMultipleSelection = false;
    return fileOption;
  }
}
