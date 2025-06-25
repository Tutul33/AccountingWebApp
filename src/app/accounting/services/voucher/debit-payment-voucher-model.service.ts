import { Injectable } from "@angular/core";
import { imageFileUploadOption, VoucherItemAttachment, VoucherItemModel } from "../../models/voucher/voucher-item.model";
import { Config, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods, UtilityService } from "src/app/admin";
import { VoucherAttachment, VoucherModel } from "../../models/voucher/voucher.model";
import { UntypedFormGroup } from "@angular/forms";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { VoucherNotificationLogDTO } from "../../models/voucher-notification-log/voucher-notification-log";


@Injectable()
export class DebitPaymentVoucherModelService {
  multiVoucherCashForm: UntypedFormGroup;
  singleVoucherCashForm: UntypedFormGroup;
  multiVoucherBankForm: UntypedFormGroup;
  singleVoucherBankForm: UntypedFormGroup;

  comOrgAcceptNegativeList:any=[];
  debitPaymentVoucherModel: VoucherModel = new VoucherModel();
  tempVoucherModel:any;
  orgList: any[] = [];
  validityVoucherEntryEdit:any;
  isMultiEntry:boolean=false;
  isCash:boolean=true;
  financialYearAll: any[] = [];
  financialYear: any[] = [];
  minDate: Date = null;
  maxDate: Date = null;
  transactionModeList: any = [];
  transactionNoList: any = [];
  commonCoaStructureList: any[] = [];
  coaStructureList: any[] = [];
  fromCoaStructureList: any[] = [];
  toCoaStructureList: any[] = [];
  subLedgerDetailList: any[] = [];
  projectList: any[] = [];
  isEdit:boolean=false;
  isSendSMSautomatically:boolean=false;
  sendSMS:boolean=false;
  isSingleCashEditMode:boolean=false;
  isMultiCashEditMode:boolean=false;
  isSingleBankEditMode:boolean=false;
  isMultiBankEditMode:boolean=false;
  decimalPlace:number=2;
  isMultiCash:boolean=false;
  financialYearMinDate: Date = null;
  financialYearMaxDate: Date = null;
  lockEditTillMinDate: Date = null;
  lockEntryTillMinDate: Date = null;
  totalDebit: number = null;  
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  // Debit Payment Voucher List //  
  fieldTitle: any;
  searchParam: any = {};
  keyValuePair: any;
  gridInvRefNoFilterValue: string = null;
  fileUploadOption: FileUploadOption; 

  debitPaymentVourcherList: any = [];
  companyList: any = [];
  officeBranchUnitList: any = [];
  projectsList: any = [];
  ledgerList: any = [];
  tempLedgerList: any = [];
  subLedgerTypeList: any = [];
  subLedgerList: any = [];
  tempSubLedgerList: any = [];
  voucherNotificationData:any;
  gridLedgerList:any[] = [];
  gridSubLedgerTypeList:any[] = [];
  gridSubledgerDetailList:any[] = [];
  gridDebitList:any[] = [];
  gridCreidList:any[] = [];
  gridCreatedByList:any[] = [];
  gridModifiedByList:any[] = [];
  gridInvBillList: any[] = [];
  gridChequeNoList: any[] = [];
  gridChequeIssueDateList: any[] = [];
  gridChequeClearedOnDateList: any[] = [];
  allSubLedgerDetailList:any[]=[];
  gridDraftStatusLlist:any[] = [];
  lockVoucherEditList: any = [];
  voucherNotificationLogDTO: VoucherNotificationLogDTO;
  chequeLeafNoList: any[] = [];
  tempChequeLeafNoList: any[] = [];




  constructor(private utilitySvc: UtilityService,public coreAccService:CoreAccountingService) {}
  initiate() {
    this.debitPaymentVoucherModel = new VoucherModel();
    this.debitPaymentVoucherModel.tranModeCd = null;
    this.debitPaymentVoucherModel.companyID = GlobalConstants.userInfo.companyID;
    this.debitPaymentVoucherModel.company = GlobalConstants.userInfo.company;
    this.debitPaymentVoucherModel.voucherDate = new Date();    
  }
  
  setVoucherNotificationConfig(data){
    try {
      this.voucherNotificationData=data;
        let config=data.find(x=>x.voucherCode==FixedIDs.voucherType.DebitVoucher.code);
        if(config){
          if(config.sendSMSAuto)
          {
            this.isSendSMSautomatically=true;
            this.sendSMS=true;
          }
          if(config.sendSMSManual)
           {
            this.isSendSMSautomatically=false;
            this.sendSMS=false;
           }
        }
    } catch (error) {
      throw error;
    }
  }

  chaeckFromAccountToAccountOnAddNewItem() {
    try {
     let data= this.debitPaymentVoucherModel.voucherItemList.filter(x=>!x.fromCOAStructID || !x.toCOAStructID);
     if(data.length){
      return true;
     }
     return false;
    } catch (error) {
      throw error;
    }
  }

  chaeckToAccountOnAddNewItem() {
    try {
     let data= this.debitPaymentVoucherModel.voucherItemList.filter(x=>!x.toCOAStructID);
     if(data.length){
      return true;
     }
     return false;
    } catch (error) {
      throw error;
    }
  }

  addNewItem(transactionNatureCd) {
    try {
      let objJournalVoucherItem = new VoucherItemModel();
      
      this.filterCOAStructure(objJournalVoucherItem,this.debitPaymentVoucherModel.orgID,this.debitPaymentVoucherModel.projectID,transactionNatureCd);

      this.debitPaymentVoucherModel.voucherItemList.entityPush(
        objJournalVoucherItem
      );
    } catch (error) {
      throw error;
    }
  }
  
  deleteVoucherItem(item){
    try {
      item.voucherItemList.forEach(element => {
        element.setDeleteTag();
        element.voucherItemAttachmentList.forEach((file)=>{
        file.deletedFileName=file.fileName;
        file.setDeleteTag();
      });
      });
    } catch (error) {
      throw error;
    }
  }

  removeItem(item) {
    try {
      if(item.tag==4){
        this.debitPaymentVoucherModel.voucherItemList.entityPop(item);
     }else{
       item.setDeleteTag();
       item.voucherItemAttachmentList.forEach((file)=>{
       file.deletedFileName=file.fileName;
       file.setDeleteTag();
     });
     }
    
      if(this.multiVoucherBankForm)
      this.multiVoucherBankForm.markAsDirty();

      if(this.multiVoucherCashForm)
      this.multiVoucherCashForm.markAsDirty();
    } catch (error) {
      throw error;
    }
  }

