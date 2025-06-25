import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import {
  BaseComponent,
  Config,
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
  ProviderService,
  ValidatingObjectFormat,
  ValidatorDirective,
} from "src/app/app-shared";
import {
  DebitPaymentVoucherDataService,
  DebitPaymentVoucherModelService,
  FileUploadComponent
} from "../../../index";
import { NgForm, UntypedFormGroup } from "@angular/forms";
import {  
  SingleVoucherBankValidation
} from "src/app/accounting/models/voucher/voucher.model";
import {
  FileUploadOption,
  ModalConfig,
  QueryData,
} from "src/app/shared/models/common.model";
import { VoucherItemModel } from "src/app/accounting/models/voucher/voucher-item.model";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { forkJoin } from "rxjs";
import { OrgService } from "src/app/app-shared/services/org.service";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-debit-payment-voucher-entry-single-bank',
  templateUrl: './debit-payment-voucher-entry-single-bank.component.html',
  providers:[DebitPaymentVoucherDataService,DebitPaymentVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class DebitPaymentVoucherEntrySingleBankComponent  extends BaseComponent
implements OnInit,AfterViewInit {
@Input() voucherModel: any;
isSubmitted: boolean = false;
projectOfficeBranch:string='';
companyName:string='';
spData: any = new QueryData();
@Output() dataEmitToParent = new EventEmitter<any>();
ref: DynamicDialogRef;
public singleBankValidationMsgObj: ValidatingObjectFormat;
@ViewChild(ValidatorDirective) directive;
loginUserID: number = GlobalConstants.userInfo.userPKID;

//Single Bank
@ViewChild("singleVoucherBankForm", { static: true, read: NgForm })
singleVoucherBankForm: NgForm;

fileUploadOption: FileUploadOption;
bankNatureTransactionCode: any;

transactionModeCheque:any;
isInValidBranch:boolean=false;
constructor(
  protected providerSvc: ProviderService,
  private dataSvc: DebitPaymentVoucherDataService,
  public modelSvc: DebitPaymentVoucherModelService,
  public coreAccService:CoreAccountingService,
  public orgService: OrgService,
  public dialogService: DialogService
) {
  super(providerSvc);
  this.singleBankValidationMsgObj = SingleVoucherBankValidation();
}

ngOnInit() {
  try {
    this.setBranchProjectConfig();
    this.bankNatureTransactionCode=FixedIDs.transactionNatureCd.bankNature.code; 
    this.transactionModeCheque=FixedIDs.TransactionMode.Cheque; 
    this.getChequeLeafNo();
    setTimeout(()=>{
      this.loadOtherData();      
    },10);
    this.modelSvc.initiate();
    this.getFileUploadOption();
    } catch (error) {
    this.showErrorMsg(error);
  }
}

setBranchProjectConfig(){
  try {
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
  } catch (error) {
    this.showErrorMsg(error);
  }
}

ngAfterViewInit() {
  try {
    this.modelSvc.singleVoucherBankForm = this.singleVoucherBankForm.form;
  } catch (e) {
    this.showErrorMsg(e);
  }
}

loadOtherData(){
  try {    
    this.modelSvc.isCash=false;
    
    let elementCode='';
      elementCode= FixedIDs.orgType.Branch.toString();
      elementCode+= ','+FixedIDs.orgType.Office.toString();
      elementCode+= ','+FixedIDs.orgType.Unit.toString(); 
    const orgID=GlobalConstants.userInfo.companyID.toString();
     
    forkJoin(
      [
       this.orgService.getOrgStructure(elementCode,orgID),
       this.coreAccService.getProject(GlobalConstants.userInfo.companyID),
       this.coreAccService.getCOAStructure(),
       this.coreAccService.getSubLedgerDetail(),
       this.coreAccService.getFinancialYear(),
       this.coreAccService.getVoucherEntryEditPeriod(GlobalConstants.userInfo.companyID,null,null),
       this.coreAccService.getTransactionMode(true),
       this.coreAccService.getVoucherNotification(),
       this.orgService.getOrgStructure(FixedIDs.orgType.Company.toString(), ''),
      ]
     ).subscribe({
         next: (res: any) => {
          this.modelSvc.prepareOrgList(res[0]);     
          this.modelSvc.projectList = res[1] || [];   
          
          //Coa Struct Start          
          this.modelSvc.coaStructureList = res[2] || [];      
         
          if(this.modelSvc.debitPaymentVoucherModel.orgID){
            this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,null,this.bankNatureTransactionCode);  
          }else{
          this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,null,null,this.bankNatureTransactionCode);    
          }
         //END

         this.prepareChequeLeafNo();

         this.modelSvc.subLedgerDetailList=res[3] || [];   
         if(this.voucherModel){
          this.modelSvc.isSingleBankEditMode=true;
          this.loadVoucherToEdit();
         } 
          //last
          //get Voucher Entry Edit Period and finalcial year start
          this.modelSvc.financialYearAll=res[4].length?res[4]:[];
          this.modelSvc.validityVoucherEntryEdit=res[5].length?res[5]:[];

           setTimeout(() => {                
             this.modelSvc.setMinDateMaxDate();
             this.modelSvc.setMinMaxDateBasedOnComapnyProjectOrg();
            }, 10);     
            //END

            this.modelSvc.transactionModeList=res[6] || [];   
            if(res[7].length){
              this.modelSvc.setVoucherNotificationConfig(res[7]);
            }
            this.modelSvc.companyList=res[8]||[];
         },
         error: (res: any) => {
           this.showErrorMsg(res);
         },
       });

  } catch (error) {
    this.showErrorMsg(error);
  }
 }
 onChangeCompany(){
  try {
    this.loadBranchOfficeUnit();
    this.loadProject();
  } catch (error) {
    
  }
}
private loadBranchOfficeUnit() {
  let elementCode = '';
  elementCode = FixedIDs.orgType.Branch.toString();
  elementCode += ',' + FixedIDs.orgType.Office.toString();
  elementCode += ',' + FixedIDs.orgType.Unit.toString();
  const orgID = this.modelSvc.debitPaymentVoucherModel.companyID;
  this.orgService.getOrgStructure(elementCode, orgID.toString()).subscribe({
    next: (res: any) => {
      this.modelSvc.prepareOrgList(res);

      //if(this.modelSvc.debitPaymentVoucherModel.orgID){
        this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.bankNatureTransactionCode);
      //}
    },
    error: (res: any) => {
      this.showErrorMsg(res);
    },
  });
}

