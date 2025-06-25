import { Injectable } from '@angular/core';
import { FixedIDs } from '../../index';
import { OrgBasicDTO, OrgAddressDTO, OrgSocialContactsDTO, OrgContactDetailsDTO } from '../../models/company-information/company-information';
import { GlobalMethods } from 'src/app/shared';
import { Address } from '../../../shared/models/common.model';
import { TreeNode } from "primeng/api";


@Injectable()
export class CompanyInformationModelService {

  orgBasicDTO: OrgBasicDTO;
  tempOrgBasicDTO: OrgBasicDTO;
  orgStructureID: number = 0;
  organizationName: string = "";
  orgStructureIDParentID: number = 0;

  orgSocialContactsDTO: OrgSocialContactsDTO;
  tempOrgSocialContactsDTO: OrgSocialContactsDTO;

  orgAddressDTO: OrgAddressDTO;
  tempOrgAddressDTO: OrgAddressDTO;

  setAddress: Address;
  tempSetAddress: Address;
  setBillingAddress: Address;
  setDeliveryAddress: Address;

  // Mange tab
   basicInfoTab: boolean = true;
   addressTab: boolean = false;
   contactPersonTab: boolean = false;
   billingAddressTab: boolean = false;
   deliveryAddressTab: boolean = false;


  // Basic Info
  socialPlatformList: any = [];
  tempSocialPlatformList: any = [];
  groupList: any = [];
  socialPlatformListLength: number = 0;
  socialPlatformTypeList: any = [];
  disableBasicInfoRestButton: boolean = true;
  disableBasicInfoSaveButton: boolean = true;
 

  // Address Info
  addressList: OrgAddressDTO[] = [];
  addressListLength: number = 0;
  tempAddressList: OrgAddressDTO[] = [];
  tempAddressListLength: number = 0;
  addressContactPersonList: OrgContactDetailsDTO[] = [];
  addressContactPersonListLength: number = 0;
  addressContactPersonListDisplay: OrgContactDetailsDTO[] = [];
  addressEditPermission: boolean = true;
  disableAddressRestButton: boolean = true;
  disableAddressSaveButton: boolean = true;
  disableOrgAddressButton: boolean = false;
  disableParentOrgAddressButton: boolean = false;
  disableAddressButton: boolean = false;



  // Contact Person
  orgContactDetailsDTO: OrgContactDetailsDTO;
  tempOrgContactDetailsDTO: OrgContactDetailsDTO;
  contactDetailsList: OrgContactDetailsDTO[] = [];
  contactDetailsListLength: number = 0;
  tempContactDetailsListList: OrgContactDetailsDTO[] = [];
  tempContactDetailsListLength: number = 0;
  disableContactDetailRestButton: boolean = true;
  disableContactDetailSaveButton: boolean = true;


  orgContactDetailsList: any = [];

  objectState: any = FixedIDs.objectState;

  errorMessageCode = {
    msgCode: "",
  };


  constructor() {  }

  setDefault() {
    try {
      this.orgBasicDTO= new OrgBasicDTO();
      this.tempOrgBasicDTO= new OrgBasicDTO();

      this.orgSocialContactsDTO= new OrgSocialContactsDTO();
      this.tempOrgSocialContactsDTO= new OrgSocialContactsDTO();

      this.orgAddressDTO= new OrgAddressDTO();
      this.tempOrgAddressDTO= new OrgAddressDTO();

      this.setAddress = new Address();

      this.orgContactDetailsDTO = new OrgContactDetailsDTO();
      this.tempOrgContactDetailsDTO = new OrgContactDetailsDTO();

    } catch (error) {
      throw error;
    }
  }

  // parent

