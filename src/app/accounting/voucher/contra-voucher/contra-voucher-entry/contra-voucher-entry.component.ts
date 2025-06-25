import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { VoucherItemModel } from 'src/app/accounting/models/voucher/voucher-item.model';

import { ContraVoucherValidation } from 'src/app/accounting/models/voucher/voucher.model';
import { ContraVoucherDataService } from '../../../services/voucher/contra-voucher-data.service';
import { ContraVoucherModelService } from '../../../services/voucher/contra-voucher-model.service';
import { BaseComponent, FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods, GridOption, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { FileUploadComponent } from 'src/app/shared';
import { ColumnType, FileOption, ModalConfig } from 'src/app/shared/models/common.model';
import { ConfigService } from 'src/app/login';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-contra-voucher-entry',
  templateUrl: './contra-voucher-entry.component.html',
  providers: [ContraVoucherDataService,ContraVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class ContraVoucherEntryComponent extends BaseComponent
  implements OnInit,AfterViewInit {
  isSubmitted: boolean = false;
  projectOfficeBranch:string='';
  companyName:string='';
  voucherID:number=0;
  isMultiEntry:boolean=true;
  isEdit:boolean=false;
  spData: any = new QueryData();
  private $unsubscribe = new Subject<void>();
  ref: DynamicDialogRef;
  
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("multiContraVoucherForm", { static: true, read: NgForm })  
  multiContraVoucherForm: NgForm;

  loginUserID: number = null;
  gridOption: GridOption;
  cashNatureTransactionCode: any;
  bankNatureTransactionCode: any;
  chequeCd:any;
  fileUploadOption: FileUploadOption;
  titleNameEdit:boolean=false;
  isFromAccountBank:boolean=false;
  isInValidBranch:boolean=false;

  constructor(
    protected providerSvc: ProviderService,
    private dataSvc: ContraVoucherDataService,
    public modelSvc: ContraVoucherModelService,
    public coreAccService:CoreAccountingService,
    public orgService: OrgService,
    public dialogService: DialogService,
    public configSvc:ConfigService
  ) {
    super(providerSvc);
    this.validationMsgObj = ContraVoucherValidation();
  }

  ngOnInit() {
    try {              
      this.getChequeLeafNo();

      this.dataTransferSvc
        .on("voucherID")
        .pipe(takeUntil(this.$unsubscribe))
        .subscribe((response) => {
          if (response) {
            const voucherID = Number(
              JSON.parse(JSON.stringify(response))
            );
            this.voucherID=voucherID;   
            if(this.voucherID)  
             {
              this.isEdit=true; 
              this.titleNameEdit=true;
            }       
          }

          this.dataTransferSvc.unsubscribe(this.$unsubscribe);
        });

      this.dataTransferSvc.broadcast("voucherID", null);
      this.loginUserID=GlobalConstants.userInfo.userPKID;
      this.modelSvc.userInfo=GlobalConstants.userInfo;   
      this.modelSvc.contraVoucherModel.companyID=this.modelSvc.userInfo.companyID;
      this.modelSvc.contraVoucherModel.company=this.modelSvc.userInfo.company;
      this.chequeCd=FixedIDs.TransactionMode.Cheque;
      
      this.modelSvc.initiate();
      this.initGridOption();    

      setTimeout(()=>{      
      this.loadOtherData();
      },5);
      this.setBranchProjectConfig();
    } catch (error) {
      this.showErrorMsg(error);
    }
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
      this.modelSvc.multiContraVoucherForm = this.multiContraVoucherForm.form;      
    } catch (e) {
      this.showErrorMsg(e);
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
    const orgID = this.modelSvc.contraVoucherModel.companyID;
    this.orgService.getOrgStructure(elementCode, orgID.toString()).subscribe({
      next: (res: any) => {
        this.modelSvc.prepareOrgList(res);        

        if(this.modelSvc.contraVoucherModel.id==0){
          this.modelSvc.contraVoucherModel.voucherItemList=[];
          this.modelSvc.addNewItem();  
        }
          
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }

 loadVoucherByID(voucherID){
  try {
    this.spData.isRefresh = true;
    this.spData.pageNo = 0;

      this.dataSvc.GetVoucherByVoucherID(voucherID,this.spData)
    .subscribe({
      next: (res: any) => {   
        const voucherData=res[0];
        const data=voucherData;   
        
        if(data.id){          
          this.modelSvc.tempVoucherModel= JSON.stringify(GlobalMethods.deepClone(data));
          this.setDataModel(data);
        
         }
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
      complete: () => {},
    });
  } catch (error) {
    this.showErrorMsg(error);    
  }
 }

 loadProject(){
  try {
    this.coreAccService.getProject(this.modelSvc.contraVoucherModel.companyID).subscribe({
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
               
    this.modelSvc.contraVoucherModel.voucherItemList.forEach((item)=>{
      this.getLedgerBalance('from',item,item.fromCOAStructID||null,this.modelSvc.contraVoucherModel.companyID,null,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID);
      this.getLedgerBalance('to',item,item.toCOAStructID||null,this.modelSvc.contraVoucherModel.companyID,null,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID);          
      
      this.modelSvc.filterCOAStructure(item,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID);

      this.modelSvc.prepareChequeLeafNo(item);
    });  
  } catch (error ) {
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
          }
          else
          {
              if(cOAStructureID && subLedgerDetailID){
                voucherModel.toSubLedgerBalance=balance.length?balance[0].balance:0;  
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

 loadOtherData(){
  try {   
    this.cashNatureTransactionCode=FixedIDs.transactionNatureCd.cashNature.code;  
    this.bankNatureTransactionCode=FixedIDs.transactionNatureCd.bankNature.code;

    let elementCode='';
      elementCode= FixedIDs.orgType.Branch.toString();
      elementCode+= ','+FixedIDs.orgType.Office.toString();
      elementCode+= ','+FixedIDs.orgType.Unit.toString(); 
    const orgID=this.modelSvc.userInfo.companyID.toString();
     
    forkJoin(
      [
        this.orgService.getOrgStructure(elementCode,orgID),
        this.coreAccService.getProject(this.modelSvc.userInfo.companyID),
        this.coreAccService.getCOAStructure(),
        this.coreAccService.getSubLedgerDetail(),
        this.coreAccService.getFinancialYear(),
        this.coreAccService.getVoucherEntryEditPeriod(this.modelSvc.userInfo.companyID,null,null),
        this.coreAccService.getTransactionMode(),
        this.dataSvc.GetOrgCashConfig(),
        this.orgService.getOrgStructure(FixedIDs.orgType.Company.toString(), ''),
      ]
     ).subscribe({
         next: (res: any) => {
          this.modelSvc.prepareOrgList(res[0]);     
          this.modelSvc.projectList = res[1] || [];   
          
          //Coa Struct Start
          this.modelSvc.coaStructureList = res[2] || [];   
          this.modelSvc.filterCOAStructure(this.modelSvc.contraVoucherModel,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID); 
          //END
          
         this.modelSvc.subLedgerDetailList=res[3] || []; 

         if(this.voucherID)
         this.loadVoucherByID(this.voucherID);

         if(!this.voucherID)
             this.modelSvc.addNewItem();
         
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
            
            this.modelSvc.prepareCompanyOrgNgtvAcceptanceList(res[7] || []);

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

getTransactionMode(){
  this.coreAccService.getTransactionMode().subscribe({
    next: (res: any) => {
      let transactionModeList = res || [];   
       this.modelSvc.transactionModeList=transactionModeList;   
    },
    error: (res: any) => {
      this.showErrorMsg(res);
    },
  })
}

markFormAsPristine(form: NgForm): void {
    Object.keys(form.controls).forEach(controlName => {
      const control = form.controls[controlName];
      control.markAsPristine();
      control.markAsUntouched();
    });
  }

  getVoucherEntryEditPeriod(companyID: number, orgID?: number, projectID?: number) {
    try {      
      forkJoin(
       [
        this.coreAccService.getFinancialYear(),
        this.coreAccService.getVoucherEntryEditPeriod(companyID,orgID,projectID)
       ]
      ).subscribe({
          next: (res: any) => {
            //get Voucher Entry Edit Period
            if(res[0].length)
              {
                this.modelSvc.financialYearAll=res[0];                    
              }   
            if(res[1].length)
            {
              this.modelSvc.validityVoucherEntryEdit=res[1]; 
                           
            }    
            setTimeout(() => {                
              this.modelSvc.setMinDateMaxDate();
              this.modelSvc.setMinMaxDateBasedOnComapnyProjectOrg();
             }, 10);        
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "modelSvc.contraVoucherModel.voucherItemList",
        paginator: false,
        isGlobalSearch: false,
        isDynamicHeader:false,
        exportOption: {
          exportInPDF: false,
          exportInXL: false,
          title: "",
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    try {
      return [        
        { field: "toCOAStructID",header: this.fieldTitle["toaccountname"] ,isRequired:true,style:"width:10%"},
        { field: "toAccountBalance", header: this.fieldTitle["balance"],style:"width:5%" },       
        { field: "description", header: this.fieldTitle["description"],style:"width:15%" },        
        { field: "debitVal", header: this.fieldTitle["amount"] ,isRequired:true,style:"width:5%"},
        { field: "fromCOAStructID", header: this.fieldTitle["fromaccountname"] ,isRequired:true,style:"width:10%"},
        { field: "fromCoaStructBalance", header: this.fieldTitle["balance"],style:"width:5%" },
        { field: "transactionModeID", header: this.fieldTitle["transactionmode"],style:"width:10%" },
        { field: "transectionID", header: this.fieldTitle["chequeno"],style:"width:10%" },
        { field: "chequeDate", header: this.fieldTitle["chequedate"],style:"width:10%" },
        { field: "", header: this.fieldTitle["ref.doc"],style:"width:5%",isRequired:true},
        { field: "", header: this.fieldTitle["action"],style:"width:5%" },
      ];
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
            this.modelSvc.multiContraVoucherForm.markAsPristine();
          },20);
        }  
      }else{
        this.modelSvc.resetFormMultiple();
        this.modelSvc.contraVoucherModel.voucherItemList=[];
        this.modelSvc.addNewItem();
        this.modelSvc.setSingleORG();
      }
      this.modelSvc.contraVoucherModel.company = this.modelSvc.userInfo.company;
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  multiSave(multiJournalVoucherForm: NgForm) {
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

      const validItem=this.modelSvc.contraVoucherModel.voucherItemList.filter(x=>x.tag!=2);
      if (!validItem.length) {
        this.showMsg("2247");
        return;
      }

      if (this.modelSvc.checkDataValidityForMultiEntry()) {
        this.showMsg("2258");
        return;
      } 

      if(this.modelSvc.referenceDocRequirement()){
        this.showMsg("2265");
        return;
      }

      this.modelSvc.prepareDataForMultiEntry();
      
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
      
      this.dataSvc.save(this.modelSvc.contraVoucherModel).subscribe({
        next: (res: any) => {
          this.showMsg(messageCode);
          this.modelSvc.prepareDataAfterSave(res.body);
          this.modelSvc.multiContraVoucherForm.markAsPristine();         
          this.isEdit = false;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {},
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  } 

  addNew() {
    this.getChequeLeafNo();
    this.modelSvc.initiate();
    this.modelSvc.contraVoucherModel.isMultiEntry=this.isMultiEntry;
    this.isSubmitted = false;
    this.isEdit = false;
    this.modelSvc.tempVoucherModel=null;    
    this.titleNameEdit=false;
    this.isFromAccountBank=false;
    this.modelSvc.setSingleORG();
    this.modelSvc.addNewItem();
  }

  removeVoucherItem(item: any) {
    try {
      this.modelSvc.removeItem(item);
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
          this.modelSvc.fileManagement(item);
          this.modelSvc.multiContraVoucherForm.markAsDirty();
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

  onSelectOrg(item) {
    try {   
      item.voucherItemList=[];
      this.modelSvc.addNewItem();   
      if(item.orgID) {
        this.modelSvc.filterCOAStructure(this.modelSvc.contraVoucherModel,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID);
    
        let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
        let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
      if(!fromCoaList.length || !toCoaList.length){    
        this.markFormAsPristine(this.multiContraVoucherForm);
        
        if(!fromCoaList.length && !toCoaList.length)
          this.showMsg("2270");
   
        if(!fromCoaList.length && toCoaList.length)
          this.showMsg("2268");

        if(fromCoaList.length && !toCoaList.length)
          this.showMsg("2269");
      }

      if(this.modelSvc.isBranchModuleActive)
        this.isInValidBranch= this.modelSvc.contraVoucherModel.orgID?false:true;
    }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectFromAccountMulti(item) {
    try {  
      
      if(item.fromCOAStructID) 
      {
      if(item.toCOAStructID==item.fromCOAStructID){
        setTimeout(()=>{
          item.fromCOAStructID=null;
          item.fromCoaStructBalance=null;
        },5);
        this.showMsg('2258');
        return;
      }
      } 
      else{
        item.fromCoaStructBalance=null;
      }
     if(item.fromCOAStructID){
      let dataObj= item.fromCoaStructureList.find(x=>x.id==item.fromCOAStructID);
      if(dataObj){
        if(dataObj.transactionNatureCode==FixedIDs.transactionNatureCd.bankNature.code){
          this.isFromAccountBank=true;
        }else{
          this.isFromAccountBank=false;
        }
      }
      this.coreAccService.getLedgerBalance(item.fromCOAStructID||0,this.modelSvc.contraVoucherModel.companyID,null,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID)
      .subscribe({
        next: (res: any) => {
          const fromAccountBalance = res || []; 
          this.modelSvc.onSelectFromAccountMulti(item,fromAccountBalance.length?fromAccountBalance[0].balance:0);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });     
    }else{
      this.modelSvc.onSelectFromAccountMulti(item,0);
      this.isFromAccountBank=false;
    }

    this.modelSvc.prepareChequeLeafNo(item);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectToAccountMulti(item) {
    try {
      
      if(item.toCOAStructID){
      if(item.toCOAStructID==item.fromCOAStructID){
        setTimeout(()=>{
          item.toCOAStructID=null;
          item.toAccountBalance=null;
        },5);
        
        this.showMsg('2258');
        return;
      }
    }else{
      item.toAccountBalance=null;
    }

    if(item.toCOAStructID){
      this.coreAccService.getLedgerBalance(item.toCOAStructID||0,this.modelSvc.contraVoucherModel.companyID,null,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID)
      .subscribe({
        next: (res: any) => {            
            const toAccountBalance = res || []; 

            this.modelSvc.onSelectToAccountMulti(item,toAccountBalance.length?toAccountBalance[0].balance:0);
            item.toSubLedgerBalance=0;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    }else{
      this.modelSvc.onSelectToAccountMulti(item,0);
      item.toSubLedgerBalance=0;
    }
     
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectToProjectMulti(item){
   try {  
    this.modelSvc.contraVoucherModel.voucherItemList=[];
    this.modelSvc.addNewItem();
    this.modelSvc.filterCOAStructure(item,this.modelSvc.contraVoucherModel.orgID,this.modelSvc.contraVoucherModel.projectID);
          
    let fromCoaList=this.modelSvc.getFromCoaStructureByOrgAndProject(item);
    let toCoaList=this.modelSvc.getToCoaStructureByOrgAndProject(item);
    if(!fromCoaList.length || !toCoaList.length){
            setTimeout(()=>{
              if(this.multiContraVoucherForm)
                this.markFormAsPristine(this.multiContraVoucherForm);
            },10);
            
            if(!fromCoaList.length && !toCoaList.length)
              this.showMsg("2270");
       
            if(!fromCoaList.length && toCoaList.length)
              this.showMsg("2268");
    
            if(fromCoaList.length && !toCoaList.length)
              this.showMsg("2269");
          }
        item.toAccountBalance=0;        
        item.toSubLedgerDetailID=null;        
        item.toSubLedgerTypeID=null;         
        item.toCOAStructID=null;         
        
        item.fromCoaStructBalance=0;        
        item.fromSubLedgerDetailID=null;        
        item.fromSubLedgerTypeID=null; 
        item.fromCOAStructID=null; 
        item.description=null;
        if(item?.voucherItemAttachmentList)
          item.voucherItemAttachmentList=[];
   } catch (error) {
    this.showErrorMsg(error);
   }
  }

  //Print
  printVoucher(voucherID:number) {
    try {
      this.coreAccService.printVoucher(FixedIDs.voucherType.ContraVoucher.code, voucherID);
    } catch (e) {
      throw e;
    }
  }

  onChangeTransactionMode(item){
    try {
      if(item.tranModeCd!=this.chequeCd){
         item.chequeNo=null;
         item.chequeDate=null;
         item.chequeLeafID=null;
      }
    } catch (e) {
      throw e;
    }
  }

}