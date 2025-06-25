import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { VoucherItemModel } from 'src/app/accounting/models/voucher/voucher-item.model';
import { MultiVoucherBankValidation } from 'src/app/accounting/models/voucher/voucher.model';
import { CreditReceiptVoucherDataService, CreditReceiptVoucherModelService,FileUploadComponent } from '../../../index'
import { BaseComponent, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods, GridOption, ProviderService, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { ColumnType, FileOption, ModalConfig, QueryData } from 'src/app/shared/models/common.model';
import { forkJoin} from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-credit-receipt-voucher-entry-multi-bank',
  templateUrl: './credit-receipt-voucher-entry-multi-bank.component.html',
  providers:[CreditReceiptVoucherDataService,CreditReceiptVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class CreditReceiptVoucherEntryMultiBankComponent  extends BaseComponent
implements OnInit,AfterViewInit {
@Input() voucherModel: any;
isSubmitted: boolean = false;
projectOfficeBranch:string='';
companyName:string='';
spData: any = new QueryData();
@Output() dataEmitToParent = new EventEmitter<any>();
ref: DynamicDialogRef;
public multiBankValidationMsgObj: ValidatingObjectFormat;
@ViewChild(ValidatorDirective) directive;
loginUserID: number = GlobalConstants.userInfo.userPKID;

//Multi Bank
@ViewChild("multiVoucherBankForm", { static: true, read: NgForm })
multiVoucherBankForm: NgForm;
gridOptionBank: GridOption;

fileUploadOption: FileUploadOption;
bankNatureTransactionCode: any;
transactionModeCheque:any;
isInValidBranch:boolean=false;
constructor(
  protected providerSvc: ProviderService,
  private dataSvc: CreditReceiptVoucherDataService,
  public modelSvc: CreditReceiptVoucherModelService,
  public coreAccService:CoreAccountingService,
  public orgService: OrgService,
  public dialogService: DialogService
) {
  super(providerSvc);
  this.multiBankValidationMsgObj = MultiVoucherBankValidation();
}

ngOnInit() {
  try {    
    this.setBranchProjectConfig(); 
    this.bankNatureTransactionCode=FixedIDs.transactionNatureCd.bankNature.code;  
    this.transactionModeCheque=FixedIDs.TransactionMode.Cheque; 

    setTimeout(()=>{
      this.loadOtherData();     
    },10);
    this.modelSvc.initiate();
    this.initGridOptionBank();      
    } catch (error) {
    this.showErrorMsg(error);
  }

}

ngAfterViewInit() {
  try {
    this.modelSvc.multiVoucherBankForm = this.multiVoucherBankForm.form;
  } catch (e) {
    this.showErrorMsg(e);
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
    const orgID = this.modelSvc.creditReceiptVoucherModel.companyID;
    this.orgService.getOrgStructure(elementCode, orgID.toString()).subscribe({
      next: (res: any) => {
        this.modelSvc.prepareOrgList(res);

        if(this.modelSvc.creditReceiptVoucherModel.id==0){
          this.modelSvc.creditReceiptVoucherModel.voucherItemList=[];
          this.modelSvc.addNewItem(this.bankNatureTransactionCode);  
        }
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }
 
  loadProject(){
    try {
      this.coreAccService.getProject(this.modelSvc.creditReceiptVoucherModel.companyID).subscribe({
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
          this.modelSvc.coaStructureList=res[2] || [];
           
          //END
         this.modelSvc.subLedgerDetailList=res[3] || [];   

         if(this.voucherModel){
          this.modelSvc.isMultiBankEditMode=true;
          this.loadVoucherToEdit();
        }else{
          this.modelSvc.addNewItem(this.bankNatureTransactionCode);  
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

loadVoucherToEdit(){
  try {
       
        if(this.voucherModel.id){
          this.modelSvc.isEdit=true;
          if(this.voucherModel.isMultiEntry && this.voucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherBank.code){          
            this.modelSvc.tempVoucherModel=JSON.stringify(GlobalMethods.deepClone(this.voucherModel));
            this.setDataModel(this.voucherModel);
            setTimeout(() => {
              this.loadBranchOfficeUnit();
              this.loadProject();
            }, 50);
          }
        }
  } catch (error) {
    this.showErrorMsg(error);
  }
 }

 setDataModel(data){
  try {
    this.modelSvc.prepareDataForEdit(data);         
    
   
    this.modelSvc.creditReceiptVoucherModel.voucherItemList.forEach((item)=>{
        this.getLedgerBalance('to',item,item.toCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
        //this.getLedgerBalance('to',item,item.toCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,item.toSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
        
        this.getLedgerBalance('from',item,item.fromCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
        this.getLedgerBalance('from',item,item.fromCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,item.fromSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
        
    });       
   
    setTimeout(()=>{
    this.modelSvc.creditReceiptVoucherModel.voucherItemList.forEach((item)=>{    
    this.modelSvc.filterCOAStructure(item,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.bankNatureTransactionCode);    
    this.modelSvc.filterSubLedgerDetail(item);
    });  

    this.modelSvc.processBalances();
    },0);

    this.modelSvc.totalSumCredit();
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
            if(cOAStructureID && subLedgerDetailID){
              voucherModel.fromSubLedgerBalance=balance.length?balance[0].balance:0;  
            }else{
              voucherModel.fromCoaStructBalance=balance.length?balance[0].balance:0;  
            }
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
        this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.bankNatureTransactionCode);
    
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
      if(!fromCoaList.length || !toCoaList.length){

        this.modelSvc.creditReceiptVoucherModel.fromCOAStructID=null;
        this.modelSvc.creditReceiptVoucherModel.fromCoaStructBalance=null;
        this.modelSvc.creditReceiptVoucherModel.toCOAStructID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubLedgerDetailID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubLedgerTypeID=null;
        this.modelSvc.creditReceiptVoucherModel.toSubledgerBalance=null;
        this.modelSvc.creditReceiptVoucherModel.toAccountBalance=null;
        this.modelSvc.creditReceiptVoucherModel.creditVal=null;
        this.modelSvc.creditReceiptVoucherModel.debitVal=null;
        this.modelSvc.creditReceiptVoucherModel.description=null;
        this.modelSvc.creditReceiptVoucherModel.invoiceBillRefNo=null;
        this.modelSvc.creditReceiptVoucherModel.budget=null;
        this.modelSvc.creditReceiptVoucherModel.transactionID=null;
        this.modelSvc.creditReceiptVoucherModel.chequeNo=null;
        this.modelSvc.creditReceiptVoucherModel.chequeDate=null;
        this.modelSvc.creditReceiptVoucherModel.clearedOnDate=null;
        this.modelSvc.creditReceiptVoucherModel.remarks=null;
    
        if(this.multiVoucherBankForm)
          this.markFormAsPristine(this.multiVoucherBankForm);

        if(!fromCoaList.length && !toCoaList.length)
          this.showMsg("2270");
   
        if(!fromCoaList.length && toCoaList.length)
          this.showMsg("2268");

        if(fromCoaList.length && !toCoaList.length)
          this.showMsg("2269");

      }else{
        this.addNewItem();
      }
    }else{
      this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.bankNatureTransactionCode);
      this.addNewItem();
    }
    this.modelSvc.totalSumCredit();
    if(this.modelSvc.isBranchModuleActive)
      this.isInValidBranch= this.modelSvc.creditReceiptVoucherModel.orgID?false:true;
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

markFormAsDirty(form: NgForm): void {
  Object.keys(form.controls).forEach(controlName => {
    const control = form.controls[controlName];
    control.markAsDirty();
  });
}

initGridOptionBank() {
  try {
    const gridObj = {
      title: "",
      dataSource: "modelSvc.creditReceiptVoucherModel.voucherItemList",
      columns: this.gridColumnsBank(),
      paginator: false,
      isGlobalSearch: false,
      exportOption: {
        exportInPDF: false,
        exportInXL: false,
        title: "",
      } as FileOption,
    } as GridOption;
    this.gridOptionBank = new GridOption(this, gridObj);
  } catch (e) {
    this.showErrorMsg(e);
  }
}

gridColumnsBank(): ColumnType[] {
  try {
    let columns= [      
      { field: "fromCOAStructID",header: this.fieldTitle["fromaccountname"],isRequired:true },
      { field: "fromCoaStructBalance", header: this.fieldTitle["balance"] },    
      { field: "fromSubLedgerDetailID", header: this.fieldTitle["subledger"] },  
      { field: "debitVal", header: this.fieldTitle["amount"],isRequired:true },      
      { field: "toCOAStructID",header: this.fieldTitle["toaccountname"],isRequired:true },
      { field: "toAccountBalance", header: this.fieldTitle["balance"] },    
      { field: "tranModeCd", header: this.fieldTitle["transactionmode"] },
      { field: "transectionID", header: this.fieldTitle["chequeno"] },
      { field: "chequeDate", header: this.fieldTitle["chequedate"] },
      { field: "description", header: this.fieldTitle["description"] },      
      { field: "invoiceBillRefNo", header: this.fieldTitle["invoice/billrefno."] }, 
      { field: "", header: this.fieldTitle["ref.doc"], styleClass:"d-center"},  
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
            this.modelSvc.singleVoucherCashForm.markAsPristine();
        },20);
        }  
      }else{
        this.modelSvc.resetFormMultipleBank();
        this.addNewItem();
        this.modelSvc.totalCredit=0;
        setTimeout(()=>{
          this.modelSvc.creditReceiptVoucherModel.company = GlobalConstants.userInfo.company;
          this.modelSvc.creditReceiptVoucherModel.companyID = GlobalConstants.userInfo.companyID;
          this.modelSvc.creditReceiptVoucherModel.voucherDate = new Date();;
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


multiSaveBank(multiVoucherBankForm: NgForm) {
  try {
    if (!multiVoucherBankForm.valid) {
      this.directive.validateAllFormFields(
        multiVoucherBankForm.form as UntypedFormGroup
      );
      const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
      if (objBrnchPjctInValid) {  
        this.isInValidBranch=true;
        this.showMsg('2281');  
      }
      return;
    }
    if (!this.modelSvc.creditReceiptVoucherModel.voucherItemList.length) {
      this.showMsg("2247");
      return;
    }

    if (this.modelSvc.checkValidityForDuplicateMultiEntryBank()) {
      this.showMsg("2248");
      return;
    }

    let validityCheck = this.modelSvc.checkDataValidityForMultiEntryBank();

    if (validityCheck.isInvalid) {
      if (validityCheck.isInvalidCaseOne) {
        this.showMsg("2249");
      }
      if (validityCheck.isInvalidCaseThree) {
        this.showMsg("2251");
      }
      if (validityCheck.isInvalidCaseFour) {
        this.showMsg("2252");
      }
      return;
    }
    this.modelSvc.prepareDataForMultiEntryBank();
    
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
    this.modelSvc.setTempVoucher(this.modelSvc.creditReceiptVoucherModel);
    this.dataSvc.save(this.modelSvc.creditReceiptVoucherModel).subscribe({
      next: (res: any) => {
        this.showMsg(messageCode);
        this.modelSvc.prepareDataAfterSave(res.body);
       

        if(this.multiVoucherBankForm)
          this.markFormAsPristine(this.multiVoucherBankForm);

        if(this.modelSvc.sendSMS){
          this.modelSvc.prepareAndSendSMS();
        }

        this.modelSvc.isMultiBankEditMode=false;
        this.dataEmitToParent.emit(null);
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
  this.modelSvc.tempVoucherModel=null;
  this.modelSvc.initiate();
  //this.modelSvc.setSingleORG();
  this.modelSvc.creditReceiptVoucherModel.isMultiEntry=this.modelSvc.isMultiEntry;
  this.isSubmitted = false;
  this.modelSvc.isEdit=false;
  //this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.bankNatureTransactionCode)
  //this.modelSvc.addNewItem(this.bankNatureTransactionCode);
  this.loadBranchOfficeUnit();
  this.loadProject();
  this.modelSvc.sendSMS=false;
  this.modelSvc.totalCredit=0;
  this.dataEmitToParent.emit({changeTitle:true});
  setTimeout(()=>{   
    this.modelSvc.multiVoucherBankForm.markAsPristine();    
},0);
setTimeout(()=>{
  this.modelSvc.setVoucherNotificationConfig(this.modelSvc.voucherNotificationData);
 
},1);  
}

addNewItem() {
  try {
    if(this.modelSvc.chaeckFromAccountToAccountOnAddNewItem()){ 
      this.showMsg("2271");
      return;
    }
    this.modelSvc.addNewItem(this.bankNatureTransactionCode);  
  } catch (error) {
    this.showErrorMsg(error);
  }
}

removeVoucherItem(item: any) {
  try {
    if(this.modelSvc.creditReceiptVoucherModel.voucherItemList.length>1){
      this.modelSvc.removeItem(item);
    }else{
      this.showMsg("2273");
    }
    this.modelSvc.totalSumCredit();
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
        this.modelSvc.multiVoucherBankForm.markAsDirty();
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
    this.modelSvc.totalSumCredit();
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectFromAccountSubLedgerMulti(entity: any) {
  try {
    setTimeout(() => {
      if (this.modelSvc.checkValidityForDuplicateMultiEntryBank()) {
        entity.fromSubLedgerDetailID = null;
        this.showMsg("2259");
        return;
      }
      
      if(entity.fromCOAStructID && entity.fromSubLedgerDetailID){
        this.coreAccService.getLedgerBalance(entity.fromCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,entity.fromSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
          next: (res: any) => {
            const toAccountSubLedgerBalance = res || [];     
            this.modelSvc.setSubLedgerFromAccountMulti(entity,toAccountSubLedgerBalance.length?toAccountSubLedgerBalance[0].balance:0);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });       
        }else{
          this.modelSvc.setSubLedgerFromAccountMulti(entity,0);
        }

      
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}
onSelectToAccountSubLedgerMulti(entity: any) {
  try {
    setTimeout(() => {     
      if (this.modelSvc.checkValidityForDuplicateMultiEntryBank()) {
        entity.toSubLedgerDetailID = null;
        this.showMsg("2259");
        return;
      }
      if(entity.toCOAStructID && entity.toSubLedgerDetailID){
        this.coreAccService.getLedgerBalance(entity.toCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,entity.toSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
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


onSelectFromAccount(item) {
  try {
    item.fromSubLedgerTypeID=this.modelSvc.coaStructureList.find(x=>x.id==item.fromCOAStructID)?.subLedgerTypeID;
    if(item.fromCOAStructID){
    this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
      next: (res: any) => {
        const fromAccountBalance = res || []; 
        this.modelSvc.onSelectFromAccount(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
        item.fromSubLedgerBalance=0;
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });}else{
      this.modelSvc.onSelectFromAccount(item,0);
      item.fromSubLedgerBalance=0;
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectFromAccountMulti(item) {
  try {
    setTimeout(()=>{
    if (this.modelSvc.checkValidityForDuplicateMultiEntryBank()) {
      item.fromCOAStructID = null;
      this.showMsg("2248");
      return;
    } 
     item.fromSubLedgerTypeID=item.fromCoaStructureList.find(x=>x.id==item.fromCOAStructID)?.subLedgerTypeID;
      this.modelSvc.filterSubLedgerDetail(item);
      if(item.fromCOAStructID){
        this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID)
      .subscribe({
        next: (res: any) => {       
          const fromAccountBalance = res || []; 

          this.modelSvc.onSelectFromAccountMulti(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
          item.fromSubLedgerBalance=0;
          item.fromSubLedgerDetailID=null;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });  
    }else{
      this.modelSvc.onSelectFromAccountMulti(item,0);
    }   item.fromSubLedgerBalance=0;
        item.fromSubLedgerDetailID=null;

   },0)
  
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccountMulti(item) {
  try {
    setTimeout(() => {
      if (this.modelSvc.checkValidityForDuplicateMultiEntryBank()) {
        item.toCOAStructID = null;
        this.showMsg("2259");
        return;
      }
  
      // item.toSubLedgerTypeID=item.toCoaStructureList.find(x=>x.id==item.toCOAStructID)?.subLedgerTypeID;  
      // this.modelSvc.filterSubLedgerDetail(item);
      if(item.toCOAStructID){
      this.coreAccService.getLedgerBalance(item.toCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID)
        .subscribe({
          next: (res: any) => {  
              const toAccountBalance = res || [];   
              this.modelSvc.onSelectToAccountMulti(item,toAccountBalance.length?toAccountBalance[0].balance:0);
              item.toSubledgerBalance=0;
              //item.toSubLedgerDetailID=null;
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
      }
        else{
          this.modelSvc.onSelectToAccountMulti(item,0);
          item.toSubledgerBalance=0;
          //item.toSubLedgerDetailID=null;
        }
    }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToPrjectMulti(item){
  try {

      item.voucherItemList = [];   
      this.modelSvc.filterCOAStructure(item,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.bankNatureTransactionCode);
          
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
          if(!fromCoaList.length || !toCoaList.length){
            setTimeout(()=>{
              if(this.multiVoucherBankForm)
                this.markFormAsPristine(this.multiVoucherBankForm);
            },10);
            
            if(!fromCoaList.length && !toCoaList.length)
              this.showMsg("2270");
       
            if(!fromCoaList.length && toCoaList.length)
              this.showMsg("2268");
    
            if(fromCoaList.length && !toCoaList.length)
              this.showMsg("2269");

            this.addNewItem(); 
          } else{
            this.addNewItem();
          }
          this.modelSvc.totalSumCredit();
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
          item.invoiceBillRefNo=null;  
          if(item?.voucherItemAttachmentList)
            item.voucherItemAttachmentList=[];
     
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
    this.coreAccService.printVoucher(FixedIDs.voucherType.CreditVoucher.code, voucherID);
  } catch (e) {
    throw e;
  }
}
}