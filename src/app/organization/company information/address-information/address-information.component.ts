import { Component, OnInit, Input } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrgBasicDTO, OrgAddressDTO, OrgContactDetailsDTO} from '../../models/company-information/company-information';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalMethods } from '../../../shared';
import { AddressComponent } from '../../../shared/components/address/address.component'
import { Address } from '../../../shared/models/common.model';
import { EmployeeListComponent } from 'src/app/admin/employee-list/employee-list.component'
import { OrganizationSearchComponent } from '../../../shared/components/organization-search/organization-search.component'



import {
  ProviderService,
  ModalConfig,
  QueryData,
  BaseComponent,
  CompanyInformationDataService,
  CompanyInformationModelService,
  ORGStructureModelService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-address-information',
  templateUrl: './address-information.component.html',
  providers: [CompanyInformationModelService, CompanyInformationDataService, ORGStructureModelService],  
  standalone:true,
  imports:[SharedModule]
})
export class AddressInformationComponent extends BaseComponent implements OnInit {
  @Input() orgStructureID: number = 0;
  @Input() organizationName: string = "";
  @Input() addressTypeCd: number = 0;
  @Input() orgStructureIDParentID: number = 0;

  spData: any = new QueryData();
  isSubmited: boolean = false;

  gridOptionAddress: GridOption;
  gridOptionAddressContactPerson: GridOption;

  isShortAddressModal: boolean =  false;
  shortAddress: string = "";
  isAddressContactPersonModal: boolean = false;
  isContactPersonVisible: boolean = false;
  listName: string = "";