  mapObjectProps(data: any[]) {
    try {
      return data.map((x) => {

        return {
          label: x.name,
          key: x.id,
          parentID: x.parentID,
          id: x.id,
          typeCd: x.typeCd,
          selectedNode: false,
          isRoot: false,
          isActive:false,
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  prepareTreeData(arr, parentID) {
    try {
      const master: any[] = [];
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        val.label = val.label;
        if (val.parentID == parentID) {
          const children = this.prepareTreeData(arr, val.key);
          if (children.length) {
            val.children = children;
          }

          master.push(val);
        }
      }
      return master;
    } catch (error) {
      throw error;
    }
  }

  // for org-straucture list

  mapTreeObjectProps(data: any[]) {
    try {
      return data.map((x) => {
        return {
          label: x.name,
          key: x.id,
          parentID: x.parentID,
          id: x.id,
          selectedNode: false,
          isRoot: false,
          styleClass: this.prepareNodeStyle(x)
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  prepareNodeStyle(x) {
    try {
      return (x.textColorCd ? 'color:' + x.textColorCd + ';' : '') + (x.fillColorCd ? 'background:' + x.fillColorCd : '');
    } catch (e) {
      throw e;
    }
  }

  expandTree(node: TreeNode, isExpand: boolean) {
    try{
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandTree(childNode, isExpand);
      });
    }
  } catch (e) {
    throw e;
  }
  }

  findActiveTab(activeIndex: number)
  { 
    try {
      if(activeIndex == 0) // Basic Info
      {
        this.basicInfoTab = true;
        this.addressTab = false;
        this.contactPersonTab = false;
        this.billingAddressTab = false;
        this.deliveryAddressTab = false;
      }
      else if(activeIndex == 1) // Address
      {
        this.basicInfoTab = false;
        this.addressTab = true;
        this.contactPersonTab = false;
        this.billingAddressTab = false;
        this.deliveryAddressTab = false;
      }
      else if(activeIndex == 2)  // Contact Person
      {
        
        this.basicInfoTab = false;
        this.addressTab = false;
        this.contactPersonTab = true;
        this.billingAddressTab = false;
        this.deliveryAddressTab = false;
      }
      else if(activeIndex == 3) // Billing Address
      {
        this.basicInfoTab = false;
        this.addressTab = false;
        this.contactPersonTab = false;
        this.billingAddressTab = true;
        this.deliveryAddressTab = false;
      }
      else if(activeIndex == 4) // Delivery Address
      {
        this.basicInfoTab = false;
        this.addressTab = false;
        this.contactPersonTab = false;
        this.billingAddressTab = false;
        this.deliveryAddressTab = true;
      }
      
    } catch (error) {
      throw error;
    }
  }


  prepareSocialPlatformList() {
    try {
      if(this.socialPlatformList.length == 0)
      {
        let obj = new OrgSocialContactsDTO();
        this.socialPlatformList.entityPush(obj);

        let objTemp = new OrgSocialContactsDTO();
        this.tempSocialPlatformList.entityPush(objTemp);
      }
  
      return;
    } catch (e) {
      throw (e);
    }
  }

  resetandSetTempSocialPlatformList() {
    try {
        this.socialPlatformList = [];

        for (let index = 0; index < this.tempSocialPlatformList.length; index++)
          {
            let obj = new OrgSocialContactsDTO({
              id: this.tempSocialPlatformList[index].id,
              socialPlatformCd: this.tempSocialPlatformList[index].socialPlatformCd,
              contactLink: this.tempSocialPlatformList[index].contactLink,
            });
            this.socialPlatformList.entityPush(obj);
  
          }
          this.socialPlatformListLength = this.socialPlatformList.length;
      return;
    } catch (e) {
      throw (e);
    }
  }

  resetSocialPlatformList() {
    try {
        this.socialPlatformList = [];
        let obj = new OrgSocialContactsDTO();
        this.socialPlatformList.entityPush(obj);
      return;
    } catch (e) {
      throw (e);
    }
  }

  addNewSocilaPlatformList() {
    try {
      let obj = new OrgSocialContactsDTO();
      let deepCopySP = GlobalMethods.jsonDeepCopy(obj);
      this.socialPlatformList.entityPush(deepCopySP);
  
      this.socialPlatformListLength = this.socialPlatformListLength + 1;

      return;
    } catch(e) {
      throw(e);
    }
  }
  
  deleteSocilaPlatform (entity) {
    try {
      this.socialPlatformList.entityPop(entity);
      this.socialPlatformListLength = this.socialPlatformListLength - 1;
  
      return;
    } catch (e) {
      throw (e);
    }
  }

  prepareBasicInfoDataOnPageLoad(obj: any){
    try {
      this.orgBasicDTO = new OrgBasicDTO(obj[0]);
      if(obj[0].mobileNo != null)
      {
        this.orgBasicDTO.mobileNo = obj[0].mobileNo ? obj[0].mobileNo.split(',') : [];
      }
      if(obj[0].telephoneNo != null)
      {
        this.orgBasicDTO.telephoneNo = obj[0].telephoneNo ? obj[0].telephoneNo.split(',') : [];
      }
      if(obj[0].fax != null)
      {
        this.orgBasicDTO.fax = obj[0].fax ? obj[0].fax.split(',') : [];
      }
      if(obj[0].website != null)
      {
        this.orgBasicDTO.website = obj[0].website ? obj[0].website.split(',') : [];
      }
      if(obj[0].whatsAppNo != null)
      {
        this.orgBasicDTO.whatsAppNo = obj[0].whatsAppNo ? obj[0].whatsAppNo.split(',') : [];
      }
    } catch (error) {
      throw error;
    }
  }

  prepareSocialContactsOnPageLoad(entity: any[]){
    try {
      this.socialPlatformList = [];

      if (entity.length > 0) {
        entity.forEach((e) => {

          let obj = new OrgSocialContactsDTO();
          let deepCopySP = GlobalMethods.jsonDeepCopy(obj);

          deepCopySP.id = e.id;
          deepCopySP.orgStructureID = e.orgStructureID;
          deepCopySP.socialPlatformCd = e.socialPlatformCd;
          deepCopySP.contactLink = e.contactLink;

          this.socialPlatformList.push(deepCopySP);
          this.socialPlatformListLength = this.socialPlatformList.length - 1;
        });
      }
    } catch (e) {
      throw e;
    }
  }

  prepareBasicInfoDataBeforeSave(){
    try {
      if(this.orgBasicDTO.mobileNo != null)
      {
        this.orgBasicDTO.mobileNo = this.orgBasicDTO.mobileNo.join(',');
      }
      if(this.orgBasicDTO.telephoneNo != null)
      {
        this.orgBasicDTO.telephoneNo = this.orgBasicDTO.telephoneNo.join(',');
      }
      if(this.orgBasicDTO.fax != null)
      {
        this.orgBasicDTO.fax = this.orgBasicDTO.fax.join(',');
      }
      if(this.orgBasicDTO.website != null)
      {
        this.orgBasicDTO.website = this.orgBasicDTO.website.join(',');
      }
      if(this.orgBasicDTO.whatsAppNo != null)
      {
        this.orgBasicDTO.whatsAppNo = this.orgBasicDTO.whatsAppNo.join(',');
      }
      
      this.prepareSocialContactsBeforeSave();
    } catch (error) {
      throw error;
    }
  }

  prepareSocialContactsBeforeSave(){
    try {
      this.orgBasicDTO.orgSocialContactsList = [];
      if (this.socialPlatformList.length > 0) {
        this.socialPlatformList.forEach((e) => { 
          if(e.contactLink != null) 
          {
            e.orgStructureID = this.orgBasicDTO.orgStructureID;
            this.orgBasicDTO.orgSocialContactsList.push(e);
          }
        });
      }
    } catch (e) {
      throw e;
    }
  }

  prepareAddressSaveData(e, data){
    try {
      this.orgAddressDTO = new OrgAddressDTO(e);
      if(e.sourceOrgStructureID == null || e.sourceOrgStructureID == 0)
      {
        this.orgAddressDTO.setAddressDTO = new Address(e);
        this.orgAddressDTO.setAddressDTO.id = e.addressID;
        this.disableAddressButton = true;
      }
      
      data.forEach(entity => {
        let obj = new OrgContactDetailsDTO(entity);
        this.orgAddressDTO.orgContactDetailsList.push(obj);
      });

      this.addressList.push(this.orgAddressDTO);
      this.addressListLength = this.addressListLength + 1;

      this.tempAddressList = GlobalMethods.jsonDeepCopy(this.addressList);
      this.tempAddressListLength = GlobalMethods.jsonDeepCopy(this.addressListLength);


      if( this.addressList.length > 0)
      {
        this.addressList.forEach(e => {
          if(e.tag != FixedIDs.objectState.deleted)
          {
            this.disableOrgAddressButton = true;
            this.disableParentOrgAddressButton = true;
            this.disableAddressButton = true;
          }
          else
          {
            this.disableOrgAddressButton = false;
            this.disableParentOrgAddressButton = false;
            this.disableAddressButton = false;
          }
        });
      }
      else
      {
        this.disableOrgAddressButton = false;
        this.disableParentOrgAddressButton = false;
        this.disableAddressButton = false;
      }
    } catch (error) {
      throw error;
    }
  }

  addAddressList(data: any, addressTypeCd: number){
    try {
      this.addressEditPermission = true;

      let obj = new OrgAddressDTO(data);
      obj.id = 0;
      obj.setAddressDTO = new Address(data);
      obj.setAddressDTO.locationID = obj.locationID;
      obj.setAddressDTO.tag = FixedIDs.objectState.added;
      obj.orgStructureID = this.orgStructureID;
      obj.addressTypeCd = addressTypeCd;
      obj.organizationName= this.organizationName;

      this.addressList.entityPush(obj);

      this.addressListLength = this.addressListLength + 1;

      this.disableAddressRestButton = false;
      this.disableAddressSaveButton = false;

      if( this.addressList.length > 0)
      {
        this.addressList.forEach(e => {
          if(e.tag != FixedIDs.objectState.deleted)
          {
            this.disableOrgAddressButton = true;
            this.disableParentOrgAddressButton = true;
            this.disableAddressButton = true;
          }
          else
          {
            this.disableOrgAddressButton = false;
            this.disableParentOrgAddressButton = false;
            this.disableAddressButton = false;
          }
        });
      }
      else
      {
        this.disableOrgAddressButton = false;
        this.disableParentOrgAddressButton = false;
        this.disableAddressButton = false;
      }

    } catch (error) {
      throw error;
    }
  }

  modifyAddressListByOrgAddress(data: any, addressTypeCd: number){
    try { 
      this.addressEditPermission = false;

      let obj = new OrgAddressDTO(data[0]);
      obj.id = 0;
      obj.orgStructureID = this.orgStructureID;
      obj.sourceOrgStructureID= data[0].orgStructureID;
      obj.hasChangePermission= this.addressEditPermission;
      obj.addressTypeCd = addressTypeCd;
      obj.addressEditPermission= this.addressEditPermission;

      this.addressList.entityPush(obj);
      this.addressListLength = this.addressListLength + 1;

      this.disableAddressRestButton = false;
      this.disableAddressSaveButton = false;


      if( this.addressList.length > 0)
      {
        this.addressList.forEach(e => {
          if(e.tag != FixedIDs.objectState.deleted)
          {
            this.disableOrgAddressButton = true;
            this.disableParentOrgAddressButton = true;
            if(addressTypeCd == FixedIDs.orgAddressType.General)
            {
              this.disableAddressButton = true;
            }
          }
          else
          {
            this.disableOrgAddressButton = false;
            this.disableParentOrgAddressButton = false;
            this.disableAddressButton = false;
          }
        });
      }
      else
      {
        this.disableOrgAddressButton = false;
        this.disableParentOrgAddressButton = false;
        this.disableAddressButton = false;
      }
     
    } catch (error) {
      throw error;
    }
  }

  modifyAddressList(data, entity){
    try {
      this.orgAddressDTO = GlobalMethods.jsonDeepCopy(entity);

      this.orgAddressDTO.setAddressDTO = data;
      this.orgAddressDTO.setAddressDTO.id = entity.addressID;
      this.orgAddressDTO.addressLine1= data.addressLine1;
      this.orgAddressDTO.addressLine2= data.addressLine2;
      this.orgAddressDTO.village= data.village;
      this.orgAddressDTO.postOffice= data.postOffice;
      this.orgAddressDTO.pOBox= data.pOBox;
      this.orgAddressDTO.zip= data.zip;
      this.orgAddressDTO.thana= data.thana;
      this.orgAddressDTO.district= data.district;
      this.orgAddressDTO.division= data.division;
      this.orgAddressDTO.city= data.city;
      this.orgAddressDTO.state= data.state;
      this.orgAddressDTO.country= data.country;
      this.orgAddressDTO.shortAddress= data.shortAddress;

      const index = this.addressList.findIndex(item => item.id === entity.id);
      if (index !== -1) {
        this.addressList.splice(index, 1);
      }

      if(entity.tag == 0)
      {
        this.orgAddressDTO.setAddressDTO.tag = FixedIDs.objectState.modified;
        this.addressList.entityPush(this.orgAddressDTO);
        this.addressList.find(x=> x.id == entity.id).tag = FixedIDs.objectState.modified;
      }
      else
      {
        this.addressList.push(this.orgAddressDTO);
      }

      this.disableAddressRestButton = false;
      this.disableAddressSaveButton = false;

    } catch (error) {
      throw error;
    }
  }

  deleteAddressInfo(entity, addressTypeCd){
    try {
      this.orgStructureIDParentID;
      if(entity.setAddressDTO != null)
      {
        entity.setAddressDTO.tag = FixedIDs.objectState.deleted;
        this.disableAddressButton = false;
      }

      this.addressList.entityPop(entity);
      this.addressListLength = this.addressListLength - 1;

      this.disableAddressRestButton = false;
      this.disableAddressSaveButton = false;
      
      
      if( this.addressList.length > 0)
      {
        this.addressList.forEach(e => {
          if(e.tag != FixedIDs.objectState.deleted)
          {
            this.disableOrgAddressButton = true;
            this.disableParentOrgAddressButton = true;
            if(addressTypeCd == FixedIDs.orgAddressType.General)
            {
              this.disableAddressButton = true;
            }
          }
          else
          {
            this.disableOrgAddressButton = false;
            this.disableParentOrgAddressButton = false;
          }
        });
      }
      else
      {
        this.disableOrgAddressButton = false;
        this.disableParentOrgAddressButton = false;
        this.disableAddressButton = false;
      }

    } catch (error) {
      throw error;
    }
  }

  prepareAddressDataAfterSave(addressList, addressTypeCd) {
    try {
      this.addressList = addressList;

      this.addressList.forEach(e => {
        e.orgContactDetailsList.forEach(entity => {
          if(entity.id > 0 && entity.tag == FixedIDs.objectState.deleted)
          {
            entity.isDeleted = true;
          }
        });
        if(e.id > 0 && e.tag == FixedIDs.objectState.deleted)
        {
          e.isDeleted = true;
        }
      });
      this.tempAddressList = GlobalMethods.jsonDeepCopy(this.addressList);

      this.disableAddressRestButton = true;
      this.disableAddressSaveButton = true;
      

      if( this.addressList.length > 0)
      {
        this.addressList.forEach(e => {
          if(e.tag != FixedIDs.objectState.deleted)
          {
            this.disableOrgAddressButton = true;
            this.disableParentOrgAddressButton = true;
            this.disableAddressButton = true;
          }
          else
          {
            this.disableOrgAddressButton = false;
            this.disableParentOrgAddressButton = false;
            this.disableAddressButton = false;
          }
        });
      }
      else
      {
        this.disableOrgAddressButton = false;
        this.disableParentOrgAddressButton = false;
        this.disableAddressButton = false;
      }
    } catch (e) {
      throw e;
    }
  }


  modifyAddressContactPerson(data, entity) {
    try {
      let obj = new OrgContactDetailsDTO(data);
      obj.id = 0;
      obj.employeeID = data.id;
      if(entity.sourceOrgStructureID != null)
      {
        obj.orgStructureID = entity.sourceOrgStructureID;
      }
      else
      {
        obj.orgStructureID = entity.orgStructureID;
      }
      entity.orgContactDetailsList.entityPush(obj);
      this.addressContactPersonListLength = this.addressContactPersonListLength + 1;

      this.disableAddressRestButton = false;
      this.disableAddressSaveButton = false;
      
    } catch (error) {
      throw error;
    }
  }

  prepareListForDisplayingAddressContactPerson(entity){
    try {
      this.addressContactPersonListDisplay = GlobalMethods.jsonDeepCopy(entity.orgContactDetailsList);
      this.orgAddressDTO = entity;
    } catch (error) {
      throw error;
    }
  }

  deleteAddressContactPerson(entity){
    try {
      this.addressContactPersonListDisplay.entityPop(entity);
      this.disableAddressRestButton = false;
      this.disableAddressSaveButton = false;
    } catch (error) {
      throw error;
    }
  }

  modifyAddressContactPersonOnCloseModal(){
    try {
      this.orgAddressDTO.orgContactDetailsList = GlobalMethods.jsonDeepCopy(this.addressContactPersonListDisplay);
    } catch (error) {
      throw error;
    }
  }

  addContactDetails(data){
    try {
      let obj = new OrgContactDetailsDTO(data);
      obj.id = 0;
      obj.orgStructureID = this.orgStructureID;
      obj.employeeID = data.id;

      this.contactDetailsList.entityPush(obj);
      this.contactDetailsListLength = this.contactDetailsListLength + 1;

      this.disableContactDetailRestButton = false;
      this.disableContactDetailSaveButton = false;
    } catch (error) {
      throw error;
    }
  }

  deleteContactDetails(entity){
    try {
      this.contactDetailsList.entityPop(entity);
      this.contactDetailsListLength = this.contactDetailsListLength - 1;

      this.disableContactDetailRestButton = false;
      this.disableContactDetailSaveButton = false;

    } catch (error) {
      throw error;
    }
  }

  prepareContactDetailsDataAfterSave(contactDetailsList) {
    try {
      this.contactDetailsList = contactDetailsList;

      this.contactDetailsList.forEach(e => {
        if(e.id > 0 && e.tag == FixedIDs.objectState.deleted)
        {
          e.isDeleted = true;
        }
      });

      this.tempContactDetailsListList = GlobalMethods.jsonDeepCopy(this.contactDetailsList);

      this.disableContactDetailRestButton = true;
      this.disableContactDetailSaveButton = true;
    } catch (e) {
      throw e;
    }
  }

  prepareContactDetailsSaveData(data){
    try {
      data.forEach(entity => {
        let obj = new OrgContactDetailsDTO(entity);
        this.contactDetailsList.push(obj);
        this.contactDetailsListLength = this.contactDetailsListLength + 1;
      });

      this.tempContactDetailsListList = GlobalMethods.jsonDeepCopy(this.contactDetailsList);
      this.tempContactDetailsListLength = GlobalMethods.jsonDeepCopy(this.contactDetailsListLength);
    } catch (error) {
      throw error;
    }
  }


  // Customs validation start

  mobileNoValidation(valueLength, allMobileNumbersCount, mobileRegex, mobileNumber){
    // Check if the individual mobile number exceeds 20 characters
    if (valueLength > 20) {
      this.orgBasicDTO.mobileNo.pop();
      this.errorMessageCode.msgCode = "2228";
      return this.errorMessageCode.msgCode;
    }

    // Check if the total number of mobile numbers exceeds 5
    if (allMobileNumbersCount > 5) {
        this.orgBasicDTO.mobileNo.pop();
        this.errorMessageCode.msgCode = "2229";
        return this.errorMessageCode.msgCode;
    }

    // Check the mobile number valid or not
    if (!mobileRegex.test(mobileNumber)) {
        this.orgBasicDTO.mobileNo.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }

    // Check for multiple instances of the same value
    const duplicateCount = this.orgBasicDTO.mobileNo.filter(e => e === mobileNumber && allMobileNumbersCount > 1).length;
    if (duplicateCount > 1) {
      this.orgBasicDTO.mobileNo.pop();
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }
  }


  telephoneNoValidation(valueLength, allTelephoneNumbersCount, telephoneRegex, telephoneNumber){
    // Check if the individual telephone number exceeds 20 characters
    if (valueLength > 20) {
      this.orgBasicDTO.telephoneNo.pop();
      this.errorMessageCode.msgCode = "2228";
      return this.errorMessageCode.msgCode;
    }

    // Check if the total number of telephone numbers exceeds 5
    if (allTelephoneNumbersCount > 5) {
        this.orgBasicDTO.telephoneNo.pop();
        this.errorMessageCode.msgCode = "2229";
        return this.errorMessageCode.msgCode;
    }

    // Check the telephone number valid or not
    if (!telephoneRegex.test(telephoneNumber)) {
        this.orgBasicDTO.telephoneNo.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }

    // Check for multiple instances of the same value
    const duplicateCount = this.orgBasicDTO.telephoneNo.filter(e => e === telephoneNumber && allTelephoneNumbersCount > 1).length;
    if (duplicateCount > 1) {
      this.orgBasicDTO.telephoneNo.pop();
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }
  }

  faxValidation(valueLength, allFaxNumbersCount, faxRegex, faxNumber){
    // Check if the individual fax number exceeds 20 characters
    if (valueLength > 20) {
      this.orgBasicDTO.fax.pop();
      this.errorMessageCode.msgCode = "2228";
      return this.errorMessageCode.msgCode;
    }

    // Check if the total number of fax numbers exceeds 5
    if (allFaxNumbersCount > 5) {
      this.orgBasicDTO.fax.pop();
      this.errorMessageCode.msgCode = "2228";
    }

    // Check the fax number valid or not
    if (!faxRegex.test(faxNumber)) {
      this.orgBasicDTO.fax.pop();
      this.errorMessageCode.msgCode = "2228";
      return this.errorMessageCode.msgCode;
    }

    // Check for multiple instances of the same value
    const duplicateCount = this.orgBasicDTO.fax.filter(e => e === faxNumber && allFaxNumbersCount > 1).length;
    if (duplicateCount > 1) {
      this.orgBasicDTO.fax.pop();
      this.errorMessageCode.msgCode = "2228";
      return this.errorMessageCode.msgCode;
    }
  }

  websiteValidation(valueLength, allWebsiteNumbersCount, websiteRegex, websiteNumber){
    
    // Check if the individual website exceeds 50 characters
    if (valueLength > 50) {
      this.orgBasicDTO.website.pop();
      this.errorMessageCode.msgCode = "2233";
      return this.errorMessageCode.msgCode;
    }

    // Check if the total number of website exceeds 5
    if (allWebsiteNumbersCount > 5) {
      this.orgBasicDTO.website.pop();
      this.errorMessageCode.msgCode = "2234";
      return this.errorMessageCode.msgCode;
    }

    // Check the website valid or not
    if (!websiteRegex.test(websiteNumber)) {
      this.orgBasicDTO.website.pop();
      this.errorMessageCode.msgCode = "2230";
      return this.errorMessageCode.msgCode;
    }

    // Check for multiple instances of the same value
    const duplicateCount = this.orgBasicDTO.website.filter(e => e === websiteNumber && allWebsiteNumbersCount > 1).length;
    if (duplicateCount > 1) {
      this.orgBasicDTO.website.pop();
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }
  }

  whatsAppNoValidation(valueLength, allWhatsAppNumbersCount, whatsAppRegex, whatsAppNumber){
    // Check if the individual whatsApp number exceeds 20 characters
    if (valueLength > 20) {
        this.orgBasicDTO.whatsAppNo.pop();
        this.errorMessageCode.msgCode = "2228";
        return this.errorMessageCode.msgCode;
    }
    
    // Check if the total number of whatsApp numbers exceeds 5
    if (allWhatsAppNumbersCount > 5) {
        this.orgBasicDTO.whatsAppNo.pop();
        this.errorMessageCode.msgCode = "2229";
        return this.errorMessageCode.msgCode;
    }

    // Check the whatsApp number valid or not
    if (!whatsAppRegex.test(whatsAppNumber)) {
        this.orgBasicDTO.whatsAppNo.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }

    // Check for multiple instances of the same value
    const duplicateCount = this.orgBasicDTO.whatsAppNo.filter(e => e === whatsAppNumber && allWhatsAppNumbersCount > 1).length;
    if (duplicateCount > 1) {
      this.orgBasicDTO.whatsAppNo.pop();
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }
  }

  addMobileNoChipManually(value: string) {

    if(this.orgBasicDTO.mobileNo == null)
    {
      this.orgBasicDTO.mobileNo = [];
    }

    // Check for duplicate data
    const isDuplicate = this.orgBasicDTO.mobileNo.some(e => e === value && this.orgBasicDTO.mobileNo.length > 1);
    if (isDuplicate) {
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode; 
    }

    this.orgBasicDTO.mobileNo.push(value);

    const valueLength = value.length;
    const allMobileNumbersCount = this.orgBasicDTO.mobileNo.length;
    const mobileNumber = value;
    const mobileRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for mobile number

    // Check if the individual mobile number exceeds 20 characters
    if (valueLength > 20) {
        this.orgBasicDTO.mobileNo.pop();
        this.errorMessageCode.msgCode = "2228";
        return this.errorMessageCode.msgCode;
    }

    // Check if the total number of mobile numbers exceeds 5
    if (allMobileNumbersCount > 5) {
        this.orgBasicDTO.mobileNo.pop();
        this.errorMessageCode.msgCode = "2229";
        return this.errorMessageCode.msgCode;
    }

    // Check the mobile number valid or not
    if (!mobileRegex.test(mobileNumber)) {
        this.orgBasicDTO.mobileNo.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }

  }

  addTelephoneNoChipManually(value: string) {

    if(this.orgBasicDTO.telephoneNo == null)
    {
      this.orgBasicDTO.telephoneNo = [];
    }

    // Check for duplicate data
    const isDuplicate = this.orgBasicDTO.telephoneNo.some(e => e === value && this.orgBasicDTO.telephoneNo.length > 1);
    if (isDuplicate) {
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }

    this.orgBasicDTO.telephoneNo.push(value);

    const valueLength = value.length;
    const allTelephoneNumbersCount = this.orgBasicDTO.telephoneNo.length;
    const telephoneNumber = value;
    const telephoneRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for telephone number

    // Check if the individual telephone number exceeds 20 characters
    if (valueLength > 20) {
        this.orgBasicDTO.telephoneNo.pop();
        this.errorMessageCode.msgCode = "2228";
        return this.errorMessageCode.msgCode;
    }

    // Check if the total number of telephone numbers exceeds 5
    if (allTelephoneNumbersCount > 5) {
        this.orgBasicDTO.telephoneNo.pop();
        this.errorMessageCode.msgCode = "2229";
        return this.errorMessageCode.msgCode;
    }

    // Check the telephone number valid or not
    if (!telephoneRegex.test(telephoneNumber)) {
        this.orgBasicDTO.telephoneNo.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }
  }

  addFaxChipManually(value: string) {

    if(this.orgBasicDTO.fax == null)
    {
      this.orgBasicDTO.fax = [];
    }

    // Check for duplicate data
    const isDuplicate = this.orgBasicDTO.fax.some(e => e === value && this.orgBasicDTO.fax.length > 1);
    if (isDuplicate) {
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }

    this.orgBasicDTO.fax.push(value);

    const valueLength = value.length;
    const allFaxNumbersCount = this.orgBasicDTO.fax.length;
    const faxNumber = value;

    const faxRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for fax number

    // Check if the individual fax number exceeds 20 characters
    if (valueLength > 20) {
        this.orgBasicDTO.fax.pop();
        this.errorMessageCode.msgCode = "2231";
        return this.errorMessageCode.msgCode;
    }

    // Check if the total number of fax numbers exceeds 5
    if (allFaxNumbersCount > 5) {
        this.orgBasicDTO.fax.pop();
        this.errorMessageCode.msgCode = "2232";
        return this.errorMessageCode.msgCode;
    }

    // Check the fax number valid or not
    if (!faxRegex.test(faxNumber)) {
        this.orgBasicDTO.fax.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }

  }

  addWebsiteChipManually(value: string) {

    if(this.orgBasicDTO.website == null)
    {
      this.orgBasicDTO.website = [];
    }

    // Check for duplicate data
    const isDuplicate = this.orgBasicDTO.website.some(e => e === value && this.orgBasicDTO.website.length > 1);
    if (isDuplicate) {
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }

    this.orgBasicDTO.website.push(value);

    const valueLength = value.length;
    const allWebsiteNumbersCount = this.orgBasicDTO.website.length;
    const websiteNumber = value;
    const websiteRegex = new RegExp(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/[^\s]*)?$/); // Regex for website

    // Check if the individual website exceeds 50 characters
    if (valueLength > 50) {
        this.orgBasicDTO.website.pop();
        this.errorMessageCode.msgCode = "2233";
        return this.errorMessageCode.msgCode;
    }

    // Check if the total number of website exceeds 5
    if (allWebsiteNumbersCount > 5) {
        this.orgBasicDTO.website.pop();
        this.errorMessageCode.msgCode = "2234";
        return this.errorMessageCode.msgCode;
    }

    // Check the website valid or not
    if (!websiteRegex.test(websiteNumber)) {
        this.orgBasicDTO.website.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }

  }

  addWhatsAppNoChipManually(value: string) {

    if(this.orgBasicDTO.whatsAppNo == null)
    {
      this.orgBasicDTO.whatsAppNo = [];
    }

    // Check for duplicate data
    const isDuplicate = this.orgBasicDTO.whatsAppNo.some(e => e === value && this.orgBasicDTO.whatsAppNo.length > 1);
    if (isDuplicate) {
      this.errorMessageCode.msgCode = "2237";
      return this.errorMessageCode.msgCode;
    }

    this.orgBasicDTO.whatsAppNo.push(value);

    const valueLength =value.length;
    const allWhatsAppNumbersCount = this.orgBasicDTO.whatsAppNo.length;
    const whatsAppNumber = value;

    const whatsAppRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for whatsApp number

    // Check if the individual whatsApp number exceeds 20 characters
    if (valueLength > 20) {
        this.orgBasicDTO.whatsAppNo.pop();
        this.errorMessageCode.msgCode = "2228";
        return this.errorMessageCode.msgCode;
    }

    // Check if the total number of whatsApp numbers exceeds 5
    if (allWhatsAppNumbersCount > 5) {
        this.orgBasicDTO.whatsAppNo.pop();
        this.errorMessageCode.msgCode = "2229";
        return this.errorMessageCode.msgCode;
    }

    // Check the whatsApp number valid or not
    if (!whatsAppRegex.test(whatsAppNumber)) {
        this.orgBasicDTO.whatsAppNo.pop();
        this.errorMessageCode.msgCode = "2230";
        return this.errorMessageCode.msgCode;
    }

  }

}