  setEntryType(isMultiEntry,isCash){
    try {
      this.isCash=isCash;
      this.isMultiEntry=isMultiEntry;
    } catch (error) {
      throw error;
    }
  }

  resetFormMultipleCash() {
    try {
      this.initiate(); 
      if(this.multiVoucherCashForm){
        this.multiVoucherCashForm.markAsPristine();
      }         
    } catch (error) {
      throw error;
    }
  }

  resetFormSingleCash() {
    try {
      this.initiate();
      if(this.singleVoucherCashForm){
        this.singleVoucherCashForm.updateValueAndValidity();
        this.singleVoucherCashForm.markAllAsTouched();   
        this.singleVoucherCashForm.markAsPristine();   
      }      
    } catch (error) {
      throw error;
    }
  }

  resetFormSingleBank() {
    try {
      this.initiate();     
      if(this.singleVoucherBankForm) 
      this.singleVoucherBankForm.markAsPristine();
    } catch (error) {
      throw error;
    }
  }

  resetFormMultipleBank() {
    try {
      this.initiate();
      this.multiVoucherBankForm.reset();
      if(this.multiVoucherBankForm) 
      this.multiVoucherBankForm.markAsPristine();
    } catch (error) {
      throw error;
    }
  }

  //Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
  checkValidityOfToAccountSubLedger() {
    try {
      const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.debitPaymentVoucherModel.toSubLedgerTypeID);
      if (
        this.debitPaymentVoucherModel.toCOAStructID > 0 &&
        !this.debitPaymentVoucherModel.toSubLedgerDetailID &&
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
      const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.debitPaymentVoucherModel.toSubLedgerTypeID);
      if (
        this.debitPaymentVoucherModel.toCOAStructID ==
          this.debitPaymentVoucherModel.fromCOAStructID &&
        !toSubLedgerDetailList.length
      ) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  resetVoucherItemOnOfficeOrProjectChange(){
    try {
      this.debitPaymentVoucherModel.voucherItemList.forEach((item:VoucherItemModel) => {
        this.resetSingleVoucherItem(item);
      });
    } catch (error) {
      throw error;
    }
  }

  resetSingleVoucherItem(item:any){
    try {
        item.toSubLedgerDetailList=[];
        item.fromSubLedgerDetailList=[];
        item.fromCoaStructBalance=0;
        item.fromSubLedgerDetailID=null;
        item.fromSubLedgerTypeID=null;
        item.toSubledgerBalance=0;
        item.toAccountBalance=0;
        item.toSubLedgerDetailID=null;
        item.toSubLedgerTypeID=null;
        item.toSubledgerBalance=0;
        item.tranModeCd=null;
        item.chequeLeafID=null;
        item.chequeNo=null;
        item.chequeDate=null;
        item.clearedOnDate=null;
        item.description=null;
        item.invoiceBillRefNo=null;
        item.voucherItemAttachmentList=[];
        item.creditVal=null;
        item.debitVal=null;
    } catch (error) {
      throw error;
    }
  }

  public getFromCoaStructureByOrgAndProject(item: any) {
    try {
      let coaList = this.debitPaymentVoucherModel.fromCoaStructureList.filter(x => 
        (!item.orgID || x.orgID === item.orgID) && 
        (!item.projectID || x.projectID === item.projectID)
      );
      return coaList;
    } catch (error) {
      throw error;
    }
  }

  public getToCoaStructureByOrgAndProject(item: any) {
    try {
      let coaList = this.debitPaymentVoucherModel.toCoaStructureList.filter(x => 
        (!item.orgID || x.orgID === item.orgID) && 
        (!item.projectID || x.projectID === item.projectID)
      );
      return coaList;
    } catch (error) {
      throw error;      
    }
  }
 
  prepareDataForEdit(data:any){
      try {
        const model=data;

        if(model)
        this.setEntryType(model.isMultiEntry,model.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code?true:false);
       
        if(model.isMultiEntry){                  
            this.debitPaymentVoucherModel=new VoucherModel(model);          
            this.debitPaymentVoucherModel.id=model.id;
            this.debitPaymentVoucherModel.voucherDate=new Date(model.voucherDate)
            this.debitPaymentVoucherModel.company=model.company;
            this.debitPaymentVoucherModel.dateID=model.dateID;
            this.debitPaymentVoucherModel.voucherTypeCd=model.voucherTypeCd;
            this.debitPaymentVoucherModel.companyID=model.companyID;
            this.debitPaymentVoucherModel.orgID=model.orgID;
            this.debitPaymentVoucherModel.voucherNo=model.voucherNo;
            this.debitPaymentVoucherModel.remarks=model.remarks;
            this.debitPaymentVoucherModel.createdByID=model.createdByID;
            this.debitPaymentVoucherModel.approvedByID=model.approvedByID;
            this.debitPaymentVoucherModel.approvalStatus=model.approvalStatus;          
            this.debitPaymentVoucherModel.isMultiEntry=model.isMultiEntry;
            this.debitPaymentVoucherModel.voucherTitleCd=model.voucherTitleCd;
            this.debitPaymentVoucherModel.isDraft=model.isDraft;
            this.debitPaymentVoucherModel.isActive=model.isActive;
            this.debitPaymentVoucherModel.insertDateTime=new Date(model.insertDateTime);
            this.debitPaymentVoucherModel.insertUserID=model.createdByID;
            
            this.debitPaymentVoucherModel.voucherItemList.forEach((item: any) => {
              item.id=item.voucherItemID;
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
             
              if(item.chequeDate)     
                item.chequeDate=new Date(item.chequeDate);  
              if(item.clearedOnDate)      
                  item.clearedOnDate=new Date(item.clearedOnDate);  

              if(model.isMultiEntry && model.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code)  
                this.debitPaymentVoucherModel.fromCOAStructID = item.fromCOAStructID;
                
              if(model.isMultiEntry && model.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherBank.code) 
                item.fromCOAStructID = item.fromCOAStructID;
                
              item.toCOAStructID = item.toCOAStructID;
              item.toSubLedgerDetailID = item.toSubLedgerDetailID;

              
              if(item.chequeLeafID)
              {
                let data = {
                  id: item.chequeLeafID, 
                  name: item.chequeLeafNo, 
                  companyID: this.debitPaymentVoucherModel.companyID,
                  orgID: this.debitPaymentVoucherModel.orgID,
                  projectID: this.debitPaymentVoucherModel.projectID,
                  cOAStructureID: item.fromCOAStructID
                }
                this.chequeLeafNoList.push(data);
                //this.tempChequeLeafNoList = this.chequeLeafNoList;
                //this.utilitySvc.deletedDataPushInDdl(item.chequeLeafID, item.chequeLeafNo, 'id', 'name', this.chequeLeafNoList);
              }
            });
        }else{
            this.debitPaymentVoucherModel = new VoucherModel(model);
            this.debitPaymentVoucherModel.voucherDate = new Date(model.voucherDate);
    
            this.debitPaymentVoucherModel.dateID = model.dateID;
            this.debitPaymentVoucherModel.orgID = model.orgID;
            this.debitPaymentVoucherModel.insertDateTime=new Date(model.insertDateTime);
            this.debitPaymentVoucherModel.id = model.id;
            this.debitPaymentVoucherModel.insertUserID=model.createdByID;
            this.debitPaymentVoucherModel.approvedByID = this.debitPaymentVoucherModel.approvedByID || null;
            this.debitPaymentVoucherModel.editUserID = this.debitPaymentVoucherModel.editUserID || null;
            this.debitPaymentVoucherModel.voucherTitleCd = this.debitPaymentVoucherModel.voucherTitleCd || null;
            this.debitPaymentVoucherModel.voucherItemList.forEach((item) => {
              this.debitPaymentVoucherModel.fromCOAStructID = item.fromCOAStructID;
              this.debitPaymentVoucherModel.fromSubLedgerTypeID = item.fromSubLedgerTypeID;
              this.debitPaymentVoucherModel.toCOAStructID = item.toCOAStructID;
              this.debitPaymentVoucherModel.toSubLedgerTypeID = item.toSubLedgerTypeID;
              this.debitPaymentVoucherModel.description = item.description;
              item.id=item.voucherItemID;
              this.debitPaymentVoucherModel.voucherItemID = item.voucherItemID;
              this.debitPaymentVoucherModel.debitVal = item.debitVal;
              this.debitPaymentVoucherModel.creditVal = item.creditVal;
              this.debitPaymentVoucherModel.invoiceBillRefNo = item.invoiceBillRefNo;
              this.debitPaymentVoucherModel.tranModeCd = item.tranModeCd;
              this.debitPaymentVoucherModel.chequeNo = item.chequeNo;
              this.debitPaymentVoucherModel.chequeLeafID = item.chequeLeafID;
              
              if(item.chequeDate)     
                this.debitPaymentVoucherModel.chequeDate=new Date(item.chequeDate);  
              if(item.clearedOnDate)      
                this.debitPaymentVoucherModel.clearedOnDate=new Date(item.clearedOnDate);    
          
              this.debitPaymentVoucherModel.fromSubLedgerDetailID = item.fromSubLedgerDetailID;
                this.debitPaymentVoucherModel.toSubLedgerDetailID = item.toSubLedgerDetailID;
       
    
              const itemFiles = item.voucherItemAttachmentList.filter(
                (x) => x.fileName
              );
    
              itemFiles.forEach((element) => {
                const fileAttach = new VoucherAttachment();
                fileAttach.fileName = element.fileName;
                fileAttach.folderName = "voucher";
                fileAttach.id = element.voucherItemAttachmentID;
                fileAttach.voucherItemID = element.voucherItemID;
                this.debitPaymentVoucherModel.voucherAttachmentList.push(fileAttach);
              });
            });
            
        }
      } catch (error) {
        throw error;
      }
    }
  
    updateVoucherItem(voucherItem){
      try {              
             voucherItem.toSubLedgerDetailList=this.allSubLedgerDetailList.filter(x=>x.subLedgerTypeID==voucherItem.toSubLedgerTypeID);
             voucherItem.fromSubLedgerDetailList=this.allSubLedgerDetailList.filter(x=>x.subLedgerTypeID==voucherItem.fromSubLedgerTypeID);
             let transactionNoList=this.transactionNoList.filter(x=>x.transactionModeID==voucherItem.tranModeCd);
              if(transactionNoList.length){
                voucherItem.transactionNoList=transactionNoList;
                 if(voucherItem.chequeNo || voucherItem.chequeLeafID){
                  setTimeout(() => {
                    voucherItem.chequeLeafID=voucherItem.chequeLeafID;
                    voucherItem.chequeNo=voucherItem.chequeNo;
                    voucherItem.chequeDate=new Date(voucherItem.chequeDate);
                    voucherItem.clearedOnDate=new Date(voucherItem.clearedOnDate);
                  }, 0);                  
                 } 
              }

              setTimeout(() => {
                voucherItem.fromCOAStructID=voucherItem.fromCOAStructID;
                voucherItem.fromSubLedgerDetailID=voucherItem.fromSubLedgerDetailID;
                voucherItem.toCOAStructID=voucherItem.toCOAStructID;
                voucherItem.toSubLedgerDetailID=voucherItem.toSubLedgerDetailID;              
              }, 5);

      } catch (error) {
        throw error;
      }
    }

  prepareDataForSingleEntry() {
    try {
      if(!this.debitPaymentVoucherModel.id){
      let objVoucherItem = new VoucherItemModel(
        this.debitPaymentVoucherModel
      );
      objVoucherItem.imageFileUploadOpton=this.debitPaymentVoucherModel.imageFileUploadOpton;
      this.debitPaymentVoucherModel.voucherAttachmentList.forEach((attach)=>{
        const objAttach=new VoucherItemAttachment(attach);
        objVoucherItem.voucherItemAttachmentList.push(objAttach);
      })
      
      this.debitPaymentVoucherModel.insertDateTime=new Date();
      this.debitPaymentVoucherModel.voucherItemList = [];     
      objVoucherItem.description=this.debitPaymentVoucherModel.description;
      objVoucherItem.fromSubLedgerDetailID=null;
      objVoucherItem.fromSubLedgerTypeID=null;
      objVoucherItem.tranModeCd=this.debitPaymentVoucherModel.tranModeCd;
      objVoucherItem.transactionID=0;
      objVoucherItem.toAccountBalance=this.debitPaymentVoucherModel.toAccountBalance||0;
      objVoucherItem.fromCoaStructBalance=this.debitPaymentVoucherModel.fromCoaStructBalance||0;
      objVoucherItem.toSubledgerBalance=this.debitPaymentVoucherModel.toSubledgerBalance||0;
    
      this.debitPaymentVoucherModel.voucherItemList.entityPush(
        objVoucherItem
      );
      this.debitPaymentVoucherModel.voucherTypeCd=FixedIDs.voucherType.DebitVoucher.code;
      this.debitPaymentVoucherModel.createdByID=GlobalConstants.userInfo.userPKID;
      this.debitPaymentVoucherModel.approvalStatus=FixedIDs.approvalStatus.Pending;      
      this.debitPaymentVoucherModel.dateID = 0;
      this.debitPaymentVoucherModel.isMultiEntry=false;
      this.debitPaymentVoucherModel.isDraft=this.debitPaymentVoucherModel.isDraft||false;
       if(this.isCash){
        this.debitPaymentVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.debitVoucherCash.code;
      }else{
        this.debitPaymentVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.debitVoucherBank.code;
      }
      this.debitPaymentVoucherModel.insertUserID=GlobalConstants.userInfo.userPKID;
      this.setCodeGenProperty();
    }else{
      let objVoucherItem = new VoucherItemModel(
        this.debitPaymentVoucherModel
      ); 
      this.debitPaymentVoucherModel.voucherAttachmentList.forEach((attach)=>{
        const objAttach=new VoucherItemAttachment(attach);
       if(objAttach.tag==2){
        objAttach.deletedFileName=attach.fileName;
       }
       objAttach.voucherItemID=this.debitPaymentVoucherModel.voucherItemID;
       objVoucherItem.voucherItemAttachmentList.push(objAttach);
      })
      this.debitPaymentVoucherModel.isDraft=this.debitPaymentVoucherModel.isDraft||false;
      
      this.debitPaymentVoucherModel.voucherItemList = [];
      objVoucherItem.id=this.debitPaymentVoucherModel.voucherItemID;
      objVoucherItem.voucherID=this.debitPaymentVoucherModel.id;
      objVoucherItem.description=this.debitPaymentVoucherModel.description;
      
      objVoucherItem.setModifyTag();
      this.debitPaymentVoucherModel.voucherItemList.push(
        objVoucherItem
      );
      this.debitPaymentVoucherModel.editUserID=GlobalConstants.userInfo.userPKID;
    }
    } catch (error) {
      throw error;
    }
  } 
  setTempVoucher(model){
    try {
      this.tempVoucherModel=new VoucherModel(model);
    } catch (error) {
      throw error;
    }
  }
  setCodeGenProperty() {
    try {
      const condeGenPropertyVal = GlobalMethods.codeGenProperty();
      condeGenPropertyVal.voucherTypeShortName=FixedIDs.voucherType.DebitVoucher.shortName;
      this.debitPaymentVoucherModel.codeGenPropertyVal = JSON.stringify(condeGenPropertyVal).toString();
    } catch (error) {
      throw error;
    }
  }

  prepareDataForMultiEntryCash() {
    try {
      this.debitPaymentVoucherModel.voucherItemList.forEach((item)=>{
        item.fromCOAStructID=this.debitPaymentVoucherModel.fromCOAStructID;
        item.fromCoaStructBalance=this.debitPaymentVoucherModel.fromCoaStructBalance;
        item.fromSubLedgerDetailID=null;
        item.fromSubLedgerTypeID=null;
        item.transactionID=0;
      });
      if(!this.debitPaymentVoucherModel.id){      
      this.debitPaymentVoucherModel.voucherTypeCd = FixedIDs.voucherType.DebitVoucher.code;
      this.debitPaymentVoucherModel.createdByID = GlobalConstants.userInfo.userPKID;
      this.debitPaymentVoucherModel.approvalStatus = FixedIDs.approvalStatus.Pending;
      this.debitPaymentVoucherModel.dateID = 0;
      this.debitPaymentVoucherModel.isMultiEntry=true;
      this.debitPaymentVoucherModel.insertUserID=GlobalConstants.userInfo.userPKID;
      this.debitPaymentVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.debitVoucherCash.code;
      this.debitPaymentVoucherModel.isDraft=this.debitPaymentVoucherModel.isDraft||false;
      this.setCodeGenProperty();
    }else{
      this.debitPaymentVoucherModel.editUserID=GlobalConstants.userInfo.userPKID;
    }
    } catch (error) {
      throw error;
    }
  }

  checkDuplicate() {
    try {
      let duplicate = false;
      if(this.debitPaymentVoucherModel.voucherItemList.length > 1)
      {
        this.debitPaymentVoucherModel.voucherItemList.forEach((item)=>{
          if(item.chequeLeafID != null)
          {
            let isDuplicateChequeLeaf = this.debitPaymentVoucherModel.voucherItemList.find(x => x.id != item.id && x.chequeLeafID == item.chequeLeafID);
        
            if (isDuplicateChequeLeaf) 
            {
              
              duplicate = true;
            }
          }
        });
      }

      if(duplicate)
        return true;
      else
        return false;
    }
    catch (e) {
      throw e;
    }
  }

  prepareDataForMultiEntryBank() {
    try {
      this.debitPaymentVoucherModel.voucherItemList.forEach((item)=>{
        item.fromSubLedgerDetailID=null;
        item.fromSubLedgerTypeID=null;
        item.transactionID=0;
      });
      if(!this.debitPaymentVoucherModel.id){     
      this.debitPaymentVoucherModel.voucherTypeCd = FixedIDs.voucherType.DebitVoucher.code;
      this.debitPaymentVoucherModel.createdByID = GlobalConstants.userInfo.userPKID;
      this.debitPaymentVoucherModel.approvalStatus = FixedIDs.approvalStatus.Pending;
      this.debitPaymentVoucherModel.dateID = 0;
      this.debitPaymentVoucherModel.isMultiEntry=true;
      this.debitPaymentVoucherModel.insertUserID=GlobalConstants.userInfo.userPKID;
      this.debitPaymentVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.debitVoucherBank.code;
      this.debitPaymentVoucherModel.isDraft=this.debitPaymentVoucherModel.isDraft||false;
      this.setCodeGenProperty();
      }else{
        this.debitPaymentVoucherModel.editUserID=GlobalConstants.userInfo.userPKID;
      }
    } catch (error) {
      throw error;
    }
  }
  
  prepareDataAfterSave(data){
    try {
        if(data.isMultiEntry){
          this.prepareDataModelMultiEntry(data);
          this.processBalances();
        }else{
          this.prepareDataModelSingleEntry(data);
        }

        if(this.isEdit)
        {
          this.tempVoucherModel = JSON.stringify(GlobalMethods.deepClone(this.debitPaymentVoucherModel));
        }else{
          this.tempVoucherModel = null;
        }
    } catch (error) {
      throw error;
    }
  }
  
  prepareDataModelMultiEntry(data){
    try {
          this.debitPaymentVoucherModel=new VoucherModel(data);          
          this.debitPaymentVoucherModel.id=data.id;
          this.debitPaymentVoucherModel.voucherDate=new Date(data.voucherDate)
          this.debitPaymentVoucherModel.company=data.company;
          this.debitPaymentVoucherModel.dateID=data.dateID;
          this.debitPaymentVoucherModel.voucherTypeCd=data.voucherTypeCd;
          this.debitPaymentVoucherModel.companyID=data.companyID;
          this.debitPaymentVoucherModel.orgID=data.orgID;
          this.debitPaymentVoucherModel.voucherNo=data.voucherNo;
          this.debitPaymentVoucherModel.remarks=data.remarks;
          this.debitPaymentVoucherModel.createdByID=data.createdByID;
          this.debitPaymentVoucherModel.approvedByID=data.approvedByID;
          this.debitPaymentVoucherModel.approvalStatus=data.approvalStatus;          
          this.debitPaymentVoucherModel.isMultiEntry=data.isMultiEntry;
          this.debitPaymentVoucherModel.voucherTitleCd=data.voucherTitleCd;
          this.debitPaymentVoucherModel.isDraft=data.isDraft;
          this.debitPaymentVoucherModel.isActive=data.isActive;

          if(this.debitPaymentVoucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code)
             this.filterCOAStructure(this.debitPaymentVoucherModel,this.debitPaymentVoucherModel.orgID,this.debitPaymentVoucherModel.projectID,FixedIDs.receiptCd.cash.code);
             
          this.debitPaymentVoucherModel.voucherItemList.forEach((item:VoucherItemModel)=>{
              item.voucherItemID=item.id;
              item.imageFileUploadOpton=imageFileUploadOption();
              
              if(this.debitPaymentVoucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code)
                  {
                    this.debitPaymentVoucherModel.fromCOAStructID=item.fromCOAStructID;
                    this.debitPaymentVoucherModel.fromCoaStructBalance=item.fromCoaStructBalance;
                  }

              if(item.chequeDate){
                item.chequeDate=new Date(item.chequeDate);
              }

              if(item.clearedOnDate){
                item.clearedOnDate=new Date(item.clearedOnDate);
              }

              this.prepareChequeLeafNo(item);

              this.filterCOAStructure(item,this.debitPaymentVoucherModel.orgID,this.debitPaymentVoucherModel.projectID,this.debitPaymentVoucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code?FixedIDs.receiptCd.cash.code:FixedIDs.receiptCd.bank.code);
              this.filterSubLedgerDetail(item);
          });
          
    } catch (error) {
      throw error;
    }
  }

  prepareDataModelSingleEntry(data){
    try {
          this.debitPaymentVoucherModel=new VoucherModel(data);          
          this.debitPaymentVoucherModel.id=data.id;
          this.debitPaymentVoucherModel.voucherDate=new Date(data.voucherDate)
          this.debitPaymentVoucherModel.company=data.company;
          this.debitPaymentVoucherModel.dateID=data.dateID;
          this.debitPaymentVoucherModel.voucherTypeCd=data.voucherTypeCd;
          this.debitPaymentVoucherModel.companyID=data.companyID;
          this.debitPaymentVoucherModel.orgID=data.orgID;
          this.debitPaymentVoucherModel.voucherNo=data.voucherNo;
          this.debitPaymentVoucherModel.remarks=data.remarks;
          this.debitPaymentVoucherModel.createdByID=data.createdByID;
          this.debitPaymentVoucherModel.approvedByID=data.approvedByID;
          this.debitPaymentVoucherModel.approvalStatus=data.approvalStatus;          
          this.debitPaymentVoucherModel.isMultiEntry=data.isMultiEntry;
          this.debitPaymentVoucherModel.voucherTitleCd=data.voucherTitleCd;
          this.debitPaymentVoucherModel.isDraft=data.isDraft;
          this.debitPaymentVoucherModel.isActive=data.isActive;
          this.debitPaymentVoucherModel.locationID=data.locationID;
          this.debitPaymentVoucherModel.insertUserID=data.insertUserID;
          data.voucherItemList.forEach((item:any)=>{
              this.debitPaymentVoucherModel.voucherItemID=item.id;
              item.voucherItemID = item.id;
              this.debitPaymentVoucherModel.fromCOAStructID=item.fromCOAStructID;
              this.debitPaymentVoucherModel.fromCoaStructBalance=item.fromCoaStructBalance;
              this.debitPaymentVoucherModel.fromSubLedgerDetailID=item.fromSubLedgerDetailID;
              this.debitPaymentVoucherModel.fromSubLedgerBalance=item.fromSubLedgerBalance;
              this.debitPaymentVoucherModel.fromSubLedgerTypeID=item.fromSubLedgerTypeID;
              this.debitPaymentVoucherModel.toCOAStructID=item.toCOAStructID;
              this.debitPaymentVoucherModel.toAccountBalance=item.toAccountBalance;
              this.debitPaymentVoucherModel.toSubLedgerDetailID=item.toSubLedgerDetailID;
              this.debitPaymentVoucherModel.toSubledgerBalance=item.toSubledgerBalance;
              this.debitPaymentVoucherModel.toSubLedgerTypeID=item.toSubLedgerTypeID;
              this.debitPaymentVoucherModel.debitVal=item.debitVal;
              this.debitPaymentVoucherModel.creditVal=item.creditVal;
              this.debitPaymentVoucherModel.voucherAttachmentList=item.voucherItemAttachmentList;
           
              this.debitPaymentVoucherModel.description=item.description;
              this.debitPaymentVoucherModel.invoiceBillRefNo=item.invoiceBillRefNo;

              this.debitPaymentVoucherModel.tranModeCd=item.tranModeCd;
              this.debitPaymentVoucherModel.chequeNo=item.chequeNo;
              this.debitPaymentVoucherModel.chequeLeafID=item.chequeLeafID;

              if(item.chequeDate){
                this.debitPaymentVoucherModel.chequeDate=new Date(item.chequeDate);
              }

              if(item.clearedOnDate){
                this.debitPaymentVoucherModel.clearedOnDate=new Date(item.clearedOnDate);
              }

              this.filterCOAStructure(this.debitPaymentVoucherModel,this.debitPaymentVoucherModel.orgID,this.debitPaymentVoucherModel.projectID,this.debitPaymentVoucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code?FixedIDs.receiptCd.cash.code:FixedIDs.receiptCd.bank.code);
              this.filterSubLedgerDetail(this.debitPaymentVoucherModel);
          });
          
    } catch (error) {
      throw error;
    }
  }

  onDebitFieldChange(entity) {
    try {
      if (entity.debitVal > 0) entity.creditVal = 0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  onCreditFieldChange(entity) {
    try {
      if (entity.creditVal > 0) entity.debitVal = 0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  checkSubLedgerFromAccount(entity: any) {
    try {
      if (entity.fromSubLedgerDetailID == entity.toSubLedgerDetailID) {
        entity.fromSubLedgerDetailID = null;
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerFromAccount(entity: any) {
    try {
      let fromSubLedger = this.subLedgerDetailList.find(
        (x) => x.id == entity.fromSubLedgerDetailID
      );
      if (fromSubLedger) entity.toSubledgerBalance = fromSubLedger.balance;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerFromAccountMulti(entity: any) {
    try {
      let fromSubLedger = this.subLedgerDetailList.find(
        (x) => x.id == entity.fromSubLedgerDetailID
      );
      if (fromSubLedger) entity.toSubledgerBalance = fromSubLedger.balance;

      this.processBalances();
    } catch (error) {
      throw error;
    }
  }
  setSubLedgerToAccountMulti(entity: any,balance:number) {
    try {      
      entity.toSubledgerBalance=balance||0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  checkSubLedgerToAccount(entity: any) {
    try {
      if (entity.fromSubLedgerDetailID == entity.toSubLedgerDetailID) {
        entity.toSubLedgerDetailID = null;
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerToAccount(entity: any,balance) {
    try {
      entity.toSubLedgerTypeID=this.subLedgerDetailList.find(x=>x.id==entity.toSubLedgerDetailID)?.subLedgerTypeID;
      entity.toSubledgerBalance=balance||0;
    } catch (error) {
      throw error;
    }
  }

  checkValidityForDuplicateMultiEntryCash() {
    try {
      const candidateData = this.debitPaymentVoucherModel.voucherItemList.filter(
        (x) =>
          x.toCOAStructID &&
          x.toSubLedgerDetailID?x.toSubLedgerDetailID:true
      );
      // Extract only the relevant properties
      const filteredData = candidateData.map(
        ({
          toCOAStructID,
          toSubLedgerDetailID
        }) => ({
          toCOAStructID,
          toSubLedgerDetailID
        })
      );

      // Count occurrences of each filtered row
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

  checkValidityForDuplicateMultiEntryBank() {
    try {
      const candidateData = this.debitPaymentVoucherModel.voucherItemList.filter(
        (x) =>
         x.fromCOAStructID &&
          x.toCOAStructID? x.toCOAStructID:true &&
          x.toSubLedgerDetailID? x.toSubLedgerDetailID:true
      );
      // Extract only the relevant properties
      const filteredData = candidateData.map(
        ({
          fromCOAStructID,
          toCOAStructID,
          toSubLedgerDetailID
        }) => ({
          fromCOAStructID,
          toCOAStructID,
          toSubLedgerDetailID
        })
      );

      // Count occurrences of each filtered row
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

  onSelectFromAccount(item,balance) {
    try {
      this.setFromAccountBalance(item,balance);
    } catch (error) {
      throw error;
    }
  }

  setFromAccountBalance(item,balance) {
    try {
       item.fromCoaStructBalance = balance||0;
    } catch (error) {
      throw error;
    }
  }

  onSelectToAccount(item,balance) {
    try {      
      this.setToAccountBalance(item,balance);
    } catch (error) {
      throw error;
    }
  }

  setToAccountBalance(item,balance) {
    try {
      item.toAccountBalance = balance||0;
    } catch (error) {
      throw error;
    }
  }

  onSelectFromAccountMulti(item: VoucherItemModel,balance:number) {
    try {      
      item.fromCoaStructBalance=balance||0;
    } catch (error) {
      throw error;
    }
  }

  onSelectToAccountMulti(item: VoucherItemModel,balance) {
    try {
      item.toAccountBalance=balance||0;
      this.processBalances();
    } catch (error) {
      throw error;
    }
  }

  checkValidityOfFromAccountSubLedgerAndToAccountSubLedgerMulti(item) {
    try {
      const fromSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==item.fromSubLedgerTypeID);
      const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==item.toSubLedgerTypeID);

      if (
        item.fromCOAStructID > 0 &&
        !item.fromSubLedgerDetailID &&
        fromSubLedgerDetailList.length &&
        item.toCOAStructID > 0 &&
        !item.toSubLedgerDetailID &&
        toSubLedgerDetailList.length
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
      const fromSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==item.fromSubLedgerTypeID);

      if (
        item.fromCOAStructID > 0 &&
        !item.fromSubLedgerDetailID &&
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
       const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.debitPaymentVoucherModel.toSubLedgerTypeID);
       if (
        this.debitPaymentVoucherModel.toCOAStructID > 0 &&
        !this.debitPaymentVoucherModel.toSubLedgerDetailID &&
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
      const fromSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.debitPaymentVoucherModel.fromSubLedgerTypeID);
      const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.debitPaymentVoucherModel.toSubLedgerTypeID);

      if (
        this.debitPaymentVoucherModel.toCOAStructID ==
          this.debitPaymentVoucherModel.fromCOAStructID &&
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
      const items = this.debitPaymentVoucherModel.voucherItemList;

      while (!isInvalid && index < items.length) {
        const item = items[index];
        const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==item.toSubLedgerTypeID);

        //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected And Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
        if (
          item.fromCOAStructID > 0 &&
          item.toCOAStructID > 0 &&
          !item.toSubLedgerDetailID &&
          toSubLedgerDetailList.length
        ) {
          isInvalid = true;
          isInvalidCaseOne = true;
        } 
        //Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
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
  checkDataValidityForMultiEntryBank() {
    try {
      let isInvalid = false;
      let isInvalidCaseOne = false;
      let isInvalidCaseThree = false;
      let isInvalidCaseFour = false;
      let index = 0;
      const items = this.debitPaymentVoucherModel.voucherItemList;

      while (!isInvalid && index < items.length) {
        const item = items[index];
        const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==item.toSubLedgerDetailID);
        //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected And Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
        if (
          item.fromCOAStructID > 0 &&
          item.toCOAStructID > 0 &&
          !item.toSubLedgerDetailID &&
          toSubLedgerDetailList.length
        ) {
          isInvalid = true;
          isInvalidCaseOne = true;
        }         
        //Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
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
        isInvalidCaseThree,
        isInvalidCaseFour,
      };
    } catch (error) {
      throw error;
    }
  }
  
  setTransactionNoList(entity:VoucherModel){
    try {
      entity.transactionNoList=this.transactionNoList.filter(x=>x.transactionModeID==entity.transactionID);
    } catch (error) {
      throw error;
    }
  }

  setTransactionInfo(entity:any){
    try {
      const transaction=this.transactionNoList.find(x=>x.tranModeCd==entity.tranModeCd);
      if(transaction){
        entity.chequeDate= new Date(transaction.chequeDate);
        entity.clearedOnDate= new Date(transaction.clearedOnDate);
      }
    } catch (error) {
      throw error;
    }
  }

  processBalances() {
    try {
      // Group data by fromCOAStructID, fromSubLedgerDetailID, and projectID
      const groupedData = {};
      //Prepare candidate data in group wise manner
      for (const row of this.debitPaymentVoucherModel.voucherItemList) {
        let groupKey = "";
        if(this.isMultiCash){
           if (row.toCOAStructID) {
            //Third Group condition
            groupKey = `${row.toCOAStructID}`;
            if (!groupedData[groupKey]) {
              groupedData[groupKey] = [];
            }
            groupedData[groupKey].push(row);
          }
        }else{
          if (row.toCOAStructID && row.toSubLedgerDetailID) {
            //First Group condition
            groupKey = `${row.toCOAStructID}-${row.toSubLedgerDetailID}`;
            if (!groupedData[groupKey]) {
              groupedData[groupKey] = [];
            }
            groupedData[groupKey].push(row);

            groupKey = `${row.toCOAStructID}`;
            
            if (!groupedData[groupKey]) {
              groupedData[groupKey] = [];
            }
            groupedData[groupKey].push(row);
          } else 
          if (row.toCOAStructID) {
            //Third Group condition
            groupKey = `${row.toCOAStructID}`;

            if (!groupedData[groupKey]) {
              groupedData[groupKey] = [];
            }
            groupedData[groupKey].push(row);
          }
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
              const accountNatureCode= currentRow.toCoaStructureList.find(x=>x.id==currentRow.toCOAStructID)?.accountNatureCd;
              if(accountNatureCode==FixedIDs.accountingNature.Expenses || accountNatureCode==FixedIDs.accountingNature.Assets)
              {
                currentRow.toAccountBalance = prevRow.toAccountBalance + +prevRow.debitVal;
              }else if(accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                currentRow.toAccountBalance = prevRow.toAccountBalance - +prevRow.debitVal;
              }
            } 
            else {
              currentRow.toAccountBalance = prevRow.toAccountBalance;
            }

             if(!this.isMultiCash){
              if(currentRow.toSubLedgerDetailID){
                if(groupKey.includes(currentRow.toSubLedgerDetailID.toString())){
                //Calculate toSubledgerBalance
                if (prevRow.debitVal !== 0 && prevRow.debitVal !== null) {
                    const accountNatureCode= currentRow.toCoaStructureList.find(x=>x.id==currentRow.toCOAStructID)?.accountNatureCd;
                  if(accountNatureCode==FixedIDs.accountingNature.Expenses || accountNatureCode==FixedIDs.accountingNature.Assets)
                  {
                    currentRow.toSubledgerBalance = prevRow.toSubledgerBalance + +prevRow.debitVal;
                  }else if(accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                    currentRow.toSubledgerBalance = prevRow.toSubledgerBalance - +prevRow.debitVal;
                  }
                } 
                else 
                {
                  currentRow.toSubledgerBalance = prevRow.toSubledgerBalance;
                }
                }
              }else{
                currentRow.toSubledgerBalance =0;
              }
             }
          } 
        }
      }
    } catch (error) {
      throw error;
    }
  }

  checkVoucherValidityEntryEdit(){
    try {      
        // Parse dates
        const lockEntryTillDate = new Date(this.validityVoucherEntryEdit.lockEntryTillDate);
        const lockEditTillDate = new Date(this.validityVoucherEntryEdit.lockEditTillDate);
        const checkDate = new Date(this.debitPaymentVoucherModel.voucherDate);      
        
        return {
          isEntryable: checkDate <= lockEntryTillDate ,
          isEditable: checkDate <= lockEditTillDate
        };
      
    } catch (error) {
      throw error;
    }
  }

  prepareOrgList(res){
      try {
        this.rawOrgList=res;
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
  rawOrgList:any=[];
  setSingleORG(){
    if(this.rawOrgList.length==1 && this.isBranchModuleActive){
      this.debitPaymentVoucherModel.orgID=this.rawOrgList[0].id;
    }
  }
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
      if (this.debitPaymentVoucherModel.id) {
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

  checkEntryEditValidity() {
    try {
      let isInvalid = false;
      let message = "";
  
      const { financialYearMinDate, financialYearMaxDate, debitPaymentVoucherModel, validityVoucherEntryEdit} = this;
      const { voucherDate, orgID, projectID, id } = debitPaymentVoucherModel;
  
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
          voucherTypeCD: FixedIDs.voucherType.DebitVoucher.code,
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
          tranModeCd:null, 
          fromLedger:null, 
          fromSubLedgerType:null, 
          fromSubLedgerDetail:null, 
          toLedger:null, 
          toSubLedgerType:null, 
          toSubLedgerDetail:null, 
          debitVal:null, 
          creditVal:null, 
          invoiceBillRefNo:null, 
          createdBy:null, 
          lastUpdate:null, 
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
        this.searchParam.createdBy = filters['createdBy'][0].value;
        this.searchParam.editedBy = filters['editedBy'][0].value;
        this.gridInvRefNoFilterValue = filters['invoiceBillRefNo'][0].value;
        this.searchParam.chequeNo = filters['chequeNo'][0].value;
        this.searchParam.chequeDate = filters['chequeDate'][0].value;
        this.searchParam.clearedOnDate = filters['clearedOnDate'][0].value;
        this.searchParam.draftStatus = filters['draftStatus'][0].value;
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
        if(this.searchParam.tranModeCd) searchParams.push(this.keyValuePair('tranModeCd', this.searchParam.tranModeCd || null));
        if(this.searchParam.toLedger) searchParams.push(this.keyValuePair('toLedger', this.searchParam.toLedger || null));
        if(this.searchParam.toSubLedgerType) searchParams.push(this.keyValuePair('toSubLedgerType', this.searchParam.toSubLedgerType || null));
        if(this.searchParam.toSubLedgerDetail) searchParams.push(this.keyValuePair('toSubLedgerDetail', this.searchParam.toSubLedgerDetail || null));
        if(this.searchParam.debitVal) searchParams.push(this.keyValuePair('debitVal', this.searchParam.debitVal || null));
        if(this.searchParam.creditVal) searchParams.push(this.keyValuePair('creditVal', this.searchParam.creditVal || null));
        if(this.searchParam.createdBy) searchParams.push(this.keyValuePair('createdBy', this.searchParam.createdBy || null));
        if(this.searchParam.editedBy) searchParams.push(this.keyValuePair('editedBy', this.searchParam.editedBy || null));
        if(this.searchParam.chequeNo) searchParams.push(this.keyValuePair('chequeNo', this.searchParam.chequeNo || null));
        if(this.searchParam.chequeDate) 
        {
          const date = new Date(this.searchParam.chequeDate);
          const chequeDate = `${date.getDate()}-${date.toLocaleString('en-GB', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`;
          searchParams.push(this.keyValuePair('chequeDate', chequeDate || null));
        }
        if(this.searchParam.clearedOnDate) 
        {
          const date = new Date(this.searchParam.clearedOnDate);
          const clearedOnDate = `${date.getDate()}-${date.toLocaleString('en-GB', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`;
          searchParams.push(this.keyValuePair('clearedOnDate', clearedOnDate || null));
        }
        if(this.searchParam.draftStatus) searchParams.push(this.keyValuePair('draftStatus', this.searchParam.draftStatus || null));
        
        let invRefNo = null;
        if(this.searchParam.invoiceBillRefNo)
        {
          invRefNo = this.searchParam.invoiceBillRefNo;
        }
        else if(this.gridInvRefNoFilterValue)
        {
          invRefNo = this.gridInvRefNoFilterValue
        }
        if(invRefNo) searchParams.push(this.keyValuePair('invoiceBillRefNo', invRefNo || null));
  
        return searchParams;
      } catch (e) {
        throw e;
      }
  }
  
  deleteCollection(entity: any) {
      try {
        let data = this.debitPaymentVourcherList.filter(x => x.id == entity.id);
  
        data.forEach(entity => {
          this.utilitySvc.deleteCollection(this.debitPaymentVourcherList, entity);
        }); 
  
      } catch (e) {
        throw e;
      }
  }

  prepareAndSendSMS(){
      try {    
          let voucherItemsubLedger=this.debitPaymentVoucherModel.voucherItemList.filter(x=>x.toSubLedgerDetailID);
          if(voucherItemsubLedger.length){
            let smsSendList=[];
            voucherItemsubLedger.forEach((item)=>{
              const mobileModel=this.subLedgerDetailList.find(x=>x.id==item.toSubLedgerDetailID && x.mobile);
              if(mobileModel){
                const smsModel={
                  voucherID:this.debitPaymentVoucherModel.id,
                  amount:item.debitVal,
                  currency:GlobalConstants.companyInfo.currency,
                  orgID:GlobalConstants.userInfo.companyID,              
                  companyName:GlobalConstants.userInfo.company,
                  email:'',
                  mobileNo:mobileModel.mobile,
                  templateName:'SMSTemplate',
                  locationID:GlobalConstants.userInfo.locationID,
                  createdByID:GlobalConstants.userInfo.userPKID
                }
                //Send the above object to the service to send an SMS.
                smsSendList.push(smsModel);
              }          
            });
    
            if(smsSendList.length){
              this.coreAccService.saveNotification(smsSendList).subscribe({
                next: (res: any) => {
                  
                },
                error: (res: any) => {
                  
                },
                complete: () => {},
              });
            }
               
          }
      } catch (error) {
       throw error;
      }
  }

  filterCOAStructure(item,orgID=null,projectID=null,transactionNatureCode){
      try {
        //Coa Struct Start
        let accountingNature=[{
          code:FixedIDs.accountingNature.Assets
        },{
          code:FixedIDs.accountingNature.Expenses
        },{
          code:FixedIDs.accountingNature.Liabilities
        },{
          code:FixedIDs.accountingNature.Equity
        }];
  
  
        item.toCoaStructureList = this.coaStructureList.filter((x) => {
          // Check if the code exists in transactionNature
          return x.orgID==orgID && x.projectID==projectID && accountingNature.some(tn => tn.code === x.accountNatureCd) && x.transactionNatureCode==null;
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
          return  x.orgID==orgID && x.projectID==projectID &&  x.transactionNatureCode==transactionNatureCode;
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

    setEnabledTab(data:any){
      try {
        this.isSingleCashEditMode = true;    
        this.isMultiCashEditMode = true;
        this.isSingleBankEditMode = true;
        this.isMultiBankEditMode = true;
      } catch (error) {
        throw error;
      }
    }

  resetTab(){
      try {
          this.isSingleCashEditMode = false;    
          this.isMultiCashEditMode = false;
          this.isSingleBankEditMode = false;
          this.isMultiBankEditMode = false;
      } catch (error) {
        throw error;
      }
  }

  totalSumDebit() {
    try {
      const voucherItemList=this.debitPaymentVoucherModel.voucherItemList.filter(x=>x.tag!=2);
      const totalDebit = voucherItemList.reduce((acc, curr) => acc + (+curr.debitVal), 0);
      if(!totalDebit){
        this.totalDebit = null;
      }else{
        this.totalDebit = totalDebit;
      }
    } catch (error) {
      throw error;
    }
  }

  public hasValidBranchProject() {
    try {
      let isInValid=false;
      if(this.isBranchModuleActive && !this.debitPaymentVoucherModel.orgID){
        isInValid=true;
      }
      return isInValid;
    } catch (error) {
      throw error;
      
    }
  }

  checkCashNatureNegativeAcceptanceValidity(){
    try {
      let isInValid=false;
      const {companyID,orgID,fromCoaStructBalance}=this.debitPaymentVoucherModel;
      let isNegativeBalanceAllowed=false;
      const ngtvBlncAcctnce=this.comOrgAcceptNegativeList.find(x=>x.companyID==companyID && (orgID>0? x.orgID==orgID :true));
      if(ngtvBlncAcctnce){
        isNegativeBalanceAllowed=ngtvBlncAcctnce.isNegativeBalanceAllowed;
      }

      if(!isNegativeBalanceAllowed){
        const totalValue=this.debitPaymentVoucherModel.voucherItemList.reduce((init,curr)=>init + (+curr.debitVal),0);
        let calValue=fromCoaStructBalance-totalValue;        
        if(calValue<0){
          isInValid=true;
        }
      }  

      return isInValid;
    } catch (error) {
      throw error;
    }
  }

  prepareCompanyOrgNgtvAcceptanceList(data){
    try {
      this.comOrgAcceptNegativeList=data[0];
    } catch (error) {
     throw error; 
    }
  }

  prepareChequeLeafNo(entity?: any){
    try {
      const dto = this.debitPaymentVoucherModel;
      const { companyID, orgID, projectID } = dto;
      let cOAStructureID = entity.fromCOAStructID;

      if (companyID) {
        let filteredList = this.chequeLeafNoList.filter(item => {
          if(!this.isBranchModuleActive)
          {
            return item.companyID === companyID &&
            item.orgID == companyID &&
            (item.cOAStructureID) === (cOAStructureID);
          }
          else
          {
            return item.companyID === companyID &&
            ((orgID == null && item.orgID == null) || (orgID != null && item.orgID === orgID)) &&
            ((projectID == null && item.projectID == null) || (projectID != null && item.projectID === projectID)) &&
            (item.cOAStructureID) === (cOAStructureID);
          }
        });
        entity.chequeLeafNoList = filteredList;
      }
    } catch (error) {
      throw error;
    }
 }
}