  ref: DynamicDialogRef;
  selectedNode: any = null;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CompanyInformationModelService,
    private dataSvc: CompanyInformationDataService,
    public orgModelSvc: ORGStructureModelService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    if(this.addressTypeCd == FixedIDs.orgAddressType.Billing  ||  this.addressTypeCd == FixedIDs.orgAddressType.Shipping)
    {
      this.isContactPersonVisible = true;
      this.listName = this.fieldTitle["addresslist"];
    }
    else
    {
      this.listName = this.fieldTitle["address"];
    }
    this.initGridOptionAddress();
    this.initGridOptionAddressContactPerson();
    this.setDeafult();
  }

  setDeafult(){
    this.modelSvc.orgBasicDTO= new OrgBasicDTO();
    this.modelSvc.tempOrgBasicDTO= new OrgBasicDTO();
    this.modelSvc.orgAddressDTO= new OrgAddressDTO();
    this.modelSvc.tempOrgAddressDTO= new OrgAddressDTO();
    this.modelSvc.setAddress = new Address();
    this.modelSvc.orgContactDetailsDTO = new OrgContactDetailsDTO();
    this.modelSvc.tempOrgContactDetailsDTO = new OrgContactDetailsDTO();

    this.modelSvc.organizationName = this.organizationName;
    this.modelSvc.orgStructureID = this.orgStructureID;
    this.modelSvc.orgStructureIDParentID = this.orgStructureIDParentID;  

    setTimeout(()=>{
      this.getAddressData(this.orgStructureID, this.addressTypeCd);
    },20);
    
  }

  initGridOptionAddress() {
    try {
      const gridObj = {
        title: this.listName,
        dataSource: "modelSvc.addressList",
        refreshEvent: this.refreshAddress,
        columns: this.gridColumnsAddress(),
        isGlobalSearch: true,
      } as GridOption;
      this.gridOptionAddress = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumnsAddress(): ColumnType[] {
    return [
      { field: "organizationName", header: this.fieldTitle['organization']},
      { field: "addressLine1", header: this.fieldTitle['address1']},
      { field: "addressLine2", header: this.fieldTitle['address2']},
      { field: "village", header: this.fieldTitle['villageshort']},
      { field: "postOffice", header: this.fieldTitle['postoffice']},
      { field: "pOBox", header: this.fieldTitle['pobox']},
      { field: "zip", header: this.fieldTitle['zipcode']},
      { field: "thana", header: this.fieldTitle['thanashort']},
      { field: "district", header: this.fieldTitle['districtshort']},
      { field: "division", header: this.fieldTitle['divisionshort']},
      { field: "city", header: this.fieldTitle['city/town']},
      { field: "state", header: this.fieldTitle['state']},
      { field: "country", header: this.fieldTitle['country']},
      { field: "shortAddress", header: this.fieldTitle['shortaddress']},
      ...(this.isContactPersonVisible ? [{ field: "contactPerson", header: this.fieldTitle["contactperson"] }] : []),    // This is for dynamically hide show coloumn depending on addressTypeCd
      { header: this.fieldTitle["action"], style: "" },
    ];
  }

  refreshAddress(){
    try {
      this.modelSvc.disableOrgAddressButton = false;
      this.modelSvc.disableAddressButton = false;
      this.modelSvc.disableParentOrgAddressButton = false;

      setTimeout(()=>{
        this.getAddressData(this.orgStructureID, this.addressTypeCd);
      },20);  

      this.modelSvc.disableAddressRestButton = true;
      this.modelSvc.disableAddressSaveButton = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOptionAddressContactPerson() {
    try {
      const gridObj = {
        title: this.fieldTitle["contactperson"],
        dataSource: "modelSvc.addressContactPersonListDisplay",
        columns: this.gridColumnsAddressContactPerson(),
        isGlobalSearch: true,
      } as GridOption;
      this.gridOptionAddressContactPerson = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumnsAddressContactPerson(): ColumnType[] {
    return [
      { field: "hR_EmployeeID", header: this.fieldTitle['employeeid'] },
      { field: "employeeName", header: this.fieldTitle['employeename'] },
      { field: "designation", header: this.fieldTitle['designation'] },
      { field: "organization", header: this.fieldTitle['organization'] },
      { field: "email", header: this.fieldTitle['email'] },
      { field: "contactNo", header: this.fieldTitle['contactno'] },
      { header: this.fieldTitle['action'] }
    ]
  }

  openAddressModal(addressTypeCd: number) {
    const modalConfig = new ModalConfig();
    modalConfig.data = new Address();
    modalConfig.header = 'Address';
    modalConfig.width = '85%';
    this.ref = this.dialogService.open(AddressComponent,modalConfig );

    this.ref.onClose.subscribe((obj: any) => {
      if (obj) {
        this.modelSvc.addAddressList(obj, addressTypeCd);
        this.initGridOptionAddress();
        this.gridOptionAddress.columns = this.gridColumnsAddress();
      }
    });
  }

  getAddressData(orgStructureID: number, addressTypeCd: number){
    try {
      this.dataSvc.getAddressData(orgStructureID, addressTypeCd).subscribe({
        next: (res: any) => {
          this.modelSvc.addressList = [];
          let data = res[res.length - 1] || [];
          data.forEach(e => {
            this.getAddressContactPersonSavedData(e);
          });
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

  getAddressContactPersonSavedData(e){
    try {
      this.dataSvc.getOrgAddressContactPersonData(e.id).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.prepareAddressSaveData(e, data);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { 

        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  openOrganizationModal(addressTypeCd: number) {
     const modalConfig = new ModalConfig(); 
     modalConfig.header='Organization Search';
     modalConfig.width = '45%'; 
     modalConfig.closable=true;
    this.ref = this.dialogService.open(OrganizationSearchComponent,modalConfig);

    this.ref.onClose.subscribe((obj: any) => {
      if (obj) {
        this.getOrganizationStructureAddress(obj, addressTypeCd);
      }
    });
  }

  getOrganizationStructureAddress(id: number, addressTypeCd: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getParentOrgAddress(this.spData, id).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          if(data.length > 0)
          {
            this.modelSvc.modifyAddressListByOrgAddress(data, addressTypeCd);
          }
          else
          {
            this.showMsg("2224");
          }
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

  editAddressInfo(entity: any) {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.data = new Address(GlobalMethods.jsonDeepCopy(entity));
      modalConfig.header = 'Address';
      this.ref = this.dialogService.open(AddressComponent,modalConfig);
      this.ref.onClose.subscribe((obj: any) => {
        if (obj) {
          this.modelSvc.modifyAddressList(obj, entity);
          this.initGridOptionAddress();
          this.gridOptionAddress.columns = this.gridColumnsAddress();
        }
      });
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  deleteAddressInfo(entity: any){
    try {
      this.utilitySvc.showConfirmModal(this.messageCode.confirmDelete).subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.modelSvc.deleteAddressInfo(entity, this.addressTypeCd);
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getParentAddress(addressTypeCd: number) {
    let parentID = this.modelSvc.orgStructureIDParentID;
    if(parentID > 0)
    {
      this.getParentOrgAddress(parentID, addressTypeCd);
    }
  }

  getParentOrgAddress(id: number, addressTypeCd: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getParentOrgAddress(this.spData, id).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];

          if(data.length > 0)
          {
            this.modelSvc.modifyAddressListByOrgAddress(data, addressTypeCd);
          }
          else
          {
            this.showMsg("2225");
          }
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

  saveAddressInfo() {
    try {
      this.saveAddressInfoData(this.modelSvc.addressList);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveAddressInfoData(addrssList: OrgAddressDTO[]) {
    try {
      let messageCode = this.messageCode.editCode;
      
      this.dataSvc.SaveAddressInfo(addrssList).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareAddressDataAfterSave(res.body, this.addressTypeCd);
          this.showMsg(messageCode);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  resetAddressInfo(){
    try {
      this.modelSvc.addressList = GlobalMethods.jsonDeepCopy(this.modelSvc.tempAddressList);
      this.modelSvc.addressListLength = GlobalMethods.jsonDeepCopy(this.modelSvc.tempAddressListLength);
      
      this.modelSvc.addressList.forEach(e => {
        if(e.sourceOrgStructureID == null || e.sourceOrgStructureID == 0)
        {
          this.modelSvc.disableAddressButton = true;
        }
      });

      this.modelSvc.disableAddressRestButton = true;
      this.modelSvc.disableAddressSaveButton = true;

      if(this.modelSvc.addressList.length > 0)
      {
        this.modelSvc.disableOrgAddressButton = true;
        this.modelSvc.disableParentOrgAddressButton = true;
        this.modelSvc.disableAddressButton = true;
      }

      if( this.modelSvc.addressList.length > 0)
        {
          this.modelSvc.addressList.forEach(e => {
            if(e.tag != FixedIDs.objectState.deleted)
            {
              this.modelSvc.disableOrgAddressButton = true;
              this.modelSvc.disableParentOrgAddressButton = true;
              if(this.addressTypeCd == FixedIDs.orgAddressType.General)
              {
                this.modelSvc.disableAddressButton = true;
              }
            }
            else
            {
              this.modelSvc.disableOrgAddressButton = false;
              this.modelSvc.disableParentOrgAddressButton = false;
            }
          });
        }
        else
        {
          this.modelSvc.disableOrgAddressButton = false;
          this.modelSvc.disableParentOrgAddressButton = false;
          this.modelSvc.disableAddressButton = false;
        }
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  showShortAddress(entity: any) {
    try {
      this.isShortAddressModal = true;
      this.shortAddress = entity.shortAddress;
    } catch (e) {
      this.showErrorMsg(e)
    }
  }

  closeShortAddressModal() {
    try {
      this.isShortAddressModal = false;
      this.shortAddress = "";
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  showAddressContactPerson(entity){
    try {
      this.modelSvc.prepareListForDisplayingAddressContactPerson(entity);
      this.isAddressContactPersonModal = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  closeAddressContactPerson() {
    try {
      this.isAddressContactPersonModal = false;
      this.modelSvc.modifyAddressContactPersonOnCloseModal();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addAddressContactPerson(entity: any){
    try {
      const modalConfig = new ModalConfig();
      modalConfig.data = {
        option: 1,
        isActive: true
      };
      this.ref = this.dialogService.open(
        EmployeeListComponent,
        modalConfig
      );
      this.ref.onClose.subscribe((obj: any) => {
        this.modelSvc.modifyAddressContactPerson(obj, entity);
      });
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  deleteAddressContactPerson(entity){
    try {
      this.modelSvc.deleteAddressContactPerson(entity);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


}
