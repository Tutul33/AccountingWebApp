import { Injectable } from "@angular/core";
import {
  VoucherAttachment,
  VoucherModel,
} from "../../models/voucher/voucher.model";
import {
  imageFileUploadOption,
  VoucherItemAttachment,
  VoucherItemModel,
} from "../../models/voucher/voucher-item.model";
import {
  Config,
  FileUploadOption,
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
  UtilityService,
} from "src/app/admin";
import { UntypedFormGroup } from "@angular/forms";

@Injectable()
export class JournalVoucherModelService {
  multiJournalVoucherForm: UntypedFormGroup;
  singleJournalVoucherForm: UntypedFormGroup;
  journalVoucherModel: VoucherModel = new VoucherModel();
  tempVoucherModel: any;
  tempVoucherModelForReset: any;
  validityVoucherEntryEdit: any[]=[];
  allSubLedgerDetailList: any[] = [];
  orgList: any[] = [];
  rawOrgList: any[] = [];
  coaStructureList: any[] = [];  
  subLedgerDetailList: any[] = [];
  projectList: any[] = [];
  financialYearAll: any[] = [];
  financialYear: any[] = [];
  minDate: Date = null;
  maxDate: Date = null;
  isSingleEditMode:boolean=false;
  isMultipleEditMode:boolean=false;
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  totalDebit:number=0;
  totalCredit:number=0;  
  finalVoucherModel:any;

  // Journal Voucher List //
  fieldTitle: any;
  searchParam: any = {};
  keyValuePair: any;
  fileUploadOption: FileUploadOption; 

  journalVourcherList: any = [];
  companyList: any = [];
  officeBranchUnitList: any = [];
  projectsList: any = [];
  ledgerList: any = [];
  tempLedgerList: any = [];
  subLedgerTypeList: any = [];
  subLedgerList: any = [];
  tempSubLedgerList: any = [];
  gridLedgerList:any[] = [];
  gridSubLedgerTypeList:any[] = [];
  gridSubledgerDetailList:any[] = [];
  gridDebitList:any[] = [];
  gridCreidList:any[] = [];
  gridCreatedByList:any[] = [];
  gridModifiedByList:any[] = [];
  gridDraftStatusLlist:any[] = [];

  lockVoucherEditList: any = [];

  constructor(private utilitySvc: UtilityService) {}

  initiate() {
    this.journalVoucherModel = new VoucherModel();
    this.journalVoucherModel.companyID = GlobalConstants.userInfo.companyID;
    this.journalVoucherModel.company = GlobalConstants.userInfo.company;
    this.journalVoucherModel.voucherDate = new Date();
  }

  addNewItem() {
    try {
      let objJournalVoucherItem = new VoucherItemModel();

      this.filterCOAStructure(objJournalVoucherItem,this.journalVoucherModel.orgID,this.journalVoucherModel.projectID);

      this.journalVoucherModel.voucherItemList.entityPush(
        objJournalVoucherItem
      );

    } catch (error) {
      throw error;
    }
  }
  financialYearMinDate: Date = null;
  financialYearMaxDate: Date = null;
  lockEditTillMinDate: Date = null;
  lockEntryTillMinDate: Date = null;

  setMinDateMaxDate() {
    try {
      this.financialYear = this.financialYearAll.filter((x) => x.status != 12);
      if (this.financialYear.length) {
        const minDate = new Date(
          Math.min(
            ...this.financialYear.map((item) =>
              new Date(item.fromDate).getTime()
            )
          )
        );
        const maxDate = new Date(
          Math.max(
            ...this.financialYear.map((item) => new Date(item.toDate).getTime())
          )
        );
        this.financialYearMinDate = minDate;
        this.financialYearMaxDate = maxDate;
      }
      if (this.validityVoucherEntryEdit.length) {
        const minDateLockEdit = new Date(
          Math.min(
            ...this.validityVoucherEntryEdit.map((item) =>
              new Date(item.lockEditTillDate).getTime()
            )
          )
        );
        const minDateLockEntry = new Date(
          Math.max(
            ...this.validityVoucherEntryEdit.map((item) =>
              new Date(item.lockEntryTillDate).getTime()
            )
          )
        );
        this.lockEditTillMinDate = minDateLockEdit;
        this.lockEntryTillMinDate = minDateLockEntry;
      }
    } catch (error) {
      throw error;
    }
  }

