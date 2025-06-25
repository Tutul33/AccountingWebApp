import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import {
  ProviderService,
  BaseComponent,
  ValidatorDirective,
  DestinationsDefineComponent,
  BusinessConfigDataService,
  BusinessConfigModelService,
  AccountHeadComponent,
  SubLedgerTypeComponent,
  TransactionModeComponent,
  VoucherNotificationComponent,
  ProjectBranchComponent,
  VoucherCategoryComponent,
  CashBalanceControlComponent,
  ChequeLeafStatusComponent,
  ChequeStatusNotifyComponent,
  CashFlowStatementGroupsComponent
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";
// import { AccountHeadComponent } from "./account-head/account-head.component";
// import { SubLedgerTypeComponent } from "./sub-ledger-type/sub-ledger-type.component";
// import { TransactionModeComponent } from "./transaction-mode/transaction-mode.component";
// import { VoucherNotificationComponent } from "./voucher-notification/voucher-notification.component";

@Component({
  selector: 'app-business-cofig',
  templateUrl: './business-cofig.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class BusinessCofigComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild('viewContainerDestinationDefine', {read: ViewContainerRef}) viewContainerDestinationDefine: ViewContainerRef;
  @ViewChild('viewContainerAccountHead', {read: ViewContainerRef}) viewContainerAccountHead: ViewContainerRef;
  @ViewChild('viewContainerSubLedgerType', {read: ViewContainerRef}) viewContainerSubLedgerType: ViewContainerRef;
  @ViewChild('viewContainerTransactionMode', {read: ViewContainerRef}) viewContainerTransactionMode: ViewContainerRef;
  @ViewChild('viewContainerVoucherNotification', {read: ViewContainerRef}) viewContainerVoucherNotification: ViewContainerRef;
  @ViewChild('viewContainerProjectBranch', {read: ViewContainerRef}) viewContainerProjectBranch: ViewContainerRef;
  @ViewChild('viewContainerVoucherCategory', {read: ViewContainerRef}) viewContainerVoucherCategory: ViewContainerRef;
  @ViewChild('viewContainerCashBalanceControl', {read: ViewContainerRef}) viewContainerCashBalanceControl: ViewContainerRef;
  @ViewChild('viewContainerChequeLeafStatus', {read: ViewContainerRef}) viewContainerChequeLeafStatus: ViewContainerRef;
  @ViewChild('viewContainerChequeStatusNotify', {read: ViewContainerRef}) viewContainerChequeStatusNotify: ViewContainerRef;
  @ViewChild('viewContainerCashFlowStatementGroups', {read: ViewContainerRef}) viewContainerCashFlowStatementGroups: ViewContainerRef;
  
  
  ref: DynamicDialogRef;
  tempComponent: any; 

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
    private factoryResolver: ComponentFactoryResolver
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.loadComponent(1);
  }

  definitions: any[] = [
    {
      key: 1,
      component: DestinationsDefineComponent
    },
    {
      key: 2,
      component: AccountHeadComponent
    },
    {
      key: 3,
      component: SubLedgerTypeComponent
    },
    {
      key: 4,
      component: TransactionModeComponent
    },
    {
      key: 5,
      component: VoucherNotificationComponent
    },
    {
      key: 6,
      component: ProjectBranchComponent
    },
    {
      key: 7,
      component: VoucherCategoryComponent
    },
    {
      key: 8,
      component: CashBalanceControlComponent
    },
    {
      key: 9,
      component: ChequeLeafStatusComponent
    },
    {
      key: 10,
      component: ChequeStatusNotifyComponent
    
    },
    {
      key: 11,
      component: CashFlowStatementGroupsComponent
    },
    
  ];
  

  loadComponent(key) { 
    try {
      let componentDefinition = this.definitions.filter(x=>x.key == key)[0];
      let vcRef = null;

      switch (key) {
        case 1:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerDestinationDefine;
          vcRef.clear();
          break;
        case 2:
            //Clear Previous Loaded Component
            vcRef = this.viewContainerAccountHead;
            vcRef.clear();
            break;
        case 3:
            //Clear Previous Loaded Component
            vcRef = this.viewContainerSubLedgerType;
            vcRef.clear();
            break;
        case 4:
            //Clear Previous Loaded Component
            vcRef = this.viewContainerTransactionMode;
            vcRef.clear();
            break;
        case 5:
            //Clear Previous Loaded Component
            vcRef = this.viewContainerVoucherNotification;
            vcRef.clear();
            break;
        case 6:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerProjectBranch;
          vcRef.clear();
          break;
        case 7:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerVoucherCategory;
          vcRef.clear();
          break;
        case 8:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerCashBalanceControl;
          vcRef.clear();
          break;
        case 9:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerChequeLeafStatus;
          vcRef.clear();
          break;
        case 10:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerChequeStatusNotify;
          vcRef.clear();
          break;
        case 11:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerCashFlowStatementGroups;
          vcRef.clear();
          break;
        default:
          vcRef.clear();
          break;
      }
      

      if (componentDefinition) {
        //Generate New Component
        const componentFactory = this.factoryResolver.resolveComponentFactory(componentDefinition.component);
        this.tempComponent = vcRef.createComponent(componentFactory);
      }
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }






}

