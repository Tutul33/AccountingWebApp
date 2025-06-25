import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import {
  BaseComponent,
  Config,
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
  GridOption,
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
  multiCashVoucherValidation,
} from "src/app/accounting/models/voucher/voucher.model";
import {
  ColumnType,
  FileOption,
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
  selector: 'app-debit-payment-voucher-entry-multi-cash',
  templateUrl: './debit-payment-voucher-entry-multi-cash.component.html',
  providers:[DebitPaymentVoucherDataService,DebitPaymentVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class DebitPaymentVoucherEntryMultiCashComponent  extends BaseComponent
implements OnInit,AfterViewInit {
@Input() voucherModel: any;
isSubmitted: boolean = false;
projectOfficeBranch:string='';
companyName:string='';
spData: any = new QueryData();
@Output() dataEmitToParent = new EventEmitter<any>();
ref: DynamicDialogRef;
public multiCashValidationMsgObj: ValidatingObjectFormat;
@ViewChild(ValidatorDirective) directive;
loginUserID: number = GlobalConstants.userInfo.userPKID;

//Multi Cash
@ViewChild("multiVoucherCashForm", { static: true, read: NgForm })
multiVoucherCashForm: NgForm;
gridOptionCash: GridOption;

fileUploadOption: FileUploadOption;
cashNatureTransactionCode: any;
//bankNatureTransactionCode: any;
isInValidBranch:boolean=false;
constructor(
  protected providerSvc: ProviderService,
  private dataSvc: DebitPaymentVoucherDataService,
  public modelSvc: DebitPaymentVoucherModelService,
  public coreAccService:CoreAccountingService,
  public orgService: OrgService,
  public dialogService: DialogService,
) {
  super(providerSvc);
  this.multiCashValidationMsgObj = multiCashVoucherValidation();
}

ngOnInit() {
  try {
    this.setBranchProjectConfig();
    this.cashNatureTransactionCode=FixedIDs.transactionNatureCd.cashNature.code;  
    this.modelSvc.isMultiCash=true;
    setTimeout(()=>{
      this.loadOtherData();      
    },10);
    this.modelSvc.initiate();      
    this.initGridOptionCash();
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
    this.modelSvc.multiVoucherCashForm = this.multiVoucherCashForm.form;
  } catch (e) {
    this.showErrorMsg(e);
  }
}

loadOtherData(){
  try {     
    this.modelSvc.isCash=true;
    
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
       this.coreAccService.getVoucherNotification(),
       this.dataSvc.GetOrgCashConfig(),
       this.orgService.getOrgStructure(FixedIDs.orgType.Company.toString(), ''),
      ]
     ).subscribe({
         next: (res: any) => {
          this.modelSvc.prepareOrgList(res[0]);     
          this.modelSvc.projectList = res[1] || [];   
          
          //Coa Struct Start      
          this.modelSvc.coaStructureList = res[2] || [];     
          this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,null,null,this.cashNatureTransactionCode);    
             //END


         this.modelSvc.subLedgerDetailList=res[3] || [];   

         if(this.voucherModel){
          this.modelSvc.isMultiCashEditMode=true;
          this.loadVoucherToEdit();
         } else{
          this.modelSvc.addNewItem(this.cashNatureTransactionCode);
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
  
            if(res[6].length){
              this.modelSvc.setVoucherNotificationConfig(res[6]);
            }

            this.modelSvc.prepareCompanyOrgNgtvAcceptanceList(res[7]);
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
      if(this.modelSvc.debitPaymentVoucherModel.id==0){
        this.modelSvc.debitPaymentVoucherModel.voucherItemList=[];
        this.modelSvc.addNewItem(this.cashNatureTransactionCode);  
      }
    },
    error: (res: any) => {
      this.showErrorMsg(res);
    },
  });
}

loadVoucherToEdit(){
  try {
    this.modelSvc.isEdit=true;
    this.modelSvc.isMultiCashEditMode=true;
    if(this.voucherModel.isMultiEntry && this.voucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code){        
      this.modelSvc.tempVoucherModel= JSON.stringify(GlobalMethods.deepClone(this.voucherModel));
      this.setDataModel(this.voucherModel);    
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
  
    this.getLedgerBalance('from',this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.fromCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID);
    this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.cashNatureTransactionCode);
  
    this.modelSvc.debitPaymentVoucherModel.voucherItemList.forEach((item)=>{
      this.getLedgerBalance('to',item,item.toCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID);
      this.getLedgerBalance('to',item,item.toCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,item.toSubLedgerDetailID,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID);
    });   
       
      setTimeout(() => {
        this.loadBranchOfficeUnit();
        this.loadProject();

        setTimeout(()=>{
          this.modelSvc.debitPaymentVoucherModel.voucherItemList.forEach((item)=>{
            this.modelSvc.filterCOAStructure(item,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.cashNatureTransactionCode);
            this.modelSvc.filterSubLedgerDetail(item);
          });
          this.modelSvc.processBalances();
         },100);  

      }, 50);
    

   
     this.modelSvc.totalSumDebit();
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
          }else{
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
        this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.cashNatureTransactionCode);
    
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);

        if(!fromCoaList.length || !toCoaList.length){
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

        if(this.multiVoucherCashForm)
          this.markFormAsPristine(this.multiVoucherCashForm);    

        if(!fromCoaList.length && !toCoaList.length)
          this.showMsg("2270");
   
        if(!fromCoaList.length && toCoaList.length)
          this.showMsg("2268");

        if(fromCoaList.length && !toCoaList.length)
          this.showMsg("2269");
      }
       
      this.addNewItem();
      
    }else{
      this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.cashNatureTransactionCode);
     
      this.addNewItem();
    }
    this.modelSvc.debitPaymentVoucherModel.fromCOAStructID=null;
    this.modelSvc.debitPaymentVoucherModel.fromCoaStructBalance=null;
    this.modelSvc.totalSumDebit();
    if(this.modelSvc.isBranchModuleActive)
      this.isInValidBranch= this.modelSvc.debitPaymentVoucherModel.orgID?false:true;
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