  setMinMaxDateBasedOnComapnyProjectOrg() {
    try {
      if (this.journalVoucherModel.id) {
        const lockEditTillDate = this.lockEditTillMinDate;
        if (lockEditTillDate && this.financialYearMinDate) {
          this.minDate =
            this.financialYearMinDate < lockEditTillDate
              ? this.financialYearMinDate
              : lockEditTillDate;
        } else if (!lockEditTillDate && this.financialYearMinDate) {
          this.minDate = this.financialYearMinDate;
        }

        if (lockEditTillDate && this.financialYearMaxDate) {
          this.maxDate =
            this.financialYearMaxDate > lockEditTillDate
              ? this.financialYearMaxDate
              : lockEditTillDate;
        } else if (!lockEditTillDate && this.financialYearMaxDate) {
          this.maxDate = this.financialYearMaxDate;
        }
      } else {
        const lockEntryTillDate = this.lockEntryTillMinDate;
        if (lockEntryTillDate && this.financialYearMinDate) {
          this.minDate =
            this.financialYearMinDate < lockEntryTillDate
              ? this.financialYearMinDate
              : lockEntryTillDate;
        } else if (!lockEntryTillDate && this.financialYearMinDate) {
          this.minDate = this.financialYearMinDate;
        }

        if (lockEntryTillDate && this.financialYearMaxDate) {
          this.maxDate =
            this.financialYearMaxDate > lockEntryTillDate
              ? this.financialYearMaxDate
              : lockEntryTillDate;
        } else if (!lockEntryTillDate && this.financialYearMaxDate) {
          this.maxDate = this.financialYearMaxDate;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  setMinMaxBasedOnLockEntryEditDateMulti() {
    try {
      if (
        !this.journalVoucherModel.orgID &&
        !this.journalVoucherModel.projectID
      ) {
      } else if (
        !this.journalVoucherModel.orgID &&
        this.journalVoucherModel.projectID
      ) {
      } else if (
        this.journalVoucherModel.orgID &&
        this.journalVoucherModel.projectID
      ) {
      }
    } catch (error) {
      throw error;
    }
  }

  removeItem(item) {
    try {
      if(item.tag==4){
        this.journalVoucherModel.voucherItemList.entityPop(item);
     }else{
       item.setDeleteTag();
       item.voucherItemAttachmentList.forEach((file)=>{
       file.deletedFileName=file.fileName;
       file.setDeleteTag();
     });
     }
     
      this.multiJournalVoucherForm.markAsDirty();
      //this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  resetFormMultiple() {
    try {
      this.initiate();
      this.journalVoucherModel.isMultiEntry = true;
    } catch (error) {
      throw error;
    }
  }

  resetFormSingle() {
    try {
      this.initiate();
      this.journalVoucherModel.isMultiEntry = false;
    } catch (error) {
      throw error;
    }
  }

  //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected And Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
  checkValidityOfFromAccountSubLedgerAndToAccountSubLedger() {
    try {
      const fromSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.fromSubLedgerTypeID
      );
      const toSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.toSubLedgerTypeID
      );
      if (
        this.journalVoucherModel.fromCOAStructID > 0 &&
        !this.journalVoucherModel.fromSubLedgerDetailID &&
        fromSubLedgerDetailList.length &&
        this.journalVoucherModel.toCOAStructID > 0 &&
        !this.journalVoucherModel.toSubLedgerDetailID &&
        toSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
  //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected
  checkValidityOfFromAccountSubLedger() {
    try {
      const fromSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.fromSubLedgerTypeID
      );

      if (
        this.journalVoucherModel.fromCOAStructID > 0 &&
        !this.journalVoucherModel.fromSubLedgerDetailID &&
        fromSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
  //Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
  checkValidityOfToAccountSubLedger() {
    try {
      const toSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.toSubLedgerTypeID
      );

      if (
        this.journalVoucherModel.toCOAStructID > 0 &&
        !this.journalVoucherModel.toSubLedgerDetailID &&
        toSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
  //Check Validity -- Same From Account and To Account but no subledger list
  checkValidityOfNoSubLedgerButSameFromAndToAccount() {
    try {
      const fromSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.fromSubLedgerTypeID
      );
      const toSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.toSubLedgerTypeID
      );

      if (
        this.journalVoucherModel.toCOAStructID ==
          this.journalVoucherModel.fromCOAStructID &&
        !fromSubLedgerDetailList.length &&
        !toSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  prepareDataForSingleEntry() {
    try {
      if (!this.journalVoucherModel.id) {
        let objJournalVoucherItem = new VoucherItemModel(
          this.journalVoucherModel
        );
        objJournalVoucherItem.imageFileUploadOpton = this.journalVoucherModel.imageFileUploadOpton;
        this.journalVoucherModel.voucherAttachmentList.forEach((attach) => {
          const objAttach = new VoucherItemAttachment(attach);
          objJournalVoucherItem.voucherItemAttachmentList.push(objAttach);
        });
        this.journalVoucherModel.insertDateTime = new Date();
        this.journalVoucherModel.voucherItemList = [];      
        objJournalVoucherItem.description = this.journalVoucherModel.description;
        objJournalVoucherItem.transactionID = 0;
        this.journalVoucherModel.voucherItemList.entityPush(
          objJournalVoucherItem
        );

        this.journalVoucherModel.voucherTypeCd = FixedIDs.voucherType.JournalVoucher.code;
        this.journalVoucherModel.voucherTitleCd = FixedIDs.voucherTitleCd.journalVoucher.code;
        this.journalVoucherModel.createdByID = GlobalConstants.userInfo.userPKID;
        this.journalVoucherModel.approvalStatus = FixedIDs.approvalStatus.Pending;
        this.journalVoucherModel.dateID = 0;
        this.journalVoucherModel.isDraft =  this.journalVoucherModel.isDraft || false;
        this.journalVoucherModel.isMultiEntry = false;
        this.journalVoucherModel.insertUserID =GlobalConstants.userInfo.userPKID;
        this.setCodeGenProperty();
      } else {
        let objJournalVoucherItem = new VoucherItemModel(
          this.journalVoucherModel
        );
        this.journalVoucherModel.voucherAttachmentList.forEach((attach) => {
          const objAttach = new VoucherItemAttachment(attach);
          if (objAttach.tag == 2) {
            objAttach.deletedFileName = attach.fileName;
          }
          objAttach.voucherItemID = this.journalVoucherModel.voucherItemID;
          objJournalVoucherItem.voucherItemAttachmentList.push(objAttach);
        });
        this.journalVoucherModel.isDraft =
          this.journalVoucherModel.isDraft || false;
        this.journalVoucherModel.voucherItemList = [];
        //objJournalVoucherItem.projectID = this.journalVoucherModel.projectID;
        objJournalVoucherItem.id = this.journalVoucherModel.voucherItemID;
        objJournalVoucherItem.voucherID = this.journalVoucherModel.id;
        objJournalVoucherItem.transactionID =0;
        objJournalVoucherItem.setModifyTag();
        this.journalVoucherModel.voucherItemList.push(objJournalVoucherItem);
        this.journalVoucherModel.editUserID = GlobalConstants.userInfo.userPKID;
      }
    } catch (error) {
      throw error;
    }
  }
  setCodeGenProperty() {
    try {
      const condeGenPropertyVal = GlobalMethods.codeGenProperty();
      condeGenPropertyVal.voucherTypeShortName =
        FixedIDs.voucherType.JournalVoucher.shortName;
      this.journalVoucherModel.codeGenPropertyVal = JSON.stringify(
        condeGenPropertyVal
      ).toString();
    } catch (error) {
      throw error;
    }
  }
  prepareDataForMultiEntry() {
    try {
      if (!this.journalVoucherModel.id) {
        this.journalVoucherModel.voucherTypeCd = FixedIDs.voucherType.JournalVoucher.code;
        this.journalVoucherModel.voucherTitleCd = FixedIDs.voucherTitleCd.journalVoucher.code;
        this.journalVoucherModel.createdByID = GlobalConstants.userInfo.userPKID;
        this.journalVoucherModel.insertUserID = GlobalConstants.userInfo.userPKID;
        this.journalVoucherModel.approvalStatus = FixedIDs.approvalStatus.Pending;
        this.journalVoucherModel.dateID = 0;
        this.journalVoucherModel.isMultiEntry = true;
        this.journalVoucherModel.isDraft = this.journalVoucherModel.isDraft || false;
        this.journalVoucherModel.voucherItemList.forEach((item) => {
          item.transactionID = 0;
        });
        this.setCodeGenProperty();
      } else {
        this.journalVoucherModel.isDraft = this.journalVoucherModel.isDraft || false;
        this.journalVoucherModel.editUserID = GlobalConstants.userInfo.userPKID;
        this.journalVoucherModel.voucherItemList.forEach((item) => {
            item.transactionID = 0;
        });
      }
    } catch (error) {
      throw error;
    }
  }

  checkAmountValidation(){
    try {
      let isInvalid=false;
      this.journalVoucherModel.voucherItemList.forEach((item)=>{
        if(item.debitVal==0 && item.creditVal==0){
          isInvalid=true;
          return;
        }
      });
      return isInvalid;
    } catch (error) {
      throw error;
    }
  }

  checkEntryEditValidity() {
    try {
      let isInvalid = false;
      let message = "";
  
      const { financialYearMinDate, financialYearMaxDate, journalVoucherModel, validityVoucherEntryEdit} = this;
      const { voucherDate, orgID, projectID, id } = journalVoucherModel;
  
      if (financialYearMinDate && financialYearMaxDate) {
        if (!(financialYearMinDate <= voucherDate && financialYearMaxDate >= voucherDate)) {
          isInvalid = true;
          message = "2261";
          return { isInvalid, message };
        }
      }
  
      const lockEntryEdit = validityVoucherEntryEdit?.find((x) =>
        (!orgID || x.orgID == orgID) &&
        (!projectID || x.projectID == projectID)
      );
  
      if (lockEntryEdit) {
        const lockEntryTillDate = new Date(lockEntryEdit.lockEntryTillDate);
        const lockEditTillDate = new Date(lockEntryEdit.lockEditTillDate);
        const voucherDateObj = new Date(voucherDate);
  
        const isEntryable = lockEntryTillDate ? voucherDateObj > lockEntryTillDate : true;
        const isEditable = lockEditTillDate ? voucherDateObj > lockEditTillDate : true;
  
        if (!isEntryable && !id) {           
          message = "2274";
          isInvalid = true;
          return { isInvalid, message };
        }

        if (!isEditable && id) {           
          message = "2277";
          isInvalid = true;
          return { isInvalid, message };
        }
      }
  
      return { isInvalid, message };
    } catch (error) {
      throw error;
    }
  }

  setTempVoucher(model) {
    try {
      this.finalVoucherModel = GlobalMethods.deepClone(this.journalVoucherModel);
      this.finalVoucherModel.voucherItemList.forEach(item => {
        this.swapDebitCreditAmount(item);
      });
    } catch (error) {
      throw error;
    }
  }

  prepareDataForEdit(data: any) {
    try {
      const model = data;
      if (model.isMultiEntry) {
        this.journalVoucherModel = new VoucherModel(model);
        this.journalVoucherModel.id = model.id;
        this.journalVoucherModel.voucherDate = new Date(model.voucherDate);
        this.journalVoucherModel.company = model.company;
        this.journalVoucherModel.dateID = model.dateID;
        this.journalVoucherModel.voucherTypeCd = model.voucherTypeCd;
        this.journalVoucherModel.companyID = model.companyID;
        this.journalVoucherModel.orgID = model.orgID;
        this.journalVoucherModel.voucherNo = model.voucherNo;
        this.journalVoucherModel.remarks = model.remarks;
        this.journalVoucherModel.createdByID = model.createdByID;
        this.journalVoucherModel.approvedByID = model.approvedByID;
        this.journalVoucherModel.approvalStatus = model.approvalStatus;
        this.journalVoucherModel.isMultiEntry = model.isMultiEntry;
        this.journalVoucherModel.voucherTitleCd = model.voucherTitleCd;
        this.journalVoucherModel.isDraft = model.isDraft;
        this.journalVoucherModel.isActive = model.isActive;
        this.journalVoucherModel.insertDateTime=new Date(model.insertDateTime);
        this.journalVoucherModel.insertUserID=model.createdByID;
        this.journalVoucherModel.voucherItemList.forEach((item: any) => {
          item.id = item.voucherItemID;
          item.imageFileUploadOpton = imageFileUploadOption();
          if(item.voucherItemAttachmentList.length){
            const voucherItemAttachmentList= item.voucherItemAttachmentList;
            item.voucherItemAttachmentList=[];
            voucherItemAttachmentList.forEach((atch)=>{
              const fileAttach = new VoucherAttachment();
              fileAttach.fileName = atch.fileName;
              fileAttach.folderName = "voucher";
              fileAttach.id = atch.voucherItemAttachmentID;
              fileAttach.voucherItemID = atch.voucherItemID;
              item.voucherItemAttachmentList.push(fileAttach);
            });
            
          }
    
          this.swapDebitCreditAmount(item);
        
         // setTimeout(() => {
            item.fromCOAStructID = item.fromCOAStructID;
            item.fromSubLedgerDetailID = item.fromSubLedgerDetailID;
            item.toCOAStructID = item.toCOAStructID;
            item.toSubLedgerDetailID = item.toSubLedgerDetailID;
           
         // }, 5);
        });
      } else {

        this.journalVoucherModel = new VoucherModel(model);
        this.journalVoucherModel.voucherDate = new Date(model.voucherDate);
        this.journalVoucherModel.insertDateTime=new Date(model.insertDateTime);
        this.journalVoucherModel.dateID = model.dateID;
        this.journalVoucherModel.orgID = model.orgID;
        this.journalVoucherModel.insertUserID=model.createdByID;
        this.journalVoucherModel.id = model.id;

        this.journalVoucherModel.approvedByID = this.journalVoucherModel.approvedByID || null;
        this.journalVoucherModel.editUserID = this.journalVoucherModel.editUserID || null;
        this.journalVoucherModel.voucherTitleCd = this.journalVoucherModel.voucherTitleCd || null;
        this.journalVoucherModel.voucherItemList.forEach((item) => {
          this.journalVoucherModel.fromCOAStructID = item.fromCOAStructID;
          this.journalVoucherModel.fromSubLedgerTypeID = item.fromSubLedgerTypeID;
          this.journalVoucherModel.toCOAStructID = item.toCOAStructID;
          this.journalVoucherModel.toSubLedgerTypeID = item.toSubLedgerTypeID;
          this.journalVoucherModel.description = item.description;
          this.journalVoucherModel.voucherItemID = item.voucherItemID;
          this.journalVoucherModel.debitVal = item.debitVal;
          this.journalVoucherModel.creditVal = item.creditVal;

          this.swapDebitCreditAmount(this.journalVoucherModel);
         
         // setTimeout(() => {
            this.journalVoucherModel.fromSubLedgerDetailID = item.fromSubLedgerDetailID;
            this.journalVoucherModel.toSubLedgerDetailID = item.toSubLedgerDetailID;
              
          //}, 5);

          const itemFiles = item.voucherItemAttachmentList.filter(
            (x) => x.fileName
          );

          itemFiles.forEach((element) => {
            const fileAttach = new VoucherAttachment();
            fileAttach.fileName = element.fileName;
            fileAttach.folderName = "voucher";
            fileAttach.id = element.voucherItemAttachmentID;
            fileAttach.voucherItemID = element.voucherItemID;
            this.journalVoucherModel.voucherAttachmentList.push(fileAttach);
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }

  swapDebitCreditAmount(item){
    try {
      if(item.debitVal>0){
        item.creditVal=item.debitVal;
        item.debitVal=0;
      }else
      if(item.creditVal>0){
        item.debitVal=item.creditVal;
        item.creditVal=0;
      }
    } catch (error) {
      throw error;
    }
  }

  prepareDataModelSingleEntry(data) {
    try {
      this.journalVoucherModel = new VoucherModel(data);
      this.journalVoucherModel.id = data.id;
      this.journalVoucherModel.voucherDate = new Date(data.voucherDate);
      this.journalVoucherModel.company = data.company;
      this.journalVoucherModel.dateID = data.dateID;
      this.journalVoucherModel.voucherTypeCd = data.voucherTypeCd;
      this.journalVoucherModel.companyID = data.companyID;
      this.journalVoucherModel.orgID = data.orgID;
      this.journalVoucherModel.voucherNo = data.voucherNo;
      this.journalVoucherModel.projectID = data.projectID;
      this.journalVoucherModel.createdByID = data.createdByID;
      this.journalVoucherModel.approvedByID = data.approvedByID;
      this.journalVoucherModel.approvalStatus = data.approvalStatus;
      this.journalVoucherModel.isMultiEntry = data.isMultiEntry;
      this.journalVoucherModel.voucherTitleCd = data.voucherTitleCd;
      this.journalVoucherModel.isDraft = data.isDraft;
      this.journalVoucherModel.isActive = data.isActive;
      this.journalVoucherModel.locationID = data.locationID;
      this.journalVoucherModel.insertUserID = data.insertUserID;

      data.voucherItemList.forEach((item: any) => {
        this.filterCOAStructure(this.journalVoucherModel,this.journalVoucherModel.orgID,item.projectID);
        this.journalVoucherModel.voucherItemID = item.id;
        item.voucherItemID = item.id;
        this.journalVoucherModel.fromCOAStructID = item.fromCOAStructID;
        this.journalVoucherModel.fromCoaStructBalance = item.fromCoaStructBalance;
        this.journalVoucherModel.fromSubLedgerDetailID =item.fromSubLedgerDetailID;
        this.journalVoucherModel.fromSubLedgerTypeID =item.fromSubLedgerTypeID;
        this.journalVoucherModel.fromSubLedgerBalance =item.fromSubLedgerBalance;
        
        this.journalVoucherModel.toCOAStructID = item.toCOAStructID;
        this.journalVoucherModel.toAccountBalance = item.toAccountBalance;
        this.journalVoucherModel.toSubLedgerDetailID = item.toSubLedgerDetailID;
        this.journalVoucherModel.toSubLedgerTypeID = item.toSubLedgerTypeID;
        this.journalVoucherModel.toSubledgerBalance = item.toSubledgerBalance;

        this.filterSubLedgerDetail(this.journalVoucherModel);

        this.journalVoucherModel.debitVal = item.debitVal;
        this.journalVoucherModel.creditVal = item.creditVal;
        this.journalVoucherModel.voucherAttachmentList = item.voucherItemAttachmentList;
 
        this.journalVoucherModel.description = item.description;
        this.swapDebitCreditAmount(item);
        this.swapDebitCreditAmount(this.journalVoucherModel);
      });
    } catch (error) {
      throw error;
    }
  }

  prepareDataModelMultiEntry(data) {
    try {
      this.journalVoucherModel = new VoucherModel(data);
      this.journalVoucherModel.id = data.id;
      this.journalVoucherModel.voucherDate = new Date(data.voucherDate);
      this.journalVoucherModel.company = data.company;
      this.journalVoucherModel.dateID = data.dateID;
      this.journalVoucherModel.voucherTypeCd = data.voucherTypeCd;
      this.journalVoucherModel.companyID = data.companyID;
      this.journalVoucherModel.orgID = data.orgID;
      this.journalVoucherModel.voucherNo = data.voucherNo;
      this.journalVoucherModel.remarks = data.remarks;
      this.journalVoucherModel.createdByID = data.createdByID;
      this.journalVoucherModel.approvedByID = data.approvedByID;
      this.journalVoucherModel.approvalStatus = data.approvalStatus;
      this.journalVoucherModel.isMultiEntry = data.isMultiEntry;
      this.journalVoucherModel.voucherTitleCd = data.voucherTitleCd;
      this.journalVoucherModel.isDraft = data.isDraft;
      this.journalVoucherModel.isActive = data.isActive;

      this.journalVoucherModel.voucherItemList.forEach(
        (item: VoucherItemModel) => {
          item.voucherItemID=item.id;
          item.imageFileUploadOpton = imageFileUploadOption();
          this.filterCOAStructure(item,this.journalVoucherModel.orgID,this.journalVoucherModel.projectID);
          this.filterSubLedgerDetail(item);
          this.swapDebitCreditAmount(item);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  prepareDataAfterSave(data) {
    try {
      if (data.isMultiEntry) {
        this.prepareDataModelMultiEntry(data);
        this.processBalances();
      } else {
        this.prepareDataModelSingleEntry(data);
      }
        
    } catch (error) {
      throw error;
    }
  }

  onDebitFieldChange(entity) {
    try {
      if (entity.debitVal > 0) 
        entity.creditVal = 0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  onCreditFieldChange(entity) {
    try {
      if (entity.creditVal > 0) 
        entity.debitVal = 0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  checkSubLedgerFromAccount(entity: any) {
    try {
      if (
        entity.fromCOAStructID == entity.toCOAStructID &&
        entity.fromSubLedgerDetailID == entity.toSubLedgerDetailID
      ) {
        entity.fromSubLedgerDetailID = null;
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerFromAccount(entity: any, balance) {
    try {
      entity.fromSubLedgerBalance = balance || 0;      
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerFromAccountMulti(entity: any, balance) {
    try {
      entity.fromSubLedgerBalance = balance || 0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  checkSubLedgerToAccount(entity: any) {
    try {
      if (
        entity.fromCOAStructID == entity.toCOAStructID &&
        entity.fromSubLedgerDetailID == entity.toSubLedgerDetailID
      ) {
        entity.toSubLedgerDetailID = null;
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerToAccount(entity: any, balance) {
    try {
      entity.toSubledgerBalance = balance || 0;

      //this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerToAccountMulti(entity: any, balance) {
    try {

      entity.toSubledgerBalance = balance || 0;

      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  checkValidityForDuplicateMultiEntry() {
    try {
      const candidateData = this.journalVoucherModel.voucherItemList.filter(
        (x) =>
          x.fromCOAStructID &&
          x.fromSubLedgerDetailID ||true &&
          x.toCOAStructID && x.toSubLedgerDetailID || true
      );
      //Extract only the relevant properties
      const filteredData = candidateData.map(({ fromCOAStructID,
        fromSubLedgerDetailID,
        toCOAStructID, toSubLedgerDetailID }) => ({
        fromCOAStructID,
        fromSubLedgerDetailID,
        toCOAStructID,
        toSubLedgerDetailID,
      }));

      //Count occurrences of each filtered row
      const rowCounts = new Map();

      filteredData.forEach((row) => {
        const key = JSON.stringify(row); // Use stringified row as a unique key
        rowCounts.set(key, (rowCounts.get(key) || 0) + 1);
      });

      // Find rows with more than one occurrence
      const hasDuplicates = Array.from(rowCounts.values()).some(
        (count) => count > 1
      );
      return hasDuplicates;
    } catch (error) {
      throw error;
    }
  }

  onSelectFromAccount(item, balance) {
    try {
      this.setFromAccountBalance(item, balance);
    } catch (error) {
      throw error;
    }
  }

  setFromAccountBalance(item, balance) {
    try {
      item.fromCoaStructBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  onSelectToAccount(item, balance) {
    try {
      this.setToAccountBalance(item, balance);
    } catch (error) {
      throw error;
    }
  }

  setToAccountBalance(item, balance) {
    try {
      item.toAccountBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  onSelectFromAccountMulti(item: VoucherItemModel, balance) {
    try {
      item.fromCoaStructBalance = balance;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  onSelectToAccountMulti(item: VoucherItemModel, balance) {
    try {
      item.toAccountBalance = balance || 0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  checkValidityOfFromAccountSubLedgerAndToAccountSubLedgerMulti(item) {
    try {
      if (
        item.fromCOAStructID > 0 &&
        !item.fromSubLedgerDetailID &&
        item.fromSubLedgerDetailList.length &&
        item.toCOAStructID > 0 &&
        !item.toSubLedgerDetailID &&
        item.toSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  checkValidityOfFromAccountSubLedgerMulti(item) {
    try {
      const fromSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.fromSubLedgerTypeID
      );

      if (
        item.fromCOAStructID > 0 &&
        !this.journalVoucherModel.fromSubLedgerDetailID &&
        fromSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  checkValidityOfToAccountSubLedgerMulti() {
    try {
      const toSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.toSubLedgerTypeID
      );

      if (
        this.journalVoucherModel.toCOAStructID > 0 &&
        !this.journalVoucherModel.toSubLedgerDetailID &&
        toSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  checkValidityOfNoSubLedgerButSameFromAndToAccountMulti() {
    try {
      const fromSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.fromSubLedgerTypeID
      );
      const toSubLedgerDetailList = this.subLedgerDetailList.filter(
        (x) => x.subLedgerTypeID == this.journalVoucherModel.toSubLedgerTypeID
      );

      if (
        this.journalVoucherModel.toCOAStructID ==
          this.journalVoucherModel.fromCOAStructID &&
        !fromSubLedgerDetailList.length &&
        !toSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  checkDataValidityForMultiEntry() {
    try {
      let isInvalid = false;
      let isInvalidCaseOne = false;
      let isInvalidCaseTwo = false;
      let isInvalidCaseThree = false;
      let isInvalidCaseFour = false;
      let index = 0;
      const items = this.journalVoucherModel.voucherItemList;

      while (!isInvalid && index < items.length) {
        const item = items[index];
        const fromSubLedgerDetailList = this.subLedgerDetailList.filter(
          (x) => x.subLedgerTypeID == item.fromSubLedgerTypeID
        );
        const toSubLedgerDetailList = this.subLedgerDetailList.filter(
          (x) => x.subLedgerTypeID == item.toSubLedgerTypeID
        );

        //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected And Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
        if (
          item.fromCOAStructID > 0 &&
          !item.fromSubLedgerDetailID &&
          fromSubLedgerDetailList.length &&
          item.toCOAStructID > 0 &&
          !item.toSubLedgerDetailID &&
          toSubLedgerDetailList.length
        ) {
          isInvalid = true;
          isInvalidCaseOne = true;
        } //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected
        else if (
          item.fromCOAStructID > 0 &&
          !item.fromSubLedgerDetailID &&
          fromSubLedgerDetailList.length
        ) {
          isInvalid = true;
          isInvalidCaseTwo = true;
        } //Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
        else if (
          item.toCOAStructID > 0 &&
          !item.toSubLedgerDetailID &&
          toSubLedgerDetailList.length
        ) {
          isInvalid = true;
          isInvalidCaseThree = true;
        }
        //Check Validity -- Same From Account and To Account but no subledger list
        else if (
          item.toCOAStructID === item.fromCOAStructID &&
          !fromSubLedgerDetailList.length &&
          !toSubLedgerDetailList.length
        ) {
          isInvalid = true;
          isInvalidCaseFour = true;
        }

        index++;
      }

      return {
        isInvalid,
        isInvalidCaseOne,
        isInvalidCaseTwo,
        isInvalidCaseThree,
        isInvalidCaseFour,
      };
    } catch (error) {
      throw error;
    }
  }

  processBalances() {
    try {
      // Group data by toCOAStructID, toSubLedgerDetailID, and projectID
      const groupedData = {};
      //Prepare candidate data in group wise manner
      for (const row of this.journalVoucherModel.voucherItemList) {
        let groupKey = "";
        if (row.fromCOAStructID && row.fromSubLedgerDetailID) {
          //First Group condition
          groupKey = `${row.fromCOAStructID}-${row.fromSubLedgerDetailID}`;
           //First Group condition
           if (!groupedData[groupKey]) {
             groupedData[groupKey] = [];
           }
           groupedData[groupKey].push(row);

           groupKey = `${row.fromCOAStructID}`;
           
           if (!groupedData[groupKey]) {
             groupedData[groupKey] = [];
           }
           groupedData[groupKey].push(row);
        } else if (row.fromCOAStructID) {
          //Third Group condition
          groupKey = `${row.fromCOAStructID}`;

          if (!groupedData[groupKey]) {
            groupedData[groupKey] = [];
          }
          groupedData[groupKey].push(row);
        }       
      }

      // Iterate through each group and calculate balances
      for (const groupKey in groupedData) {
        const group = groupedData[groupKey];

        for (let i = 0; i < group.length; i++) {
          const currentRow = group[i];

          if (i > 0) {
            //Get Previous Data of defined group
            const prevRow = group[i - 1];

            // Calculate fromCoaStructBalance
            if (prevRow.debitVal !== 0 && prevRow.debitVal !== null) {             
              const accountNatureCode= currentRow.fromCoaStructureList.find(x=>x.id==currentRow.fromCOAStructID)?.accountNatureCd;
              if(accountNatureCode==FixedIDs.accountingNature.Expenses || accountNatureCode==FixedIDs.accountingNature.Assets)
              {
                currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance + +prevRow.debitVal;
              }else if(accountNatureCode==FixedIDs.accountingNature.Income || accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance - +prevRow.debitVal;
              }

            } else 
            if (prevRow.creditVal !== null && prevRow.creditVal !== null) {
              const accountNatureCode= currentRow.fromCoaStructureList.find(x=>x.id==currentRow.fromCOAStructID)?.accountNatureCd;
              if(accountNatureCode==FixedIDs.accountingNature.Expenses || accountNatureCode==FixedIDs.accountingNature.Assets)
              {
                currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance - +prevRow.creditVal;
              }else if(accountNatureCode==FixedIDs.accountingNature.Income || accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance + +prevRow.creditVal;
              }
            } else {
              if (prevRow.fromCoaStructBalance)
                currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance;
            }

            // Calculate toSubledgerBalance
            if(currentRow.fromSubLedgerDetailID){
              if(groupKey.includes(currentRow.fromSubLedgerDetailID.toString())){
               if (prevRow.debitVal !== null && prevRow.debitVal !== 0) {
                const accountNatureCode= currentRow.fromCoaStructureList.find(x=>x.id==currentRow.fromCOAStructID)?.accountNatureCd;
                if(accountNatureCode==FixedIDs.accountingNature.Expenses || accountNatureCode==FixedIDs.accountingNature.Assets)
                {
                  currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance + +prevRow.debitVal;
                }else if(accountNatureCode==FixedIDs.accountingNature.Income || accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                  currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance - +prevRow.debitVal;
                }
             
               } else if (prevRow.creditVal !== null && prevRow.creditVal !== 0) {
                const accountNatureCode= currentRow.fromCoaStructureList.find(x=>x.id==currentRow.fromCOAStructID)?.accountNatureCd;
                if(accountNatureCode==FixedIDs.accountingNature.Expenses || accountNatureCode==FixedIDs.accountingNature.Assets)
                {
                  currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance - +prevRow.creditVal;
                }
                else if(accountNatureCode==FixedIDs.accountingNature.Income || accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                  currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance + +prevRow.creditVal;
                }
            
               } else {
                 currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance;
               }
              }
            }else{
              currentRow.fromSubLedgerBalance = 0;
            }
          } else {
            
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  

  prepareOrgList(res) {
    try {
      this.rawOrgList = res;
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
        }
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
        }else if (item.value == "Unit") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "unit");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
      });
      this.orgList = orgList || [];
      this.setSingleORG();
    } catch (error) {
      throw error;
    }
  }

  setSingleORG(){
    if(this.rawOrgList.length==1 && this.isBranchModuleActive){
      this.journalVoucherModel.orgID=this.rawOrgList[0].id;
    }
  }
  
  fileManagement(item: VoucherItemModel) {
    try {
      item.voucherItemAttachmentList.forEach((attach) => {
        if (attach.tag == 2) {
          attach.deletedFileName = attach.fileName;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  resetVoucherItemOnOfficeOrProjectChange() {
    try {
      this.journalVoucherModel.voucherItemList.forEach(
        (item: VoucherItemModel) => {
          this.resetSingleVoucherItem(item);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  resetSingleVoucherItem(item: any) {
    try {
      item.toSubLedgerDetailList = [];
      item.fromSubLedgerDetailList = [];
      item.fromCoaStructBalance = 0;
      item.fromSubLedgerDetailID = null;
      item.fromSubLedgerTypeID = null;
      item.toSubledgerBalance = 0;
      item.toAccountBalance = 0;
      item.toSubLedgerDetailID = null;
      item.toSubLedgerTypeID = null;
      item.toSubledgerBalance = 0;
      item.transactionID = null;
      item.chequeNo = null;
      item.chequeDate = null;
      item.clearedOnDate = null;
      item.description = null;
      item.invoiceBillRefNo = null;
      item.voucherItemAttachmentList = [];
      item.creditVal = null;
      item.debitVal = null;
      item.projectID = null;
    } catch (error) {
      throw error;
    }
  }




  /// Voucher List Start 

  setFileViewOption() {
    try {
      this.fileUploadOption = new FileUploadOption();
      this.fileUploadOption.isMultipleUpload = true;
      this.fileUploadOption.folderName = Config.imageFolders.voucher;
      this.fileUploadOption.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  setNewSearchParam(){ 
    try {
      let currentDate = new Date(GlobalConstants.serverDate);
      this.searchParam = {
        voucherTypeCD: FixedIDs.voucherType.JournalVoucher.code,
        companyName:GlobalConstants.userInfo.company, 
        companyID: GlobalConstants.userInfo.companyID, 
        fromDate : currentDate, 
        toDate : currentDate, 
        orgID: null, 
        projectID: null, 
        toCOAStructID:null, 
        toSubLedgerTypeID:null, 
        toSubLedgerDetailID:null, 
        voucherNo:null, 
        fromLedger: null, 
        fromSubLedgerType: null, 
        toLedger: null, 
        toSubLedgerType: null, 
        debitVal:null, 
        creditVal:null, 
        createdBy:null, 
        editedBy:null, 
        draftStatus:null };
    } catch (e) {
      throw e;
    }
  }

  prepareLedgerList(){
    try {
      this.searchParam.orgID = this.searchParam.orgID == "" ? null : this.searchParam.orgID;
      this.searchParam.projectID = this.searchParam.projectID == "" ? null : this.searchParam.projectID;
      if(this.searchParam.orgID == null && this.searchParam.projectID  == null)
      {
        this.ledgerList = this.tempLedgerList.filter(f => f.orgID == null && f.projectID == null);
      }
      else
      {
        if(this.searchParam.orgID != null)
        {
          const orgIDArray = this.searchParam.orgID.split(',').map(id => id.trim());
          this.ledgerList = this.tempLedgerList.filter(item => orgIDArray.includes(String(item.orgID)));
        }

        if(this.searchParam.projectID != null)
        {
          const projectIDArray = this.searchParam.projectID.split(',').map(id => id.trim());
          this.ledgerList = this.tempLedgerList.filter(item => projectIDArray.includes(String(item.projectID)));
        }
      }
    } catch (error) {
      throw error;
    }
   }

  prepareVoucherList(data:any)
  {
    try {
      let id = 0;
      data.forEach(item => {
        item.isShowActionBtn = false;
        if(item.id != id)
        {
          item.isShowActionBtn = true;
          id = item.id;
        }
      });
      return data;
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

  prepareFilterValue(filters:any){
    try {
      this.searchParam.toLedger = filters['toLedger'][0].value;
      this.searchParam.toSubLedgerType = filters['toSubLedgerType'][0].value;
      this.searchParam.toSubLedgerDetail = filters['toSubLedgerDetail'][0].value;
      this.searchParam.debitVal = filters['debitVal'][0].value;
      this.searchParam.creditVal = filters['creditVal'][0].value;
      this.searchParam.draftStatus = filters['draftStatus'][0].value;
      this.searchParam.createdBy = filters['createdBy'][0].value;
      this.searchParam.editedBy = filters['editedBy'][0].value;
    } catch (e) {
      throw e;
    }
  }

  prepareSearchParams(){
    try {
      let searchParams = [];
      if(this.searchParam.orgID) searchParams.push(this.keyValuePair('orgID', this.searchParam.orgID || null));
      if(this.searchParam.projectID) searchParams.push(this.keyValuePair('projectID', this.searchParam.projectID || null));
      if(this.searchParam.toCOAStructID) searchParams.push(this.keyValuePair('toCOAStructID', this.searchParam.toCOAStructID || null));
      if(this.searchParam.toSubLedgerTypeID) searchParams.push(this.keyValuePair('toSubLedgerTypeID', this.searchParam.toSubLedgerTypeID || null));
      if(this.searchParam.toSubLedgerDetailID) searchParams.push(this.keyValuePair('toSubLedgerDetailID', this.searchParam.toSubLedgerDetailID || null));
      if(this.searchParam.voucherNo) searchParams.push(this.keyValuePair('voucherNo', this.searchParam.voucherNo || null));
      if(this.searchParam.toLedger) searchParams.push(this.keyValuePair('toLedger', this.searchParam.toLedger || null));
      if(this.searchParam.toSubLedgerType) searchParams.push(this.keyValuePair('toSubLedgerType', this.searchParam.toSubLedgerType || null));
      if(this.searchParam.toSubLedgerDetail) searchParams.push(this.keyValuePair('toSubLedgerDetail', this.searchParam.toSubLedgerDetail || null));
      if(this.searchParam.debitVal) searchParams.push(this.keyValuePair('debitVal', this.searchParam.debitVal || null));
      if(this.searchParam.creditVal) searchParams.push(this.keyValuePair('creditVal', this.searchParam.creditVal || null));
      if(this.searchParam.createdBy) searchParams.push(this.keyValuePair('createdBy', this.searchParam.createdBy || null));
      if(this.searchParam.editedBy) searchParams.push(this.keyValuePair('editedBy', this.searchParam.editedBy || null));
      if(this.searchParam.draftStatus) searchParams.push(this.keyValuePair('draftStatus', this.searchParam.draftStatus || null));

      return searchParams;
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(entity: any) {
    try {
      let data = this.journalVourcherList.filter(x => x.id == entity.id);

      data.forEach(entity => {
        this.utilitySvc.deleteCollection(this.journalVourcherList, entity);
      }); 

    } catch (e) {
      throw e;
    }
  }

  filterCOAStructure(item,orgID=null,projectID=null){
    try {
      item.toCoaStructureList = this.coaStructureList.filter((x) => {
        // Check if the code exists in transactionNature
        return x.orgID==orgID && x.projectID==projectID;
      });

      if(item.toCoaStructureList.length==1)
        {
          item.toCOAStructID=item.toCoaStructureList[0].id;
          item.toSubLedgerTypeID=item.toCoaStructureList[0]?.subLedgerTypeID;
          if(item.toSubLedgerTypeID)
            this.filterSubLedgerDetail(item);
        }
      item.fromCoaStructureList = this.coaStructureList.filter((x) => {
        // Check if the code exists in transactionNature
        return  x.orgID==orgID && x.projectID==projectID;
      });

      if(item.fromCoaStructureList.length==1)
        {
          item.fromCOAStructID=item.fromCoaStructureList[0].id;
          item.fromSubLedgerTypeID=item.fromCoaStructureList[0]?.subLedgerTypeID;
          if(item.fromSubLedgerTypeID)
            this.filterSubLedgerDetail(item);
        }
    } catch (e) {
      throw e;
    }
  }

  filterSubLedgerDetail(item){
    try {
      if(item.toSubLedgerTypeID)
      {  
        const data=this.subLedgerDetailList.filter((x)=>x.subLedgerTypeID == item.toSubLedgerTypeID);
        item.toSubLedgerDetailList=data;
     
        if(data.length==1){
          setTimeout(()=>{
            item.toSubLedgerDetailID=data[0].id;
          },50)
        }
      }
      else{
        item.toSubLedgerDetailList=[];
      }

      if(item.fromSubLedgerTypeID)
       { 
        const data=this.subLedgerDetailList.filter((x)=>x.subLedgerTypeID == item.fromSubLedgerTypeID);
        item.fromSubLedgerDetailList=data;
       
        if(data.length==1){
          setTimeout(()=>{
            item.fromSubLedgerDetailID=data[0].id;
          },50)
        }    
       }
       else{
        item.fromSubLedgerDetailList=[];
       }
    } catch (error) {
      throw error;
    }
  }

  public getFromCoaStructureByOrgAndProject(item: any) {
    let coaList = this.journalVoucherModel.fromCoaStructureList.filter(x => 
      (!item.orgID || x.orgID === item.orgID) && 
      (!item.projectID || x.projectID === item.projectID)
    );
    return coaList;
  }
  public getToCoaStructureByOrgAndProject(item: any) {
    let coaList = this.journalVoucherModel.toCoaStructureList.filter(x => 
      (!item.orgID || x.orgID === item.orgID) && 
      (!item.projectID || x.projectID === item.projectID)
    );
    return coaList;
  }

  checkFromAccountToAccountOnAddNewItem() {
    try {
     let data= this.journalVoucherModel.voucherItemList.filter(x=>!x.fromCOAStructID || !x.toCOAStructID);
     if(data.length){
      return true;
     }
     return false;
    } catch (error) {
      throw error;
    }
  }

  public hasValidBranchProject() {
    try {
      let isInValid=false;

      if(this.isBranchModuleActive && !this.journalVoucherModel.orgID){
        isInValid=true;
      }

      return isInValid;
    } catch (error) {
      throw error;
      
    }
  }
  
  
  totalSumDebitCredit() {
    try {
      const voucherItemList=this.journalVoucherModel.voucherItemList.filter(x=>x.tag!=2);
      const totalDebit = voucherItemList.reduce((acc, curr) => acc + (+curr.debitVal), 0);
      if(!totalDebit){
        this.totalDebit = 0;
      }else{
        this.totalDebit = totalDebit;
      }

      const totalCredit = voucherItemList.reduce((acc, curr) => acc + (+curr.creditVal), 0);
      if(!totalCredit){
        this.totalCredit = 0;
      }else{
        this.totalCredit = totalCredit;
      }
    } catch (error) {
      throw error;
    }
  }
  
}
