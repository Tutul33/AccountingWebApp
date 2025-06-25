import { Component, ComponentFactoryResolver, EventEmitter, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { 
  CreditReceiptVoucherDataService, 
  CreditReceiptVoucherModelService,
  CreditReceiptVoucherEntryMultiBankComponent ,
  CreditReceiptVoucherEntryMultiCashComponent ,
  CreditReceiptVoucherEntrySingleBankComponent,
  CreditReceiptVoucherEntrySingleCashComponent
 } from '../../../index'
import { BaseComponent,  FixedIDs,  GlobalMethods, ProviderService } from 'src/app/app-shared';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { QueryData } from 'src/app/shared/models/common.model';
import { Subject, takeUntil } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-credit-receipt-voucher-entry',
  templateUrl: './credit-receipt-voucher-entry.component.html',
  providers:[CreditReceiptVoucherDataService,CreditReceiptVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class CreditReceiptVoucherEntryComponent  extends BaseComponent
implements OnInit {
signleCashVoucher:any;
multiCashVoucher:any;
signleBankVoucher:any;
multiBankVoucher:any;

components: any[] = [
  {
    key: 1,
    component: CreditReceiptVoucherEntrySingleCashComponent
  },
  {
    key: 2,
    component: CreditReceiptVoucherEntryMultiCashComponent
  },
  {
    key: 3,
    component: CreditReceiptVoucherEntrySingleBankComponent
  },
  {
    key: 4,
    component: CreditReceiptVoucherEntryMultiBankComponent
  }    
];

spData: any = new QueryData();
private $unsubscribe = new Subject<void>();
voucherID:number=0;
titleNameEdit:boolean=false;

@ViewChild('viewContainerSingleCash', {read: ViewContainerRef}) viewContainerSingleCash: ViewContainerRef;
@ViewChild('viewContainerMultiCash', {read: ViewContainerRef}) viewContainerMultiCash: ViewContainerRef;
@ViewChild('viewContainerSingleBank', {read: ViewContainerRef}) viewContainerSingleBank: ViewContainerRef;
@ViewChild('viewContainerMultiBank', {read: ViewContainerRef}) viewContainerMultiBank: ViewContainerRef;

constructor(
  protected providerSvc: ProviderService,
  private dataSvc: CreditReceiptVoucherDataService,
  public modelSvc: CreditReceiptVoucherModelService,
  public coreAccService:CoreAccountingService,
  public orgService: OrgService
) {
  super(providerSvc);

}

ngOnInit() {
  try {
    
    this.dataTransferSvc
            .on("voucherID")
            .pipe(takeUntil(this.$unsubscribe))
            .subscribe((response) => {
              if (response) {
                const voucherID = Number(
                  JSON.parse(JSON.stringify(response))
                );
                this.voucherID=voucherID;
                this.loadVoucherByID(voucherID);
                if(voucherID){
                  this.titleNameEdit=true;
                }else{
                  setTimeout(()=>{
                    this.loadComponent(1);
                  },20)
                }
              }else{
                setTimeout(()=>{
                  this.loadComponent(1);
                },20)
              }    
              this.dataTransferSvc.unsubscribe(this.$unsubscribe);
            });
    this.dataTransferSvc.broadcast("voucherID", null);

    } catch (error) {
    this.showErrorMsg(error);
  }
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
          this.detectVoucherModelToEdit(data);
          this.modelSvc.setEnabledTab(data);
          this.modelSvc.tempVoucherModel= GlobalMethods.deepClone(data);
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

 setDataModel(data){
  try {
    this.modelSvc.setEntryType(data.isMultiEntry,data.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code?true:false);
  } catch (error) {
    
  }
 }

 tabChange(isMultiEntry,isCash,key) {
  try {   
    this.signleCashVoucher = null;
    this.multiCashVoucher = null;
    this.signleBankVoucher = null;
    this.multiBankVoucher = null;
    
    this.modelSvc.isEdit=false;
    this.modelSvc.initiate();
    this.modelSvc.setEntryType(isMultiEntry,isCash);

    this.loadComponent(key);
  } catch (error) {
    this.showErrorMsg(error);
  }
}
loadComponent(key) { 
  try {
    let componentDefinition = this.components.filter(x=>x.key == key)[0];
    let vcRef = null;
    let voucherModel =null;
    switch (key) {
      case 1:
        //Clear Previous Loaded Component
        voucherModel=this.signleCashVoucher;
        vcRef = this.viewContainerSingleCash;
        vcRef.clear();
        break;
      case 2:
          //Clear Previous Loaded Component
          voucherModel=this.multiCashVoucher;
          vcRef = this.viewContainerMultiCash;
          vcRef.clear();
          break;
      case 3:
          //Clear Previous Loaded Component
          voucherModel=this.signleBankVoucher;
          vcRef = this.viewContainerSingleBank;
          vcRef.clear();
          break;
      case 4:
          //Clear Previous Loaded Component
          voucherModel=this.multiBankVoucher;
          vcRef = this.viewContainerMultiBank;
          vcRef.clear();
          break;
      default:
        vcRef.clear();
        break;
    }
    

    if (componentDefinition) {

    // Dynamically create the component
    const componentRef = vcRef.createComponent(componentDefinition.component);

    // Explicitly cast the instance to `any`
    const instance = componentRef.instance as any;

    // Wait for Angular to initialize the component before setting properties
    setTimeout(() => {
      instance.voucherModel = voucherModel;

      // Subscribe to the @Output()
      if (instance.dataEmitToParent instanceof EventEmitter) {
        instance.dataEmitToParent.subscribe((event: any) => {
          this.receiveDataFromChild(event);
        });
      } else {        
        this.showErrorMsg("Something went wrong.");
      }
    });

    }
    
  } catch (error) {
    this.showErrorMsg(error);
  }
}

private detectVoucherModelToEdit(data: any) {
  if (!data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code) {
    this.signleCashVoucher = data;

    this.multiCashVoucher = null;
    this.signleBankVoucher = null;
    this.multiBankVoucher = null;
    this.loadComponent(1);
  }
  else if (data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherCash.code) {
    this.multiCashVoucher = data;

    this.signleCashVoucher = null;
    this.signleBankVoucher = null;
    this.multiBankVoucher = null;
    this.loadComponent(2);
  }
  else if (!data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherBank.code) {
    this.signleBankVoucher = data;

    this.signleCashVoucher = null;
    this.multiCashVoucher = null;
    this.multiBankVoucher = null;
    this.loadComponent(3);
  }
  else if (data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.creditVoucherBank.code) {
    this.multiBankVoucher = data;

    this.signleBankVoucher = null;
    this.signleCashVoucher = null;
    this.multiCashVoucher = null;
    this.loadComponent(4);
  }
}
receiveDataFromChild(data: any) {
  try {
    if(data){
      if(data.changeTitle){
        this.voucherID=0;
      }
    }
    this.modelSvc.resetTab();
  } catch (error) {
    this.showErrorMsg(error);
  }
}
}