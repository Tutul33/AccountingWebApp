import { Component, ComponentFactoryResolver, EventEmitter, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import {
  BaseComponent,
  FixedIDs,
  GlobalMethods,
  ProviderService
} from "src/app/app-shared";
import {
  DebitPaymentVoucherDataService,
  DebitPaymentVoucherModelService,
  DebitPaymentVoucherEntryMultiBankComponent,
  DebitPaymentVoucherEntryMultiCashComponent, 
  DebitPaymentVoucherEntrySingleBankComponent,
  DebitPaymentVoucherEntrySingleCashComponent
} from "../../../index";

import {
  QueryData,
} from "src/app/shared/models/common.model";
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { Subject, takeUntil } from "rxjs";
import { OrgService } from "src/app/app-shared/services/org.service";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-debit-payment-voucher-entry',
  templateUrl: './debit-payment-voucher-entry.component.html',
  providers:[DebitPaymentVoucherDataService,DebitPaymentVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})

export class DebitPaymentVoucherEntryComponent  extends BaseComponent
implements OnInit {
signleCashVoucher:any;
multiCashVoucher:any;
signleBankVoucher:any;
multiBankVoucher:any;

spData: any = new QueryData();
private $unsubscribe = new Subject<void>();
voucherID:number=0;
components: any[] = [
  {
    key: 1,
    component: DebitPaymentVoucherEntrySingleCashComponent
  },
  {
    key: 2,
    component: DebitPaymentVoucherEntryMultiCashComponent
  },
  {
    key: 3,
    component: DebitPaymentVoucherEntrySingleBankComponent
  },
  {
    key: 4,
    component: DebitPaymentVoucherEntryMultiBankComponent
  }    
];
@ViewChild('viewContainerSingleCash', {read: ViewContainerRef}) viewContainerSingleCash: ViewContainerRef;
@ViewChild('viewContainerMultiCash', {read: ViewContainerRef}) viewContainerMultiCash: ViewContainerRef;
@ViewChild('viewContainerSingleBank', {read: ViewContainerRef}) viewContainerSingleBank: ViewContainerRef;
@ViewChild('viewContainerMultiBank', {read: ViewContainerRef}) viewContainerMultiBank: ViewContainerRef;

constructor(
  protected providerSvc: ProviderService,
  private dataSvc: DebitPaymentVoucherDataService,
  public modelSvc: DebitPaymentVoucherModelService,
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
                if(voucherID){
                this.loadVoucherByID(voucherID);
                }else{
                  setTimeout(()=>{
                    this.loadComponent(1);
                  },20)
                }
              } else{
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

  private detectVoucherModelToEdit(data: any) {
    if (!data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code) {
      this.signleCashVoucher = data;

      this.multiCashVoucher = null;
      this.signleBankVoucher = null;
      this.multiBankVoucher = null;
      this.loadComponent(1);
    }
    else if (data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code) {
      this.multiCashVoucher = data;

      this.signleCashVoucher = null;
      this.signleBankVoucher = null;
      this.multiBankVoucher = null;
      this.loadComponent(2);
    }
    else if (!data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherBank.code) {
      this.signleBankVoucher = data;

      this.signleCashVoucher = null;
      this.multiCashVoucher = null;
      this.multiBankVoucher = null;
      this.loadComponent(3);
    }
    else if (data.isMultiEntry && data.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherBank.code) {
      this.multiBankVoucher = data;

      this.signleBankVoucher = null;
      this.signleCashVoucher = null;
      this.multiCashVoucher = null;
      this.loadComponent(4);
    }
  }

 setDataModel(model){
  try {
    this.modelSvc.setEntryType(model.isMultiEntry,model.voucherTitleCd==FixedIDs.voucherTitleCd.debitVoucherCash.code?true:false);    
  } catch (error) {
    
  }
 }

tabChange(isMultiEntry,isCash,key) {
  try {
    this.multiBankVoucher = null;
    this.signleBankVoucher = null;
    this.signleCashVoucher = null;
    this.multiCashVoucher = null;
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