getChequeLeafNo(){
  try {
    this.coreAccService.getChequeLeafNo().subscribe({
      next: (res: any) => {
        let data = res || [];
        this.modelSvc.chequeLeafNoList = data;
        this.modelSvc.tempChequeLeafNoList = data;
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
      complete: () => { },
    });
  } catch (error) {
    this.showErrorMsg(error);
  }
 }

prepareChequeLeafNo(){
  try {
    this.modelSvc.chequeLeafNoList = [];

    const dto = this.modelSvc.debitPaymentVoucherModel;
    const { companyID, orgID, projectID, fromCOAStructID } = dto;

    if (companyID) {
      // let filteredList = this.modelSvc.tempChequeLeafNoList.filter(item => {
      //   return item.companyID === companyID &&
      //     (orgID == null || item.orgID === orgID) &&
      //     (projectID == null || item.projectID === projectID) &&
      //     (item.cOAStructureID === fromCOAStructID);
      // });

      let filteredList = this.modelSvc.tempChequeLeafNoList.filter(item => {
        if(!this.modelSvc.isBranchModuleActive)
        {
          return item.companyID === companyID &&
          item.orgID == companyID &&
          (item.cOAStructureID) === (fromCOAStructID);
        }
        else
        {
          return item.companyID === companyID &&
          ((orgID == null && item.orgID == null) || (orgID != null && item.orgID === orgID)) &&
          ((projectID == null && item.projectID == null) || (projectID != null && item.projectID === projectID)) &&
          (item.cOAStructureID) === (fromCOAStructID);
        }
      });

      this.modelSvc.chequeLeafNoList = filteredList;
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
 }

loadVoucherToEdit(){
  try {    
    this.modelSvc.isEdit=true;
    this.modelSvc.isSingleBankEditMode=true;
    if(!this.voucherModel.isMultiEntry && this.voucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherBank.code){   
      this.modelSvc.tempVoucherModel= JSON.stringify(GlobalMethods.deepClone(this.voucherModel));
      this.setDataModel(this.voucherModel);
      setTimeout(() => {
        this.loadBranchOfficeUnit();
        this.loadProject();
      }, 50);
    }     
  } catch (error) {
    this.showErrorMsg(error);
  }
 }

 loadProject(){
  try {
    this.coreAccService.getProject(this.modelSvc.debitPaymentVoucherModel.companyID).subscribe({
      next: (res: any) => {
        this.modelSvc.projectList = res|| []; 
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  } catch (error) {
    this.showErrorMsg(error);
  }
}
 setDataModel(data){
  try {
      this.modelSvc.prepareDataForEdit(data);  

     setTimeout(()=>{
      this.getLedgerBalance('from',this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.fromCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID);
      this.getLedgerBalance('to',this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.toCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID);
      this.getLedgerBalance('to',this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.toCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,this.modelSvc.debitPaymentVoucherModel.toSubLedgerDetailID,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID);
     },0);
      this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.bankNatureTransactionCode);
      this.modelSvc.filterSubLedgerDetail(this.modelSvc.debitPaymentVoucherModel);

    } catch (error) {
    this.showErrorMsg(error);
  }
 }

 onSelectProject(item) {
  try {
    this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.bankNatureTransactionCode);
   
    let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
    let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);

    if(!fromCoaList.length || !toCoaList.length){
       if(this.singleVoucherBankForm)
         this.markFormAsPristine(this.singleVoucherBankForm);

       if(!fromCoaList.length && !toCoaList.length)
           this.showMsg("2270");
    
       if(!fromCoaList.length && toCoaList.length)
         this.showMsg("2268");

       if(fromCoaList.length && !toCoaList.length)
         this.showMsg("2269");
    }

    setTimeout(() => {
      item.toAccountBalance=0;
      item.toSubLedgerTypeID=null;
      item.toSubledgerBalance=0;
      item.toSubLedgerDetailID=null;
      item.toCOAStructID=null;

      item.fromCoaStructBalance=0;
      item.fromSubLedgerDetailID=null;
      item.fromSubLedgerTypeID=null;
      item.fromSubLedgerBalance=0;
      item.fromCOAStructID=null;
      item.voucherAttachmentList=[];
    }, 0);
  
    this.modelSvc.debitPaymentVoucherModel.fromCOAStructID = null;
    this.prepareChequeLeafNo();
  } catch (error) {
    this.showErrorMsg(error);
  }
}

getLedgerBalance(type:any,voucherModel:any,cOAStructureID: number, companyID: number, subLedgerDetailID?: number, orgID?: number, projectID?: number) {
  try {      
    this.coreAccService
      .getLedgerBalance(cOAStructureID,companyID,subLedgerDetailID,orgID,projectID)
      .subscribe({
        next: (res: any) => {
          const balance = res || [];    
          //get sub-ledger balance
          if(type=='from'){
            voucherModel.fromCoaStructBalance=balance.length?balance[0].balance:0;  
          }
          else
          {
              if(cOAStructureID && subLedgerDetailID){
                voucherModel.toSubledgerBalance=balance.length?balance[0].balance:0;  
              }else{
                voucherModel.toAccountBalance=balance.length?balance[0].balance:0;  
              }
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
  } catch (e) {
    this.showErrorMsg(e);
  }
}

onSelectOrg(item) {
  try {   
    item.voucherItemList=[];
      if(item.orgID) {
        this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.bankNatureTransactionCode);
    
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
        if(!fromCoaList.length || !toCoaList.length)
        {
            
        this.modelSvc.debitPaymentVoucherModel.creditVal=null;
        this.modelSvc.debitPaymentVoucherModel.debitVal=null;
        this.modelSvc.debitPaymentVoucherModel.description=null;
        this.modelSvc.debitPaymentVoucherModel.invoiceBillRefNo=null;
        this.modelSvc.debitPaymentVoucherModel.budget=null;
        this.modelSvc.debitPaymentVoucherModel.transactionID=null;
        this.modelSvc.debitPaymentVoucherModel.chequeNo=null;
        this.modelSvc.debitPaymentVoucherModel.chequeDate=null;
        this.modelSvc.debitPaymentVoucherModel.clearedOnDate=null;
        this.modelSvc.debitPaymentVoucherModel.remarks=null;

        if(this.singleVoucherBankForm)
        this.markFormAsPristine(this.singleVoucherBankForm);

        if(!fromCoaList.length && !toCoaList.length)
          this.showMsg("2270");
   
        if(!fromCoaList.length && toCoaList.length)
          this.showMsg("2268");

        if(fromCoaList.length && !toCoaList.length)
          this.showMsg("2269");
      }
    }
    this.modelSvc.debitPaymentVoucherModel.fromCOAStructID=null;
    this.modelSvc.debitPaymentVoucherModel.fromCoaStructBalance=null;
    this.modelSvc.debitPaymentVoucherModel.toCOAStructID=null;
    this.modelSvc.debitPaymentVoucherModel.toSubLedgerDetailID=null;
    this.modelSvc.debitPaymentVoucherModel.toSubLedgerTypeID=null;
    this.modelSvc.debitPaymentVoucherModel.toSubledgerBalance=null;
    this.modelSvc.debitPaymentVoucherModel.toAccountBalance=null;

    if(this.modelSvc.isBranchModuleActive)
      this.isInValidBranch= this.modelSvc.debitPaymentVoucherModel.orgID?false:true;

    this.prepareChequeLeafNo();
  } catch (error) {
    this.showErrorMsg(error);
  }
}

markFormAsPristine(form: NgForm): void {
  Object.keys(form.controls).forEach(controlName => {
    const control = form.controls[controlName];
    control.markAsPristine();
    control.markAsUntouched();
  });
}

//load data end-- Common data
private getFileUploadOption() {
  try {
    this.fileUploadOption = new FileUploadOption();
    this.fileUploadOption.folderName = Config.imageFolders.voucher;
    this.fileUploadOption.uploadServiceUrl = "File/UploadFiles";
    this.fileUploadOption.fileTick = GlobalMethods.timeTick();
    this.fileUploadOption.acceptedFiles = ".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xlsx";
    this.fileUploadOption.isMultipleUpload = true;
    this.fileUploadOption.isMultipleSelection = true;
  } catch (error) {
    this.showErrorMsg(error);    
  }
}

onFormResetFormSingle() {
  try {
    this.isSubmitted=false;     
     
    if(this.modelSvc.tempVoucherModel){
      let data=JSON.parse(this.modelSvc.tempVoucherModel);
      if (data.id) {
        this.modelSvc.resetFormSingleBank();
        this.setDataModel(data);
       
        setTimeout(()=>{
            this.modelSvc.singleVoucherBankForm.markAsPristine();
        },20);

      }  
    }else{
      this.modelSvc.resetFormSingleBank();
      this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.bankNatureTransactionCode); 
 
      this.formResetByDefaultValue(this.modelSvc.singleVoucherBankForm, this.modelSvc.debitPaymentVoucherModel);
    
      setTimeout(()=>{
        this.modelSvc.debitPaymentVoucherModel.company = GlobalConstants.userInfo.company;
        this.modelSvc.debitPaymentVoucherModel.companyID = GlobalConstants.userInfo.companyID;
        this.modelSvc.setSingleORG();
      },15);    
    }
    setTimeout(()=>{
      this.modelSvc.setVoucherNotificationConfig(this.modelSvc.voucherNotificationData);
    },5);  
  } catch (error) {
    this.showErrorMsg(error);
  }
}


singleSaveBank(singleVoucherBankForm: NgForm) {
  try {
    if (!singleVoucherBankForm.valid) {
      this.directive.validateAllFormFields(
        singleVoucherBankForm.form as UntypedFormGroup
      );
    const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
    if (objBrnchPjctInValid) {  
      this.isInValidBranch=true;
      this.showMsg('2281');    
    }
      return;
    }

    if (!this.modelSvc.checkValidityOfToAccountSubLedger()) {
      this.showMsg("2243");
      return;
    }

    if (!this.modelSvc.checkValidityOfNoSubLedgerButSameFromAndToAccount()) {
      this.showMsg("2244");
      return;
    }

    this.modelSvc.prepareDataForSingleEntry();
    
    this.checkEntryValidityToSave();
  } catch (error) {
    this.showErrorMsg(error);
  }
} 

checkEntryValidityToSave() {
  try {
    const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
    if (objBrnchPjctInValid) {  
      this.isInValidBranch=true;
      this.showMsg('2281');
      return;
    }else{
      this.isInValidBranch=false;
    }

    const objValidity = this.modelSvc.checkEntryEditValidity();
    if (objValidity.isInvalid) {
      this.showMsg(objValidity.message);
      return;
    }
    this.finalSave();    
  } catch (error) {
    this.showErrorMsg(error);
  }
}

finalSave() {
  try {
    
    let messageCode = this.messageCode.saveCode;
    this.isSubmitted = true;
    this.modelSvc.setTempVoucher(this.modelSvc.debitPaymentVoucherModel);

    this.dataSvc.save(this.modelSvc.debitPaymentVoucherModel).subscribe({
      next: (res: any) => {
        this.showMsg(messageCode);
        this.modelSvc.prepareDataAfterSave(res.body);

        if(this.singleVoucherBankForm)
          this.modelSvc.singleVoucherBankForm.markAsPristine();

        if(this.modelSvc.sendSMS){
          this.modelSvc.prepareAndSendSMS();
        }

        this.modelSvc.isSingleBankEditMode=false;
        this.dataEmitToParent.emit(this.modelSvc.debitPaymentVoucherModel);
      },
      error: (res: any) => {
        this.showErrorMsg(res);
        this.isSubmitted = false;
      },
      complete: () => {},
    });
  } catch (error) {
    this.showErrorMsg(error);
  }
}

addNew() {
  try {
    this.getChequeLeafNo();
    this.modelSvc.tempVoucherModel=null;
    this.modelSvc.initiate();    
    //this.modelSvc.setSingleORG();
    this.modelSvc.debitPaymentVoucherModel.isMultiEntry=this.modelSvc.isMultiEntry;
    this.isSubmitted = false;
    this.modelSvc.isEdit=false;
    //this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.bankNatureTransactionCode)
    this.loadBranchOfficeUnit();
    this.loadProject();
    this.modelSvc.sendSMS=false;
    this.dataEmitToParent.emit({changeTitle:true});

    setTimeout(()=>{
      this.modelSvc.singleVoucherBankForm.markAsPristine();
    },0);  
    setTimeout(()=>{
      this.modelSvc.setVoucherNotificationConfig(this.modelSvc.voucherNotificationData);
    },1);  
  } catch (error) {
    this.showErrorMsg(error);    
  }
}

fileUploadSingleEntryModal() {
  try {
    const modalConfig = new ModalConfig();
    modalConfig.header = this.fieldTitle["fileupload"];
    modalConfig.closable = false;

    modalConfig.data = {
      uploadOption: this.fileUploadOption,
      targetObjectList: this.modelSvc.debitPaymentVoucherModel
        .voucherAttachmentList,
    };

    this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.modelSvc.singleVoucherCashForm.markAsDirty();
      }
    });
  } catch (e) {
    this.showErrorMsg(e);
  }
}

fileUploadMultiEntryModal(item: VoucherItemModel) {
  try {
    const modalConfig = new ModalConfig();
    modalConfig.header = this.fieldTitle["fileupload"];
    modalConfig.closable = false;

    modalConfig.data = {
      uploadOption: item.imageFileUploadOpton,
      targetObjectList: item.voucherItemAttachmentList,
    };

    this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.modelSvc.singleVoucherCashForm.markAsDirty();
      }
    });
  } catch (e) {
    this.showErrorMsg(e);
  }
}

