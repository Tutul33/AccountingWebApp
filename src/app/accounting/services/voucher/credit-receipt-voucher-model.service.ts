import { Injectable } from '@angular/core';
import { VoucherAttachment, VoucherModel } from '../../models/voucher/voucher.model';
import { imageFileUploadOption, VoucherItemAttachment, VoucherItemModel } from '../../models/voucher/voucher-item.model';
import { Config, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods, UtilityService } from 'src/app/admin';
import { UntypedFormGroup } from '@angular/forms';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { VoucherNotificationLogDTO } from 'src/app/accounting/models/voucher-notification-log/voucher-notification-log';


@Injectable()
export class CreditReceiptVoucherModelService {
  multiVoucherCashForm: UntypedFormGroup;
    singleVoucherCashForm: UntypedFormGroup;
    multiVoucherBankForm: UntypedFormGroup;
    singleVoucherBankForm: UntypedFormGroup;
    decimalPlace:number=2;
    creditReceiptVoucherModel: VoucherModel = new VoucherModel();
    tempVoucherModel:any;
    orgList: any[] = [];
    validityVoucherEntryEdit:any;
    isMultiEntry:boolean=false;
    isCash:boolean=true;
    financialYearAll: any[] = [];
    financialYear: any[] = [];
    minDate: Date = null;
    maxDate: Date = null;
    isEdit:boolean=false;
    transactionModeList: any = [];
    transactionNoList: any = [];
    coaStructureList: any[] = [];
    fromCoaStructureList: any[] = [];
    toCoaStructureList: any[] = [];
    subLedgerDetailList: any[] = [];
    projectList: any[] = [];
    isSendSMSautomatically:boolean=false;
    sendSMS:boolean=false;
    isSingleCashEditMode:boolean=false;
    isMultiCashEditMode:boolean=false;
    isSingleBankEditMode:boolean=false;
    isMultiBankEditMode:boolean=false;
    voucherNotificationData: any;
    totalCredit: number = null;
    isBranchModuleActive: boolean = false;
    isProjectModuleActive: boolean = false;
    // Credit / Received Voucher List //
      
    fieldTitle: any;
    searchParam: any = {};
    keyValuePair: any;
    gridInvRefNoFilterValue: string = null;
    fileUploadOption: FileUploadOption; 
  
    creditPaymentVourcherList: any = [];
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
    gridInvBillList: any[] = [];
    gridChequeNoList: any[] = [];
    gridChequeIssueDateList: any[] = [];
    gridChequeClearedOnDateList: any[] = [];
    gridDraftStatusLlist:any[] = [];
    lockVoucherEditList: any = [];

    voucherNotificationLogDTO: VoucherNotificationLogDTO;
  
    constructor(private utilitySvc: UtilityService,public coreAccService:CoreAccountingService,) {}
    initiate() {
      this.creditReceiptVoucherModel = new VoucherModel();
      this.creditReceiptVoucherModel.tranModeCd = null;
      this.creditReceiptVoucherModel.companyID = GlobalConstants.userInfo.companyID;
      this.creditReceiptVoucherModel.company = GlobalConstants.userInfo.company;
      this.creditReceiptVoucherModel.voucherDate=new Date();
    }
   
