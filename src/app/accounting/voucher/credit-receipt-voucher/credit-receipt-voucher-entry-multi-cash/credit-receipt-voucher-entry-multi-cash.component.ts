import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { VoucherItemModel } from 'src/app/accounting/models/voucher/voucher-item.model';
import { multiCashVoucherValidation } from 'src/app/accounting/models/voucher/voucher.model';
import { CreditReceiptVoucherDataService, CreditReceiptVoucherModelService,FileUploadComponent } from '../../../index'
import { BaseComponent, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods, GridOption, ProviderService, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { ColumnType, FileOption, ModalConfig, QueryData } from 'src/app/shared/models/common.model';
import { forkJoin } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-credit-receipt-voucher-entry-multi-cash',
  templateUrl: './credit-receipt-voucher-entry-multi-cash.component.html',
  providers:[CreditReceiptVoucherDataService,CreditReceiptVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class CreditReceiptVoucherEntryMultiCashComponent  extends BaseComponent
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
  this.multiCashValidationMsgObj = multiCashVoucherValidation();
}

ngOnInit() {
  try {
    this.setBranchProjectConfig();
    this.cashNatureTransactionCode=FixedIDs.transactionNatureCd.cashNature.code;

    setTimeout(()=>{
      if(this.voucherModel){
        this.modelSvc.isMultiCashEditMode=true;
      }
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
onChangeCompany(){
  try {
    this.loadBranchOfficeUnit();
    this.loadProject();
  } catch (error) {
    this.showErrorMsg(error);
  }
}

loadBranchOfficeUnit(){
  try {
    let elementCode='';
    elementCode= FixedIDs.orgType.Branch.toString();
    elementCode+= ','+FixedIDs.orgType.Office.toString();
    elementCode+= ','+FixedIDs.orgType.Unit.toString(); 
    const orgID=this.modelSvc.creditReceiptVoucherModel.companyID;
    this.orgService.getOrgStructure(elementCode,orgID.toString()).subscribe({
      next: (res: any) => {
       this.modelSvc.prepareOrgList(res);   
       if(this.modelSvc.creditReceiptVoucherModel.id==0){
        this.modelSvc.creditReceiptVoucherModel.voucherItemList=[];
        this.modelSvc.addNewItem(this.cashNatureTransactionCode);  
      }
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
       this.orgService.getOrgStructure(FixedIDs.orgType.Company.toString(), ''),
      ]
     ).subscribe({
         next: (res: any) => {
          this.modelSvc.prepareOrgList(res[0]);     
          this.modelSvc.projectList = res[1] || [];   
          
          //Coa Struct Start
          this.modelSvc.coaStructureList=res[2] || [];
          // if(this.modelSvc.creditReceiptVoucherModel.orgID){
          // this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,null,this.cashNatureTransactionCode);    
          // }else{
          //   this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,null,null,this.cashNatureTransactionCode);   
          // }
          //END

         this.modelSvc.subLedgerDetailList=res[3] || [];   

         if(this.voucherModel){
          this.modelSvc.isMultiCashEditMode=true;
          this.loadVoucherToEdit();
        }else{
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
            this.modelSvc.companyList=res[7]||[];
         },
         error: (res: any) => {
           this.showErrorMsg(res);
         },
       });
      
  } catch (error) {
    this.showErrorMsg(error);
  }
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

loadVoucherToEdit(){
  try {  
        if(this.voucherModel.id){
          this.modelSvc.isEdit=true;
          if(this.voucherModel.isMultiEntry && this.voucherModel.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code){  
          this.modelSvc.tempVoucherModel=JSON.stringify(GlobalMethods.deepClone(this.voucherModel));
          this.setDataModel(this.voucherModel);         
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
         
         
         this.getLedgerBalance('from',item,item.fromCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
         this.getLedgerBalance('from',item,item.fromCOAStructID,this.modelSvc.creditReceiptVoucherModel.companyID,item.fromSubLedgerDetailID,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID);
         
       });  
       setTimeout(() => {
        this.loadBranchOfficeUnit();
        this.loadProject();
        
        setTimeout(()=>{     
          this.modelSvc.creditReceiptVoucherModel.voucherItemList.forEach((item)=>{
          this.modelSvc.filterCOAStructure(item,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);    
          this.modelSvc.filterSubLedgerDetail(item);
          });  
          this.modelSvc.processBalances();
          },0);

      }, 50);     
    

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
        this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);
    
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
        this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);
       
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

initGridOptionCash() {
  try {
    const gridObj = {
      title: "",
      dataSource: "modelSvc.creditReceiptVoucherModel.voucherItemList",
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
      { field: "fromCoaStructID",header: this.fieldTitle["fromaccountname"],isRequired:true },
      { field: "fromCoaStructBalance", header: this.fieldTitle["balance"] },
      { field: "fromSubLedgerDetailID", header: this.fieldTitle["subledger"] },
      { field: "fromSubledgerBalance", header: this.fieldTitle["balance"] },
      { field: "toCoaStructID",header: this.fieldTitle["toaccountname"],isRequired:true },
      { field: "toAccountBalance", header: this.fieldTitle["balance"] },
      { field: "description", header: this.fieldTitle["description"] },
      { field: "creditVal", header: this.fieldTitle["amount"] ,isRequired:true},
      { field: "invoiceBillRefNo", header: this.fieldTitle["invoice/billrefno."] },
      { field: "", header: this.fieldTitle["ref.doc"], styleClass:"d-center" },
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
            this.modelSvc.multiVoucherBankForm.markAsPristine();
        },20);
        }  
      }else{
        this.modelSvc.resetFormMultipleCash();
        this.addNewItem();
        this.modelSvc.totalCredit=0;
        setTimeout(()=>{
          this.modelSvc.creditReceiptVoucherModel.company = GlobalConstants.userInfo.company;
          this.modelSvc.creditReceiptVoucherModel.companyID = GlobalConstants.userInfo.companyID;
       
          this.modelSvc.creditReceiptVoucherModel.voucherDate = new Date();  
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

multiSaveCash(multiJournalVoucherForm: NgForm) {
  try {
    if (!multiJournalVoucherForm.valid) {
      this.directive.validateAllFormFields(
        multiJournalVoucherForm.form as UntypedFormGroup
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
        
        if(this.multiVoucherCashForm)
          this.markFormAsPristine(this.multiVoucherCashForm);

        if(this.modelSvc.sendSMS){
          this.modelSvc.prepareAndSendSMS();
        }
        this.modelSvc.isMultiCashEditMode=false;
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
  try {
    this.modelSvc.tempVoucherModel=null;
    this.modelSvc.initiate();
    //this.modelSvc.setSingleORG();
    this.modelSvc.creditReceiptVoucherModel.isMultiEntry=this.modelSvc.isMultiEntry;
    this.isSubmitted = false;
    this.modelSvc.isEdit=false;
    //this.modelSvc.filterCOAStructure(this.modelSvc.creditReceiptVoucherModel,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode)
    //this.modelSvc.addNewItem(this.cashNatureTransactionCode);
    this.loadBranchOfficeUnit();
    this.loadProject();
    this.modelSvc.sendSMS=false;
    this.modelSvc.totalCredit=0;
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
    if(this.modelSvc.chaeckFromAccountToAccountOnAddNewItem()){ 
      this.showMsg("2271");
      return;
    }

    this.modelSvc.addNewItem(this.cashNatureTransactionCode); 
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
 
      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.fromSubLedgerDetailID = null;
        this.showMsg("2248");
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
      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        entity.toSubLedgerDetailID = null;
        this.showMsg("2248");
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

// onSelectFromAccount(item) {
//   try {
//    setTimeout(() => {
//     if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
//       item.fromCOAStructID = null;
//       this.showMsg("2259");
//       this.modelSvc.processBalances();
//       return;
//     } 
//     if(item.fromCOAStructID){
//    this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
//       next: (res: any) => {
//         const fromAccountBalance = res || []; 
//         this.modelSvc.onSelectFromAccount(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
//         item.fromSubLedgerBalance=0;
//       },
//       error: (res: any) => {
//         this.showErrorMsg(res);
//       },
//     });
//   }else{
//       this.modelSvc.onSelectFromAccount(item,0);
//         item.fromSubLedgerBalance=0;
//     }
//    }, 0);
//   } catch (error) {
//     this.showErrorMsg(error);
//   }
// }

// onSelectToAccount(item) {
//   try {  
//     setTimeout(() => {
//       if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
//         item.toCOAStructID = null;
//         this.showMsg("2259");
//         this.modelSvc.processBalances();
//         return;
//       } 
  
//       item.toSubLedgerTypeID=item.toCoaStructureList.find(x=>x.id==item.toCOAStructID)?.subLedgerTypeID;
//       this.modelSvc.filterSubLedgerDetail(item);
//       if(item.toCOAStructID){
//       this.coreAccService.getLedgerBalance(item.toCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID)
//         .subscribe({
//           next: (res: any) => {
//             const toAccountBalance = res || []; 

//             this.modelSvc.onSelectToAccount(item,toAccountBalance.length?toAccountBalance[0].balance:0);
//             item.toSubledgerBalance=0;
//             item.toSubLedgerDetailID=null;
//           },
//           error: (res: any) => {
//             this.showErrorMsg(res);
//           },
//         });}
//         else{
//           this.modelSvc.onSelectToAccount(item,0);
//             item.toSubledgerBalance=0;
//             item.toSubLedgerDetailID=null;
//         }
//     }, 0);
//   } catch (error) {
//     this.showErrorMsg(error);
//   }
// }

onSelectFromAccount(item) {
  try {
   setTimeout(() => {
    if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
      item.fromCOAStructID = null;
      this.showMsg("2259");
      this.modelSvc.processBalances();
      return;
    } 
     item.fromSubLedgerTypeID=item.fromCoaStructureList.find(x=>x.id==item.fromCOAStructID)?.subLedgerTypeID;
      this.modelSvc.filterSubLedgerDetail(item);
    if(item.fromCOAStructID){
   this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID).subscribe({
      next: (res: any) => {
        const fromAccountBalance = res || []; 
        this.modelSvc.onSelectFromAccount(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
        item.fromSubLedgerBalance=0;
        item.fromSubLedgerDetailID=null;
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }else{
      this.modelSvc.onSelectFromAccount(item,0);
        item.fromSubLedgerBalance=0;
        item.fromSubLedgerDetailID=null;
    }
   }, 0);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

onSelectToAccount(item) {
  try {  
    setTimeout(() => {
      if (this.modelSvc.checkValidityForDuplicateMultiEntryCash()) {
        item.toCOAStructID = null;
        this.showMsg("2259");
        this.modelSvc.processBalances();
        return;
      } 
  
      // item.toSubLedgerTypeID=item.toCoaStructureList.find(x=>x.id==item.toCOAStructID)?.subLedgerTypeID;
      // this.modelSvc.filterSubLedgerDetail(item);
      if(item.toCOAStructID){
      this.coreAccService.getLedgerBalance(item.toCOAStructID||0,this.modelSvc.creditReceiptVoucherModel.companyID,null,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID)
        .subscribe({
          next: (res: any) => {
            const toAccountBalance = res || []; 

            this.modelSvc.onSelectToAccount(item,toAccountBalance.length?toAccountBalance[0].balance:0);
            item.toSubledgerBalance=0;
            //item.toSubLedgerDetailID=null;
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });}
        else{
          this.modelSvc.onSelectToAccount(item,0);
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
    if(item.projectID) {    
      this.modelSvc.filterCOAStructure(item,this.modelSvc.creditReceiptVoucherModel.orgID,this.modelSvc.creditReceiptVoucherModel.projectID,this.cashNatureTransactionCode);
          
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
    }else{
      this.addNewItem(); 
    } 
    this.modelSvc.totalSumCredit();
    item.fromCoaStructBalance=0;        
    item.fromSubLedgerDetailID=null;        
    item.fromSubLedgerTypeID=null; 
    item.fromCOAStructID=null
    item.toAccountBalance=0;        
    item.toSubLedgerDetailID=null;        
    item.toSubLedgerTypeID=null;         
    item.toCOAStructID=null;         
    item.toSubledgerBalance=null;
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
    this.coreAccService.printVoucher(FixedIDs.voucherType.CreditVoucher.code, voucherID);
  } catch (e) {
    throw e;
  }
}
}