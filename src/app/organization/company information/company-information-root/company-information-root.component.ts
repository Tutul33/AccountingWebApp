import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeNode } from "primeng/api";
import { OrgBasicDTO, socialContactValidation, basicInfoValidation } from '../../models/company-information/company-information';
import { FixedIDs } from '../../../shared';
import { BasicInformationComponent } from '../../company information/basic-information/basic-information.component';
import { AddressInformationComponent } from '../../company information/address-information/address-information.component';
import { ContactPersonDetailsComponent } from '../../company information/contact-person-details/contact-person-details.component';

import {
  ProviderService,
  QueryData,
  BaseComponent,
  ValidatorDirective,
  CompanyInformationDataService,
  CompanyInformationModelService,
  ORGStructureModelService,
  OrgStructureDataService,
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-company-information-root',
  templateUrl: './company-information-root.component.html',
  providers: [CompanyInformationModelService, CompanyInformationDataService, ORGStructureModelService, OrgStructureDataService],
  standalone:true,
  imports:[SharedModule]
})

export class CompanyInformationRootComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild('viewContainerBasicInfo', {read: ViewContainerRef}) viewContainerBasicInfoRef: ViewContainerRef;
  @ViewChild('viewContainerAddress', {read: ViewContainerRef}) viewContainerAddressRef: ViewContainerRef;
  @ViewChild('viewContainerContactPerson', {read: ViewContainerRef}) viewContainerContactPersonRef: ViewContainerRef;
  @ViewChild('viewContainerBillingAddress', {read: ViewContainerRef}) viewContainerBillingAddressRef: ViewContainerRef;
  @ViewChild('viewContainerDeliveryAddress', {read: ViewContainerRef}) viewContainerDeliveryAddressRef: ViewContainerRef;


  spData: any = new QueryData();
  isListShow: boolean = false;
  serverDataList: any[] = [];
  orgStructureList: TreeNode[] = [];
  treeDataList: TreeNode[];
  organizationName: string = '';
  isSubmited: boolean = false;
  public validationMsgObjBasicInfo: any;
  public validationMsgObjSocialPlatform: any;
  
  isShortAddressModal: boolean =  false;
  isBillingAddressEmployeeModal: boolean = false;
  isDeliveryAddressEmployeeModal: boolean = false;
  shortAddress: string = "";

  ref: DynamicDialogRef;
  selectedNode: any = null;
  tempComponent: any; 

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CompanyInformationModelService,
    private dataSvc: CompanyInformationDataService,
    private orgSvc: OrgStructureDataService,
    public orgModelSvc: ORGStructureModelService,
    public dialogService: DialogService,
    private factoryResolver: ComponentFactoryResolver
  ) {
    super(providerSvc);
    this.validationMsgObjBasicInfo = basicInfoValidation();
    this.validationMsgObjSocialPlatform = socialContactValidation();
  }

  ngOnInit(): void {
    this.setDeafult();
  }

  setDeafult(){
    this.modelSvc.orgBasicDTO= new OrgBasicDTO();
    this.modelSvc.tempOrgBasicDTO= new OrgBasicDTO();
    //this.getOrgStructure();
    this.getOrgStructureId();
  }

  getOrgStructure() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgStructureTreeListForComInfo(this.spData).subscribe({
        next: (res: any) => {
          this.serverDataList = this.orgModelSvc.mapObjectProps(res[res.length - 1] || []);
          this.treeDataList = this.orgModelSvc.prepareTreeData(this.serverDataList, null);
          this.expandAll();
          
          this.modelSvc.orgBasicDTO.orgStructureID = this.modelSvc.groupList[0].id;
          this.modelSvc.organizationName = this.modelSvc.groupList[0].name;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getOrgStructureId() {
    try {
      this.spData.pageNo = 0;
      this.orgSvc.getOrgStructureId(this.spData).subscribe({
        next: (res: any) => {
          let result = res[res.length - 1];
          this.getOrgStructureTreeList(result[0].elementID);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getOrgStructureTreeList(id: number) {
    try {
      this.spData.pageNo = 0;
      this.orgSvc.getOrgStructureTreeList(this.spData, id).subscribe({
        next: (res: any) => {
          this.serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.treeDataList = this.modelSvc.prepareTreeData(this.serverDataList, null);
          this.expandAll();

          this.modelSvc.orgBasicDTO.orgStructureID = this.modelSvc.groupList[0].id;
          this.modelSvc.organizationName = this.modelSvc.groupList[0].name;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  expandAll() {
    this.treeDataList.forEach((node) => {
      this.orgModelSvc.expandRecursive(node, true);
    });
  }

  collapseAll() {
    this.treeDataList.forEach((node) => {
      this.orgModelSvc.expandRecursive(node, false);
    });
  }


  onNodeClick(node: any) {
    try {
      this.modelSvc.orgBasicDTO.orgStructureID = node.id;
      this.modelSvc.orgStructureID = node.id;
      this.modelSvc.organizationName = node.label;
      if(node.parent)
      {
        this.modelSvc.orgStructureIDParentID = node.parent.id;
      }
      else
      {
        this.modelSvc.orgStructureIDParentID = 0;
      }

      this.findActiveTab();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onTabChange(event: any) {
    const activeIndex = event.index;
    this.modelSvc.findActiveTab(activeIndex);
    this.findActiveTab();
  }

  findActiveTab()
  {
    if(this.modelSvc.basicInfoTab)
      {
        this.loadComponent(1);
      }
      if(this.modelSvc.addressTab)
      {
        this.loadComponent(2);
      }
      if(this.modelSvc.contactPersonTab)
      {
        this.loadComponent(3);
      }
      if(this.modelSvc.billingAddressTab)
      {
        this.loadComponent(4);
      }
      if(this.modelSvc.deliveryAddressTab)
      {
        this.loadComponent(5);
      }
  }

  definitions: any[] = [
    {
      key: 1,
      component: BasicInformationComponent
    },
    {
      key: 2,
      component: AddressInformationComponent
    },
    {
      key: 3,
      component: ContactPersonDetailsComponent
    },
    {
      key: 4,
      component: AddressInformationComponent
    },
    {
      key: 5,
      component: AddressInformationComponent
    }
  ];
  

  loadComponent(key) {
    try {

      let componentDefinition = this.definitions.filter(x=>x.key == key)[0];

      let vcRef = null;

      switch (key) {
        case 1:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerBasicInfoRef;
          vcRef.clear();
          break;
        case 2:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerAddressRef;
          vcRef.clear();
          break;
        case 3:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerContactPersonRef;
          vcRef.clear();
          break;
        case 4:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerBillingAddressRef;
          vcRef.clear();
          break;
        case 5:
          //Clear Previous Loaded Component
          vcRef = this.viewContainerDeliveryAddressRef;
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
        if(this.tempComponent){
          this.tempComponent.instance.orgStructureID = this.modelSvc.orgBasicDTO.orgStructureID;
          this.tempComponent.instance.organizationName = this.modelSvc.organizationName;
          this.tempComponent.instance.orgStructureIDParentID = this.modelSvc.orgStructureIDParentID;
          if(key == 2)
          {
            this.tempComponent.instance.addressTypeCd = FixedIDs.orgAddressType.General;
          }
          if(key == 4)
          {
            this.tempComponent.instance.addressTypeCd = FixedIDs.orgAddressType.Billing;
          }
          if(key == 5)
          {
            this.tempComponent.instance.addressTypeCd = FixedIDs.orgAddressType.Shipping;
          }
        }
      }
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


}