    setVoucherNotificationConfig(data){
      try {
        this.voucherNotificationData=data;
          let config=data.find(x=>x.voucherCode==FixedIDs.voucherType.CreditVoucher.code);
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

    addNewItem(transactionNatureCd) {
      try {
        let objJournalVoucherItem = new VoucherItemModel();
        this.filterCOAStructure(objJournalVoucherItem,this.creditReceiptVoucherModel.orgID,this.creditReceiptVoucherModel.projectID,transactionNatureCd);

        this.creditReceiptVoucherModel.voucherItemList.entityPush(
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
           this.creditReceiptVoucherModel.voucherItemList.entityPop(item);
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
  
        //this.processBalances();
      } catch (error) {
        throw error;
      }
    }
  
    setEntryType(isMultiEntry,isCash){
      try {
        this.isCash=isCash;
        this.isMultiEntry=isMultiEntry;
      } catch (error) {
        
      }
    }
  
    resetFormMultipleCash() {
      try {
        this.initiate(); 
        if(this.multiVoucherCashForm)
        this.multiVoucherCashForm.markAsPristine();
      } catch (error) {
        throw error;
      }
    }
  
    resetFormSingleCash() {
      try {
        this.initiate();
        if(this.singleVoucherCashForm)
        this.singleVoucherCashForm.markAsPristine();   
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
  
        const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.creditReceiptVoucherModel.toSubLedgerTypeID);
  
        if (
          this.creditReceiptVoucherModel.toCOAStructID > 0 &&
          !this.creditReceiptVoucherModel.toSubLedgerDetailID &&
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
        const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.creditReceiptVoucherModel.toSubLedgerTypeID);
  
        if (
          this.creditReceiptVoucherModel.toCOAStructID ==
            this.creditReceiptVoucherModel.fromCOAStructID &&
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
        this.creditReceiptVoucherModel.voucherItemList.forEach((item:VoucherItemModel) => {
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
  
    allSubLedgerDetailList:any[]=[];
    prepareDataForEdit(data:any){
        try {
          const model=data;
  
          if(model)
          this.setEntryType(model.isMultiEntry,model.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code?true:false);
       
          if(model.isMultiEntry){                    
              this.creditReceiptVoucherModel=new VoucherModel(model);          
              this.creditReceiptVoucherModel.id=model.id;
              this.creditReceiptVoucherModel.voucherDate=new Date(model.voucherDate)
              this.creditReceiptVoucherModel.company=model.company;
              this.creditReceiptVoucherModel.dateID=model.dateID;
              this.creditReceiptVoucherModel.voucherTypeCd=model.voucherTypeCd;
              this.creditReceiptVoucherModel.companyID=model.companyID;
              this.creditReceiptVoucherModel.orgID=model.orgID;
              this.creditReceiptVoucherModel.voucherNo=model.voucherNo;
              this.creditReceiptVoucherModel.remarks=model.remarks;
              this.creditReceiptVoucherModel.createdByID=model.createdByID;
              this.creditReceiptVoucherModel.approvedByID=model.approvedByID;
              this.creditReceiptVoucherModel.approvalStatus=model.approvalStatus;          
              this.creditReceiptVoucherModel.isMultiEntry=model.isMultiEntry;
              this.creditReceiptVoucherModel.voucherTitleCd=model.voucherTitleCd;
              this.creditReceiptVoucherModel.isDraft=model.isDraft;
              this.creditReceiptVoucherModel.isActive=model.isActive;
              this.creditReceiptVoucherModel.insertDateTime=new Date(model.insertDateTime);
              this.creditReceiptVoucherModel.insertUserID=model.createdByID;
      
              this.creditReceiptVoucherModel.voucherItemList.forEach((item: any) => {
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

               // this.creditReceiptVoucherModel.fromCOAStructID = item.fromCOAStructID;
                  debugger
                  item.toCOAStructID = item.toCOAStructID;
                  item.toSubLedgerDetailID = item.toSubLedgerDetailID;
               
              });
            }else{            
              this.creditReceiptVoucherModel = new VoucherModel(model);
              this.creditReceiptVoucherModel.voucherDate = new Date(model.voucherDate);
              this.creditReceiptVoucherModel.insertDateTime=new Date(model.insertDateTime);
              this.creditReceiptVoucherModel.dateID = model.dateID;
              this.creditReceiptVoucherModel.orgID = model.orgID;      
              this.creditReceiptVoucherModel.id = model.id;      
              this.creditReceiptVoucherModel.approvedByID = this.creditReceiptVoucherModel.approvedByID || null;
              this.creditReceiptVoucherModel.editUserID = this.creditReceiptVoucherModel.editUserID || null;
              this.creditReceiptVoucherModel.voucherTitleCd = this.creditReceiptVoucherModel.voucherTitleCd || null;
              this.creditReceiptVoucherModel.insertUserID=model.createdByID;
              this.creditReceiptVoucherModel.voucherItemList.forEach((item) => {
                item.id=item.voucherItemID;
                this.creditReceiptVoucherModel.fromCOAStructID = item.fromCOAStructID;
                this.creditReceiptVoucherModel.fromSubLedgerTypeID = item.fromSubLedgerTypeID;

                this.creditReceiptVoucherModel.toCOAStructID = item.toCOAStructID;
                this.creditReceiptVoucherModel.toSubLedgerTypeID = item.toSubLedgerTypeID;

                this.creditReceiptVoucherModel.description = item.description;
                this.creditReceiptVoucherModel.voucherItemID = item.voucherItemID;
                this.creditReceiptVoucherModel.debitVal = item.debitVal;
                this.creditReceiptVoucherModel.creditVal = item.creditVal;
                this.creditReceiptVoucherModel.invoiceBillRefNo = item.invoiceBillRefNo;
                this.creditReceiptVoucherModel.tranModeCd = item.tranModeCd;
                this.creditReceiptVoucherModel.chequeNo = item.chequeNo;

                if(item.chequeDate)     
                  this.creditReceiptVoucherModel.chequeDate=new Date(item.chequeDate);  
                if(item.clearedOnDate)      
                  this.creditReceiptVoucherModel.clearedOnDate=new Date(item.clearedOnDate);    

                this.creditReceiptVoucherModel.fromSubLedgerDetailID = item.fromSubLedgerDetailID;
                this.creditReceiptVoucherModel.toSubLedgerDetailID = item.toSubLedgerDetailID;
                
                const itemFiles = item.voucherItemAttachmentList.filter(
                  (x) => x.fileName
                );
      
                itemFiles.forEach((element) => {
                  const fileAttach = new VoucherAttachment();
                  fileAttach.fileName = element.fileName;
                  fileAttach.folderName = "voucher";
                  fileAttach.id = element.voucherItemAttachmentID;
                  fileAttach.voucherItemID = element.voucherItemID;
                  this.creditReceiptVoucherModel.voucherAttachmentList.push(fileAttach);
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
                   if(voucherItem.chequeNo){
                    setTimeout(() => {
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
        if(!this.creditReceiptVoucherModel.id){
        let objVoucherItem = new VoucherItemModel(
          this.creditReceiptVoucherModel
        );
        objVoucherItem.imageFileUploadOpton=this.creditReceiptVoucherModel.imageFileUploadOpton;
        this.creditReceiptVoucherModel.voucherAttachmentList.forEach((attach)=>{
          const objAttach=new VoucherItemAttachment(attach);
          objVoucherItem.voucherItemAttachmentList.push(objAttach);
        })
        
        this.creditReceiptVoucherModel.insertDateTime=new Date();
        this.creditReceiptVoucherModel.voucherItemList = [];
        objVoucherItem.description=this.creditReceiptVoucherModel.description;
        objVoucherItem.toSubLedgerDetailID=null;
        objVoucherItem.toSubLedgerTypeID=null;
        objVoucherItem.fromCoaStructBalance=this.creditReceiptVoucherModel.fromCoaStructBalance||0;
        objVoucherItem.fromSubLedgerBalance=this.creditReceiptVoucherModel.fromSubLedgerBalance||0;

        objVoucherItem.tranModeCd=this.creditReceiptVoucherModel.tranModeCd;
      
        this.creditReceiptVoucherModel.voucherItemList.entityPush(
          objVoucherItem
        );
        this.creditReceiptVoucherModel.voucherTypeCd=FixedIDs.voucherType.CreditVoucher.code;
        this.creditReceiptVoucherModel.createdByID=GlobalConstants.userInfo.userPKID;
        this.creditReceiptVoucherModel.approvalStatus=FixedIDs.approvalStatus.Pending;      
        this.creditReceiptVoucherModel.dateID = 0;
        this.creditReceiptVoucherModel.isMultiEntry=false;
        this.creditReceiptVoucherModel.isDraft=this.creditReceiptVoucherModel.isDraft||false;
         if(this.isCash){
          this.creditReceiptVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.creditVoucherCash.code;
        }else{
          this.creditReceiptVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.creditVoucherBank.code;
        }
        this.creditReceiptVoucherModel.insertUserID=GlobalConstants.userInfo.userPKID;
        this.setCodeGenProperty();
      }else{
        let objVoucherItem = new VoucherItemModel(
          this.creditReceiptVoucherModel
        ); 
        this.creditReceiptVoucherModel.voucherAttachmentList.forEach((attach)=>{
          const objAttach=new VoucherItemAttachment(attach);
         if(objAttach.tag==2){
          objAttach.deletedFileName=attach.fileName;
         }
         objAttach.voucherItemID=this.creditReceiptVoucherModel.voucherItemID;
         objVoucherItem.voucherItemAttachmentList.push(objAttach);
        })
        this.creditReceiptVoucherModel.isDraft=this.creditReceiptVoucherModel.isDraft||false;
        
        this.creditReceiptVoucherModel.voucherItemList = [];
        objVoucherItem.id=this.creditReceiptVoucherModel.voucherItemID;
        objVoucherItem.voucherID=this.creditReceiptVoucherModel.id;
        objVoucherItem.description=this.creditReceiptVoucherModel.description;
        objVoucherItem.toSubLedgerTypeID=null;
        objVoucherItem.setModifyTag();
        this.creditReceiptVoucherModel.voucherItemList.push(
          objVoucherItem
        );
        this.creditReceiptVoucherModel.editUserID=GlobalConstants.userInfo.userPKID;
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
          condeGenPropertyVal.voucherTypeShortName=FixedIDs.voucherType.CreditVoucher.shortName;
          this.creditReceiptVoucherModel.codeGenPropertyVal = JSON.stringify(condeGenPropertyVal).toString();
    
        } catch (error) {
          throw error;
        }
    }
  
    prepareDataForMultiEntryCash() {
      try {
        this.creditReceiptVoucherModel.voucherItemList.forEach((item:VoucherItemModel)=>{
          item.toSubLedgerDetailID=null;
          item.toSubLedgerTypeID=null;
          item.tranModeCd=item.tranModeCd;
          item.transactionID=0;
      });
        if(!this.creditReceiptVoucherModel.id){      
        this.creditReceiptVoucherModel.voucherTypeCd = FixedIDs.voucherType.CreditVoucher.code;
        this.creditReceiptVoucherModel.createdByID = GlobalConstants.userInfo.userPKID;
        this.creditReceiptVoucherModel.approvalStatus = FixedIDs.approvalStatus.Pending;
        this.creditReceiptVoucherModel.dateID = 0;
        this.creditReceiptVoucherModel.isMultiEntry=true;
        this.creditReceiptVoucherModel.insertUserID=GlobalConstants.userInfo.userPKID;
        this.creditReceiptVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.creditVoucherCash.code;
        this.creditReceiptVoucherModel.isDraft=this.creditReceiptVoucherModel.isDraft||false;
        this.setCodeGenProperty();
      }else{
        this.creditReceiptVoucherModel.editUserID=GlobalConstants.userInfo.userPKID;
      }
      } catch (error) {
        throw error;
      }
    }
    prepareDataForMultiEntryBank() {
      try {
        this.creditReceiptVoucherModel.voucherItemList.forEach((item)=>{
          item.toSubLedgerDetailID=null;
          item.toSubLedgerTypeID=null;
          item.toSubledgerBalance=0;
          item.tranModeCd=item.tranModeCd;
          item.transactionID=0;
      });
        if(!this.creditReceiptVoucherModel.id){     
        this.creditReceiptVoucherModel.voucherTypeCd = FixedIDs.voucherType.CreditVoucher.code;
        this.creditReceiptVoucherModel.createdByID = GlobalConstants.userInfo.userPKID;
        this.creditReceiptVoucherModel.approvalStatus = FixedIDs.approvalStatus.Pending;
        this.creditReceiptVoucherModel.dateID = 0;
        this.creditReceiptVoucherModel.isMultiEntry=true;
        this.creditReceiptVoucherModel.insertUserID=GlobalConstants.userInfo.userPKID;
        this.creditReceiptVoucherModel.voucherTitleCd=FixedIDs.voucherTitleCd.creditVoucherBank.code;
        this.creditReceiptVoucherModel.isDraft=this.creditReceiptVoucherModel.isDraft||false;
        this.setCodeGenProperty();
    }else{
      this.creditReceiptVoucherModel.editUserID = GlobalConstants.userInfo.userPKID;
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
              this.tempVoucherModel = JSON.stringify(GlobalMethods.deepClone(this.creditReceiptVoucherModel));
            }else{
              this.tempVoucherModel = null;
            }
          //this.tempVoucherModel = JSON.stringify(GlobalMethods.deepClone(this.creditReceiptVoucherModel));
      } catch (error) {
        throw error;
      }
    }
    
    prepareDataModelMultiEntry(data){
      try {
            this.creditReceiptVoucherModel=new VoucherModel(data);          
            this.creditReceiptVoucherModel.id=data.id;
            this.creditReceiptVoucherModel.voucherDate=new Date(data.voucherDate)
            this.creditReceiptVoucherModel.company=data.company;
            this.creditReceiptVoucherModel.dateID=data.dateID;
            this.creditReceiptVoucherModel.voucherTypeCd=data.voucherTypeCd;
            this.creditReceiptVoucherModel.companyID=data.companyID;
            this.creditReceiptVoucherModel.orgID=data.orgID;
            this.creditReceiptVoucherModel.voucherNo=data.voucherNo;
            this.creditReceiptVoucherModel.remarks=data.remarks;
            this.creditReceiptVoucherModel.createdByID=data.createdByID;
            this.creditReceiptVoucherModel.approvedByID=data.approvedByID;
            this.creditReceiptVoucherModel.approvalStatus=data.approvalStatus;          
            this.creditReceiptVoucherModel.isMultiEntry=data.isMultiEntry;
            this.creditReceiptVoucherModel.voucherTitleCd=data.voucherTitleCd;
            this.creditReceiptVoucherModel.isDraft=data.isDraft;
            this.creditReceiptVoucherModel.isActive=data.isActive;
  
            this.creditReceiptVoucherModel.voucherItemList.forEach((item:VoucherItemModel)=>{
                item.voucherItemID=item.id;
                item.imageFileUploadOpton=imageFileUploadOption();
  
                if(item.chequeDate){
                  item.chequeDate=new Date(item.chequeDate);
                }
  
                if(item.clearedOnDate){
                  item.clearedOnDate=new Date(item.clearedOnDate);
                }

                this.filterCOAStructure(item,this.creditReceiptVoucherModel.orgID,this.creditReceiptVoucherModel.projectID,this.creditReceiptVoucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code?FixedIDs.receiptCd.cash.code:FixedIDs.receiptCd.bank.code);
                this.filterSubLedgerDetail(item);
            });
            
      } catch (error) {
        throw error;
      }
    }
  
    prepareDataModelSingleEntry(data){
      try {
            this.creditReceiptVoucherModel=new VoucherModel(data);          
            this.creditReceiptVoucherModel.id=data.id;
            this.creditReceiptVoucherModel.voucherDate=new Date(data.voucherDate)
            this.creditReceiptVoucherModel.company=data.company;
            this.creditReceiptVoucherModel.dateID=data.dateID;
            this.creditReceiptVoucherModel.voucherTypeCd=data.voucherTypeCd;
            this.creditReceiptVoucherModel.companyID=data.companyID;
            this.creditReceiptVoucherModel.orgID=data.orgID;
            this.creditReceiptVoucherModel.voucherNo=data.voucherNo;
            this.creditReceiptVoucherModel.remarks=data.remarks;
            this.creditReceiptVoucherModel.createdByID=data.createdByID;
            this.creditReceiptVoucherModel.approvedByID=data.approvedByID;
            this.creditReceiptVoucherModel.approvalStatus=data.approvalStatus;          
            this.creditReceiptVoucherModel.isMultiEntry=data.isMultiEntry;
            this.creditReceiptVoucherModel.voucherTitleCd=data.voucherTitleCd;
            this.creditReceiptVoucherModel.isDraft=data.isDraft;
            this.creditReceiptVoucherModel.isActive=data.isActive;
            this.creditReceiptVoucherModel.locationID=data.locationID;
            this.creditReceiptVoucherModel.insertUserID=data.insertUserID;
            this.creditReceiptVoucherModel.projectID=data.projectID;
            data.voucherItemList.forEach((item:any)=>{
                this.creditReceiptVoucherModel.voucherItemID=item.id;
                item.voucherItemID = item.id;
                this.creditReceiptVoucherModel.fromCOAStructID=item.fromCOAStructID;
                this.creditReceiptVoucherModel.fromSubLedgerDetailID=item.fromSubLedgerDetailID;
                this.creditReceiptVoucherModel.fromCoaStructBalance=item.fromCoaStructBalance;

                this.creditReceiptVoucherModel.toCOAStructID=item.toCOAStructID;
                this.creditReceiptVoucherModel.toSubLedgerDetailID=item.toSubLedgerDetailID;
                this.creditReceiptVoucherModel.toSubLedgerTypeID=item.toSubLedgerTypeID;
                this.creditReceiptVoucherModel.toAccountBalance=item.toAccountBalance;
                this.creditReceiptVoucherModel.toSubledgerBalance=item.toSubledgerBalance;

                this.creditReceiptVoucherModel.debitVal=item.debitVal;
                this.creditReceiptVoucherModel.creditVal=item.creditVal;
                this.creditReceiptVoucherModel.voucherAttachmentList=item.voucherItemAttachmentList;
           
                this.creditReceiptVoucherModel.description=item.description;
                this.creditReceiptVoucherModel.invoiceBillRefNo=item.invoiceBillRefNo;
  
                this.creditReceiptVoucherModel.tranModeCd=item.tranModeCd;
                this.creditReceiptVoucherModel.chequeNo=item.chequeNo;
  
                if(item.chequeDate){
                  this.creditReceiptVoucherModel.chequeDate=new Date(item.chequeDate);
                }
  
                if(item.clearedOnDate){
                  this.creditReceiptVoucherModel.clearedOnDate=new Date(item.clearedOnDate);
                }

                this.filterCOAStructure(this.creditReceiptVoucherModel,this.creditReceiptVoucherModel.orgID,this.creditReceiptVoucherModel.projectID,this.creditReceiptVoucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code?FixedIDs.receiptCd.cash.code:FixedIDs.receiptCd.bank.code);
                this.filterSubLedgerDetail(this.creditReceiptVoucherModel);
         
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
  
    setSubLedgerFromAccount(entity: any,balance) {
      try {
        entity.fromSubLedgerTypeID=this.subLedgerDetailList.find(x=>x.id==entity.fromSubLedgerDetailID)?.subLedgerTypeID;
        entity.fromSubLedgerBalance=balance||0;
      } catch (error) {
        throw error;
      }
    }
  
    setSubLedgerFromAccountMulti(entity: any,balance:number) {
      try {
         entity.fromSubLedgerBalance = balance||0;
  
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
        const candidateData = this.creditReceiptVoucherModel.voucherItemList.filter(
          (x) =>
            x.fromCOAStructID &&
            x.toCOAStructID &&
            x.toSubLedgerDetailID?x.toSubLedgerDetailID:true 
            //&& x.projectID?x.projectID:true 
        );
        // Extract only the relevant properties
        const filteredData = candidateData.map(
          ({
            fromCOAStructID,
            toCOAStructID,
            toSubLedgerDetailID,
            //projectID
          }) => ({
            fromCOAStructID,
            toCOAStructID,
            toSubLedgerDetailID,
           // projectID
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
        const candidateData = this.creditReceiptVoucherModel.voucherItemList.filter(
          (x) =>
            x.fromCOAStructID &&
            x.toSubLedgerDetailID?x.toSubLedgerDetailID:true &&
            x.toCOAStructID 
            //&& x.projectID?x.projectID:true
        );
        // Extract only the relevant properties
        const filteredData = candidateData.map(
          ({
            fromCOAStructID,
            toSubLedgerDetailID,
            toCOAStructID,
            //projectID,
          }) => ({
            fromCOAStructID,
            toSubLedgerDetailID,
            toCOAStructID,
            //projectID,
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
         this.processBalances();
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
        this.processBalances();
      } catch (error) {
        throw error;
      }
    }
  
    onSelectFromAccountMulti(item: VoucherItemModel,balance:number) {
      try {      
        item.fromCoaStructBalance=balance||0;
        //this.processBalances();
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
         const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.creditReceiptVoucherModel.toSubLedgerTypeID);
  
        if (
          this.creditReceiptVoucherModel.toCOAStructID > 0 &&
          !this.creditReceiptVoucherModel.toSubLedgerDetailID &&
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
        const fromSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.creditReceiptVoucherModel.fromSubLedgerTypeID);
        const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==this.creditReceiptVoucherModel.toSubLedgerTypeID);
  
        if (
          this.creditReceiptVoucherModel.toCOAStructID ==
            this.creditReceiptVoucherModel.fromCOAStructID &&
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
        const items = this.creditReceiptVoucherModel.voucherItemList;
  
        while (!isInvalid && index < items.length) {
          const item = items[index];
          const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==item.toSubLedgerTypeID);
  
          //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected And Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
          if (
            item.toCOAStructID > 0 &&
            !item.toSubLedgerDetailID &&
            toSubLedgerDetailList.length &&
            item.fromCOAStructID > 0 
          ) {
            isInvalid = true;
            isInvalidCaseOne = true;
          } //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected
          else 
          if (
            item.toCOAStructID > 0 &&
            !item.toSubLedgerDetailID &&
            toSubLedgerDetailList.length 
          ) {
            isInvalid = true;
            isInvalidCaseTwo = true;
          }          
          //Check Validity -- Same From Account and To Account but no subledger list
          else if (
            item.toCOAStructID === item.fromCOAStructID &&
            //!item.fromSubLedgerDetailList.length &&
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
        //let isInvalidCaseTwo = false;
        let isInvalidCaseThree = false;
        let isInvalidCaseFour = false;
        let index = 0;
        const items = this.creditReceiptVoucherModel.voucherItemList;
  
        while (!isInvalid && index < items.length) {
          const item = items[index];
          const toSubLedgerDetailList=this.subLedgerDetailList.filter(x=>x.subLedgerTypeID==item.toSubLedgerTypeID);
  
          //Check Validity Of From Account if there are exist Sub-Ledger but subledger not selected And Check Validity Of To Account if there are exist Sub-Ledger but subledger not selected
          if (
            item.fromCOAStructID > 0 &&
            !item.toSubLedgerDetailID &&
            toSubLedgerDetailList.length &&
            item.toCOAStructID > 0 
          ) {
            isInvalid = true;
            isInvalidCaseOne = true;
          } 
        
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
        entity.transactionNoList=this.transactionNoList.filter(x=>x.transactionModeID==entity.tranModeCd);
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
        for (const row of this.creditReceiptVoucherModel.voucherItemList) {
          let groupKey = "";
         
            if (row.fromCOAStructID && row.fromSubLedgerDetailID               //&& row.projectID
            ) {
              //First Group condition
              groupKey = `${row.fromCOAStructID}-${row.fromSubLedgerDetailID}`;//-${row.projectID}`;
              if (!groupedData[groupKey]) {
                groupedData[groupKey] = [];
              }
              groupedData[groupKey].push(row);
  
              groupKey = `${row.fromCOAStructID}`;
              
              if (!groupedData[groupKey]) {
                groupedData[groupKey] = [];
              }
              groupedData[groupKey].push(row);
            } else 
            if (row.fromCOAStructID) {
              //Third Group condition
              groupKey = `${row.fromCOAStructID}`;
  
              if (!groupedData[groupKey]) {
                groupedData[groupKey] = [];
              }
              groupedData[groupKey].push(row);
            }
          //}
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
              if (prevRow.creditVal !== 0 && prevRow.creditVal !== null) {
                const accountNatureCode= currentRow.fromCoaStructureList.find(x=>x.id==currentRow.fromCOAStructID)?.accountNatureCd;
                if(accountNatureCode==FixedIDs.accountingNature.Assets)
                {
                  currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance - +prevRow.creditVal;
                }else if(accountNatureCode==FixedIDs.accountingNature.Income || accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                  currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance + +prevRow.creditVal;
                }
              } 
              else {
                currentRow.fromCoaStructBalance = prevRow.fromCoaStructBalance;
              }
  
              
              if(currentRow.fromSubLedgerDetailID){
                  if(groupKey.includes(currentRow.fromSubLedgerDetailID.toString())){
                  //Calculate toSubledgerBalance
                  if (prevRow.creditVal !== 0 && prevRow.creditVal !== null) {
                      const accountNatureCode= currentRow.fromCoaStructureList.find(x=>x.id==currentRow.fromCOAStructID)?.accountNatureCd;
                    if( accountNatureCode==FixedIDs.accountingNature.Assets)
                    {
                      currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance - +prevRow.creditVal;
                    }else 
                    if(accountNatureCode==FixedIDs.accountingNature.Income || accountNatureCode==FixedIDs.accountingNature.Liabilities || accountNatureCode==FixedIDs.accountingNature.Equity){
                      currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance + +prevRow.creditVal;
                    }
                  } 
                  else 
                  {
                    currentRow.fromSubLedgerBalance = prevRow.fromSubLedgerBalance;
                  }
                  }
              }
              else
              {
                  currentRow.fromSubLedgerBalance =0;
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
          const checkDate = new Date(this.creditReceiptVoucherModel.voucherDate);      
          
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
          this.orgList = orgList || [];     
    
       this.setSingleORG();
        } catch (error) {
          throw error;
        }
      }
  rawOrgList:any=[];
  setSingleORG(){
    if(this.rawOrgList.length==1 && this.isBranchModuleActive){
      this.creditReceiptVoucherModel.orgID=this.rawOrgList[0].id;
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
        if (this.creditReceiptVoucherModel.id) {
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
    
        const { financialYearMinDate, financialYearMaxDate, creditReceiptVoucherModel, validityVoucherEntryEdit} = this;
        const { voucherDate, orgID, projectID, id } = creditReceiptVoucherModel;
    
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
          voucherTypeCD: FixedIDs.voucherType.CreditVoucher.code,
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
        //this.searchParam.clearedOnDate = filters['clearedOnDate'][0].value;
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
        // if(this.searchParam.clearedOnDate) 
        // {
        //   const date = new Date(this.searchParam.clearedOnDate);
        //   const clearedOnDate = `${date.getDate()}-${date.toLocaleString('en-GB', { month: 'short' })}-${date.getFullYear().toString().slice(-2)}`;
        //   searchParams.push(this.keyValuePair('clearedOnDate', clearedOnDate || null));
        // }
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
        let data = this.creditPaymentVourcherList.filter(x => x.id == entity.id);
  
        data.forEach(entity => {
          this.utilitySvc.deleteCollection(this.creditPaymentVourcherList, entity);
        }); 
  
      } catch (e) {
        throw e;
      }
    }

    prepareAndSendSMS(){
      try {
    
          let voucherItemsubLedger=this.creditReceiptVoucherModel.voucherItemList.filter(x=>x.toSubLedgerDetailID);
          if(voucherItemsubLedger.length){
            let smsSendList=[];
            voucherItemsubLedger.forEach((item)=>{
              const mobileModel=this.subLedgerDetailList.find(x=>x.id==item.toSubLedgerDetailID && x.mobile);
              if(mobileModel){
                const smsModel={
                  voucherID:this.creditReceiptVoucherModel.id,
                  amount:item.creditVal,
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

    filterCOAStructure(item,orgID=null,projectID=null,transactionNatureCode){
      try {
        //Coa Struct Start
        let accountingNature=[{
          code:FixedIDs.accountingNature.Assets
        },{
          code:FixedIDs.accountingNature.Income
        },{
          code:FixedIDs.accountingNature.Liabilities
        },{
          code:FixedIDs.accountingNature.Equity
        }];
  
  
        item.fromCoaStructureList = this.coaStructureList.filter((x) => {
          // Check if the code exists in transactionNature
          return x.orgID==orgID && x.projectID==projectID && accountingNature.some(tn => tn.code === x.accountNatureCd) && x.transactionNatureCode==null;
        });

        if(item.fromCoaStructureList.length==1)
        {
          item.fromCOAStructID=item.fromCoaStructureList[0].id;
          item.fromSubLedgerTypeID=item.fromCoaStructureList[0]?.subLedgerTypeID;
          if(item.fromSubLedgerTypeID)
            this.filterSubLedgerDetail(item); 
        }

        item.toCoaStructureList = this.coaStructureList.filter((x) => {
          // Check if the code exists in transactionNature
          return  x.orgID==orgID && x.projectID==projectID &&  x.transactionNatureCode==transactionNatureCode;
        });

        if(item.toCoaStructureList.length==1)
          {
            item.toCOAStructID=item.toCoaStructureList[0].id;
            item.toSubLedgerTypeID=item.toCoaStructureList[0]?.subLedgerTypeID;
            if(item.toSubLedgerTypeID)
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
          item.toSubLedgerDetailList=this.subLedgerDetailList.filter((x)=>x.subLedgerTypeID == item.toSubLedgerTypeID);
          if(item.toSubLedgerDetailList.length==1){
            setTimeout(()=>{
              item.toSubLedgerDetailID=item.toSubLedgerDetailList[0].id;
            },50)
          }
        }
        else{
          item.toSubLedgerDetailList=[];
        }
  
        if(item.fromSubLedgerTypeID)
         { 
          item.fromSubLedgerDetailList=this.subLedgerDetailList.filter((x)=>x.subLedgerTypeID == item.fromSubLedgerTypeID);
          if(item.fromSubLedgerDetailList.length==1){
            setTimeout(()=>{
              item.fromSubLedgerDetailID=item.fromSubLedgerDetailList[0].id;
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
      let coaList = this.creditReceiptVoucherModel.fromCoaStructureList.filter(x => 
        (!item.orgID || x.orgID === item.orgID) && 
        (!item.projectID || x.projectID === item.projectID)
      );
      return coaList;
    }
    public getToCoaStructureByOrgAndProject(item: any) {
      let coaList = this.creditReceiptVoucherModel.toCoaStructureList.filter(x => 
        (!item.orgID || x.orgID === item.orgID) && 
        (!item.projectID || x.projectID === item.projectID)
      );
      return coaList;
    }
    chaeckFromAccountToAccountOnAddNewItem() {
      try {
       let data= this.creditReceiptVoucherModel.voucherItemList.filter(x=>!x.fromCOAStructID || !x.toCOAStructID);
       if(data.length){
        return true;
       }
       return false;
      } catch (error) {
        throw error;
      }
    }

    totalSumCredit() {
      try {
        const voucherItemList=this.creditReceiptVoucherModel.voucherItemList.filter(x=>x.tag!=2);
        const totalCredit = voucherItemList.reduce((acc, curr) => acc + (+curr.creditVal), 0);
        if(!totalCredit){
          this.totalCredit = null;
        }else{
          this.totalCredit = totalCredit;
        }
      } catch (error) {
        throw error;
      }
    }
    
    public hasValidBranchProject() {
      try {
        let isInValid=false;
        if(this.isBranchModuleActive && !this.creditReceiptVoucherModel.orgID){
          isInValid=true;
        }
        return isInValid;
      } catch (error) {
        throw error;
        
      }
    }
}