initGridOptionCash() {
  try {
    const gridObj = {
      title: "",
      dataSource: "modelSvc.debitPaymentVoucherModel.voucherItemList",
      columns: this.gridColumnsCash(),
      paginator: false,
      isGlobalSearch: false,
      exportOption: {
        exportInPDF: false,
        exportInXL: false,
        title: "",
      } as FileOption,
    } as GridOption;
    this.gridOptionCash = new GridOption(this, gridObj);
  } catch (e) {
    this.showErrorMsg(e);
  }
}

gridColumnsCash(): ColumnType[] {
  try {
    let columns= [ 
      { field: "toCOAStructID",header: this.fieldTitle["toaccountname"],isRequired:true },
      { field: "toAccountBalance", header: this.fieldTitle["balance"] },
      { field: "toSubLedgerDetailID", header: this.fieldTitle["subledger"] },
      { field: "toSubledgerBalance", header: this.fieldTitle["balance"] },
      { field: "description", header: this.fieldTitle["description"] },
      { field: "budget", header: this.fieldTitle["budget"] },
      { field: "debitVal", header: this.fieldTitle["amount"] ,isRequired:true},
      { field: "invoiceBillRefNo", header: this.fieldTitle["invoice/billrefno."] },
      { field: "", header: this.fieldTitle["ref.doc"], styleClass: "d-center" },
      { field: "", header: this.fieldTitle["action"] },
    ];
    return columns;
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onFormResetFormMultiple() {
  try {
    this.isSubmitted=false; 
    if(this.modelSvc.tempVoucherModel){
      let data=JSON.parse(this.modelSvc.tempVoucherModel);
        if (data.id) {
          this.setDataModel(data);
          setTimeout(()=>{
            this.modelSvc.multiVoucherCashForm.markAsPristine();
        },20);
        }
    }else{
      this.modelSvc.resetFormMultipleCash();
      this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.cashNatureTransactionCode);
      this.addNewItem();
      this.modelSvc.totalDebit=0;
      setTimeout(()=>{
        this.modelSvc.debitPaymentVoucherModel.company = GlobalConstants.userInfo.company;
        this.modelSvc.debitPaymentVoucherModel.companyID = GlobalConstants.userInfo.companyID;
        this.modelSvc.debitPaymentVoucherModel.voucherDate = new Date();
        this.modelSvc.setSingleORG();
      },5);
    }

    setTimeout(()=>{
      this.modelSvc.setVoucherNotificationConfig(this.modelSvc.voucherNotificationData);
    },5);  
  } catch (error) {
    this.showErrorMsg(error);
  }
}

multiSaveCash(multiVoucherCashForm: NgForm) {
  try {
    if (!multiVoucherCashForm.valid) {
      this.directive.validateAllFormFields(
        multiVoucherCashForm.form as UntypedFormGroup
      );

    const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
    if (objBrnchPjctInValid) {  
      this.isInValidBranch=true;
      this.showMsg('2281');
    }
      return;
    }

    if (!this.modelSvc.debitPaymentVoucherModel.voucherItemList.length) {
      this.showMsg("2247");
      return;
    }

    if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
      this.showMsg("2248");
      return;
    }

    let validityCheck = this.modelSvc.checkDataValidityForMultiEntry();

    if (validityCheck.isInvalid) {
      if (validityCheck.isInvalidCaseOne) {
        this.showMsg("2249");
      }
      if (validityCheck.isInvalidCaseTwo) {
        this.showMsg("2250");
      }
      if (validityCheck.isInvalidCaseThree) {
        this.showMsg("2251");
      }
      if (validityCheck.isInvalidCaseFour) {
        this.showMsg("2252");
      }
      return;
    }
    this.modelSvc.prepareDataForMultiEntryCash();
   
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

    const isInValidNegAccptnce = this.modelSvc.checkCashNatureNegativeAcceptanceValidity();
    if (isInValidNegAccptnce) {
        this.showMsg('2282');
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

        if(this.multiVoucherCashForm)        
         this.modelSvc.multiVoucherCashForm.markAsPristine();
       
        if(this.modelSvc.sendSMS){
          this.modelSvc.prepareAndSendSMS();
        }
        this.modelSvc.isMultiCashEditMode=false;
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
    this.modelSvc.tempVoucherModel=null;
    this.modelSvc.initiate();    
    //this.modelSvc.setSingleORG();
    this.modelSvc.debitPaymentVoucherModel.isMultiEntry=this.modelSvc.isMultiEntry;
    this.isSubmitted = false;
    this.modelSvc.isEdit=false;
    //this.modelSvc.filterCOAStructure(this.modelSvc.debitPaymentVoucherModel,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.cashNatureTransactionCode)
    //this.modelSvc.addNewItem(this.cashNatureTransactionCode);
    this.loadBranchOfficeUnit();
    this.loadProject();
    this.modelSvc.totalDebit=0;
    this.modelSvc.sendSMS=false;
    this.dataEmitToParent.emit({changeTitle:true});
    setTimeout(()=>{   
      this.modelSvc.multiVoucherCashForm.markAsPristine();
    },0);  
    setTimeout(()=>{
      this.modelSvc.setVoucherNotificationConfig(this.modelSvc.voucherNotificationData);
    },1);  
  } catch (error) {
    this.showErrorMsg(error);
  }
}

addNewItem() {
  try {
    if(this.modelSvc.chaeckToAccountOnAddNewItem()){
      this.showMsg("Please select To Account of existing voucher items.");
      return;
    }

    this.modelSvc.addNewItem(this.cashNatureTransactionCode);    
  } catch (error) {
    this.showErrorMsg(error);
  }
}

removeVoucherItem(item: any) {
  try {
    if(this.modelSvc.debitPaymentVoucherModel.voucherItemList.length>1){
      this.modelSvc.removeItem(item);
    }else{
      this.showMsg("2273");
    }
    this.modelSvc.totalSumDebit();
  } catch (error) {
    this.showErrorMsg(error);
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
        this.modelSvc.multiVoucherCashForm.markAsDirty();
      }
    });
  } catch (e) {
    this.showErrorMsg(e);
  }
}