onDebitFieldChange(entity: any) {
  try {
    this.modelSvc.onDebitFieldChange(entity);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onCreditFieldChange(entity: any) {
  try {
    this.modelSvc.onCreditFieldChange(entity);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectFromAccountSubLedger(entity: any) {
  try {
    setTimeout(() => {
      if (this.modelSvc.checkSubLedgerFromAccount(entity)) {
        this.showMsg("2242");
      }

      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.fromSubLedgerID = null;
        this.showMsg("2248");
        return;
      }

      this.modelSvc.setSubLedgerFromAccount(entity);
      
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccountSubLedger(entity) {
  try {    
    setTimeout(() => {
      if (this.modelSvc.checkSubLedgerToAccount(entity)) {
        this.showMsg("2242");
      }

      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.toSubLedgerDetailID = null;
        this.showMsg("2248");
        return;
      }

      if(entity.toCOAStructID && entity.toSubLedgerDetailID)
        {
        this.coreAccService.getLedgerBalance(entity.toCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,entity.toSubLedgerDetailID,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID).subscribe({
          next: (res: any) => {
            const ToAccountSubLedgerBalance = res || [];    
            this.modelSvc.setSubLedgerToAccount(entity,ToAccountSubLedgerBalance.length?ToAccountSubLedgerBalance[0].balance:0);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });        
      }else{
        this.modelSvc.setSubLedgerToAccount(entity,0);
      }
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectFromAccount(item) {
  try {
    this.prepareChequeLeafNo();
    if(item.fromCOAStructID){
    this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,item.companyID,null,item.orgID,item.projectID).subscribe({
      next: (res: any) => {
        const fromAccountBalance = res || []; 
        this.modelSvc.onSelectFromAccount(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
        this.modelSvc.debitPaymentVoucherModel.fromSubLedgerBalance=0;
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
    }
    else{
      this.modelSvc.onSelectFromAccount(item,0);
      this.modelSvc.debitPaymentVoucherModel.fromSubLedgerBalance=0;
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccount(item) {
  try {    
    item.toSubLedgerTypeID=this.modelSvc.debitPaymentVoucherModel.toCoaStructureList.find(x=>x.id==item.toCOAStructID)?.subLedgerTypeID;
    
    this.modelSvc.filterSubLedgerDetail(item);

    if(item.toCOAStructID){
        this.coreAccService.getLedgerBalance(item.toCOAStructID||0,item.companyID,null,item.orgID,item.projectID)
      .subscribe({
        next: (res: any) => {
          const toAccountBalance = res || []; 
          this.modelSvc.onSelectToAccount(item,toAccountBalance.length?toAccountBalance[0].balance:0);
          item.toSubledgerBalance=0;
          item.toSubLedgerDetailID=null;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    }else{
      this.modelSvc.onSelectToAccount(item,0);
      item.toSubledgerBalance=0;
      item.toSubLedgerDetailID=null;
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToPrject(item){
 try {
  this.coreAccService
  .getCOAStructure(item.orgID, item.projectID)
  .subscribe({
    next: (res: any) => {
      this.modelSvc.coaStructureList = res || [];   
      this.modelSvc.resetSingleVoucherItem(item);      
    },
    error: (res: any) => {
      this.showErrorMsg(res);
    },
  });
 } catch (error) {
  this.showErrorMsg(error);
 }
}

onSelectTransactionMode(entity){
  try {
    this.modelSvc.setTransactionNoList(entity);
    if(entity.tranModeCd!=this.transactionModeCheque){
      entity.chequeNo=null;
      entity.chequeDate=null;
      entity.clearedOnDate=null;
   }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectTransactionNo(entity){
  try {
    this.modelSvc.setTransactionInfo(entity);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

//Print
printVoucher(voucherID:number) {
  try {
    this.coreAccService.printVoucher(FixedIDs.voucherType.DebitVoucher.code, voucherID);    
  } catch (error) {
    this.showErrorMsg(error);
  }
}
}