onDebitFieldChange(entity: any) {
  try {
    this.modelSvc.onDebitFieldChange(entity);
    this.modelSvc.totalSumDebit();
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

onSelectFromAccountSubLedgerMulti(entity: any) {
  try {
    setTimeout(() => {
      if (this.modelSvc.checkSubLedgerFromAccount(entity)) {
        this.showMsg("2242");
      }
      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.fromSubLedgerDetailID = null;
        this.showMsg("2248");
        return;
      }

      this.modelSvc.setSubLedgerFromAccountMulti(entity);      
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccountSubLedgerMulti(entity: any) {
  try {
    
    setTimeout(() => {
     
      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.toSubLedgerDetailID = null;
        this.showMsg("2259");
        return;
      }
      if(entity.toCOAStructID && entity.toSubLedgerDetailID){
        this.coreAccService.getLedgerBalance(entity.toCOAStructID,this.modelSvc.debitPaymentVoucherModel.companyID,entity.toSubLedgerDetailID,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID).subscribe({
          next: (res: any) => {
            const toAccountSubLedgerBalance = res || [];     
            this.modelSvc.setSubLedgerToAccountMulti(entity,toAccountSubLedgerBalance.length?toAccountSubLedgerBalance[0].balance:0);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });       
        }else{
          this.modelSvc.setSubLedgerToAccountMulti(entity,0);
        }
      
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
        this.coreAccService.getLedgerBalance(entity.toCOAStructID,entity.companyID,entity.toSubLedgerDetailID,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID).subscribe({
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
    if(item.fromCOAStructID){
    this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID).subscribe({
      next: (res: any) => {
        const fromAccountBalance = res || []; 
        this.modelSvc.onSelectFromAccount(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
        this.modelSvc.debitPaymentVoucherModel.fromSubLedgerBalance=0;
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }else{
    this.modelSvc.onSelectFromAccount(item,0);
    this.modelSvc.debitPaymentVoucherModel.fromSubLedgerBalance=0;
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccount(item) {
  try {
    
    item.toSubLedgerTypeID=this.modelSvc.coaStructureList.find(x=>x.id==item.toCOAStructID)?.subLedgerTypeID;
    if(item.toCOAStructID){
        this.coreAccService.getLedgerBalance(item.toCOAStructID||0,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID)
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

onSelectFromAccountMulti(item) {
  try { 
    item.fromSubLedgerTypeID=this.modelSvc.coaStructureList.find(x=>x.id==item.fromCOAStructID)?.subLedgerTypeID;

    if(item.fromCOAStructID){
      this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID)
      .subscribe({
        next: (res: any) => {       
          const fromAccountBalance = res || []; 

          this.modelSvc.onSelectFromAccountMulti(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);

          if (this.modelSvc.checkValidityForDuplicateMultiEntryBank()) {
            item.fromCOAStructID = null;
            this.showMsg("2248");
            return;
          } 

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });     
    }else{
      this.modelSvc.onSelectFromAccountMulti(item,0);
    }  
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccountMulti(item) {
  try {    
      item.toSubLedgerDetailList=[];
      item.toSubLedgerTypeID=item.toCoaStructureList.find(x=>x.id==item.toCOAStructID)?.subLedgerTypeID;
      this.modelSvc.filterSubLedgerDetail(item);
      if(!item.toSubLedgerDetailList.length){
        if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
          setTimeout(()=>{
            item.toCOAStructID = null;
          },5);
          this.showMsg("2272");
          return;
        }
      }else{
        if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
          setTimeout(()=>{
            item.toCOAStructID = null;
          },5);
          this.showMsg("2248");
          return;
        }
      }
     if(item.toCOAStructID){
      this.coreAccService.getLedgerBalance(item.toCOAStructID||0,this.modelSvc.debitPaymentVoucherModel.companyID,null,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID)
      .subscribe({
        next: (res: any) => {
            const toAccountBalance = res || []; 
            this.modelSvc.onSelectToAccountMulti(item,toAccountBalance.length?toAccountBalance[0].balance:0);
            item.toSubledgerBalance=0;
            item.toSubLedgerDetailID=null;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    }else{
      this.modelSvc.onSelectToAccountMulti(item,0);
      item.toSubledgerBalance=0;
      item.toSubLedgerDetailID=null;
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToPrjectMulti(item){
  try {

    item.voucherItemList = [];   
    this.modelSvc.filterCOAStructure(item,this.modelSvc.debitPaymentVoucherModel.orgID,this.modelSvc.debitPaymentVoucherModel.projectID,this.cashNatureTransactionCode);
        
    let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
    let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
    if(!fromCoaList.length || !toCoaList.length){
          setTimeout(()=>{
            if(this.multiVoucherCashForm)
              this.markFormAsPristine(this.multiVoucherCashForm);
          },10);

          

          if(!fromCoaList.length && !toCoaList.length)
            this.showMsg("2270");
     
          if(!fromCoaList.length && toCoaList.length)
            this.showMsg("2268");
  
          if(fromCoaList.length && !toCoaList.length)
            this.showMsg("2269");
    }         
    this.addNewItem();
    this.modelSvc.totalSumDebit();
    item.toAccountBalance=0;        
    item.toSubLedgerDetailID=null;        
    item.toSubLedgerTypeID=null;         
    item.toCOAStructID=null;         
    item.toSubledgerBalance=null;         
    item.fromCoaStructBalance=0;        
    item.fromSubLedgerDetailID=null;        
    item.fromSubLedgerTypeID=null; 
    item.fromCOAStructID=null; 
    item.description=null;
    item.invoiceBillRefNo=null
    if(item?.voucherItemAttachmentList)
      item.voucherItemAttachmentList=[];
  } catch (error) {
   this.showErrorMsg(error);
  }
 }

onSelectTransactionMode(entity){
  try {
    this.modelSvc.setTransactionNoList(entity);
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
  } catch (e) {
    throw e;
  }
}

}

