import { Component, OnInit,EventEmitter, Input, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { UntypedFormGroup, NgForm } from '@angular/forms';
import { OrgBasicDTO, OrgSocialContactsDTO, socialContactValidation, basicInfoValidation } from '../../models/company-information/company-information';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs } from '../../../shared';


import {
  ProviderService,
  QueryData,
  BaseComponent,
  ValidatorDirective,
  CompanyInformationDataService,
  CompanyInformationModelService,
  ORGStructureModelService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-basic-information',
  templateUrl: './basic-information.component.html',
  providers: [CompanyInformationModelService, CompanyInformationDataService, ORGStructureModelService],
  standalone:true,
  imports:[SharedModule]
})
export class BasicInformationComponent extends BaseComponent implements OnInit {
  @Input() orgStructureID: number = 0;
  @Input() organizationName: string = "";
  @Input() addressTypeCd: number = 0;
  @Input() orgStructureIDParentID: number = 0;
  
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("basicInfoForm", { static: true, read: NgForm }) basicInfoForm: NgForm;
  
  spData: any = new QueryData();
  isSubmited: boolean = false;

  public validationMsgObjBasicInfo: any;
  public validationMsgObjSocialPlatform: any;
  socialPlatformGridOption: GridOption;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CompanyInformationModelService,
    private dataSvc: CompanyInformationDataService,
    public orgModelSvc: ORGStructureModelService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObjBasicInfo = basicInfoValidation();
    this.validationMsgObjSocialPlatform = socialContactValidation();
  }

  ngOnInit(): void {
    this.initGridOptionSocialPlatform();
    this.getSocialPlatformTypeList();
    this.setDeafult();
    setTimeout(() => {
      this.basicInfoForm.form.markAsPristine();
    }, 50);
  }

  setDeafult(){
    this.modelSvc.orgBasicDTO= new OrgBasicDTO();
    this.modelSvc.tempOrgBasicDTO= new OrgBasicDTO();
    this.modelSvc.orgSocialContactsDTO= new OrgSocialContactsDTO();
    this.modelSvc.tempOrgSocialContactsDTO= new OrgSocialContactsDTO();

    this.modelSvc.organizationName = this.organizationName;
    this.modelSvc.orgStructureID = this.orgStructureID;
    this.getBasicInfoData(this.orgStructureID);
    this.modelSvc.prepareSocialPlatformList();
  }

  initGridOptionSocialPlatform() {
    try {
      const gridObj = {
        dataSource: "modelSvc.socialPlatformList",
        columns: this.gridColumnsSP(),
        isGlobalSearch: false,
        paginator: false,
      } as GridOption;
      this.socialPlatformGridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumnsSP(): ColumnType[] {
    return [
      { field: "socialPlatformCd", header: this.fieldTitle['socialplatform'], style: "" },
      { field: "contactLink", header: this.fieldTitle['contactlink'], style: "" },
      { header: this.fieldTitle["action"], style: "" },
    ];
  }

  getSocialPlatformTypeList() {
    this.modelSvc.socialPlatformTypeList = FixedIDs.getList(FixedIDs.socialPlatformType);
  }

  getBasicInfoData(orgStructureID: number){
    try {
      this.dataSvc.getBasicInfoData(orgStructureID).subscribe({
        next: (res: any) => {
          let obj = res[res.length - 1] || [];

          if(obj.length > 0)
          {
            this.modelSvc.prepareBasicInfoDataOnPageLoad(obj);
            this.getSocialContactsData(obj[0].orgStructureID);
          }
          else
          {
            this.modelSvc.orgBasicDTO = new OrgBasicDTO();
            this.modelSvc.orgBasicDTO.orgStructureID = this.modelSvc.orgStructureID;
            this.modelSvc.socialPlatformList = [];
            this.modelSvc.socialPlatformListLength = 0;
            this.modelSvc.prepareSocialPlatformList();
          }

          this.basicInfoForm.form.markAsPristine();
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

  getSocialContactsData(orgStructureID: number){
    try {
      this.dataSvc.getSocialContactsData(orgStructureID).subscribe({
        next: (res: any) => {
          let obj = res[res.length - 1] || [];

          if(obj.length > 0)
          {
            this.modelSvc.prepareSocialContactsOnPageLoad(obj);
          }
          else
          {
            this.modelSvc.socialPlatformList = [];
            this.modelSvc.socialPlatformListLength = 0;
            this.modelSvc.prepareSocialPlatformList();
          }
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

  showSocilaPlatformPlusBtn (id:number) {
    try { 
        let filterData = this.modelSvc.socialPlatformList.filter(f => f.tag != FixedIDs.objectState.deleted);
        let lastData = filterData[filterData.length - 1];
        if(lastData.id == id)
        {
          return true;
        }
        else{
          return false;
        }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  addNewSocilaPlatform() {
    try {
      this.modelSvc.addNewSocilaPlatformList();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  deleteSocilaPlatform(entity: any) {
    try {
      this.modelSvc.deleteSocilaPlatform(entity); 
      this.basicInfoForm.form.markAsDirty();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveBasicInfo(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      if(this.modelSvc.orgStructureID == 0)
      {
        this.showMsg("2227");
        return;
      }
      else
      {
        this.modelSvc.prepareBasicInfoDataBeforeSave();
        this.saveBasicInfoData(this.modelSvc.orgBasicDTO);
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveBasicInfoData(orgBasicDTO: OrgBasicDTO) {
    try {
      let messageCode = orgBasicDTO.id > 0 ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.SaveBasicInfo(orgBasicDTO).subscribe({
        next: (res: any) => {
          this.getBasicInfoData(this.orgStructureID);
          this.modelSvc.resetSocialPlatformList();
          this.modelSvc.prepareSocialPlatformList();
          this.showMsg(messageCode);

          setTimeout(() => {
            this.basicInfoForm.form.markAsPristine();
          }, 50);
        },
        error: (res: any) => {
          this.showMsg(this.messageCode.duplicateEntry);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  resetBasicInfo(){
    try {
      this.setDeafult();
      this.basicInfoForm.form.markAsPristine();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  
  // Custom validations for chips --- start

  mobileNoValidation($event: any) {
    const valueLength = $event.value.length;
    const allMobileNumbersCount = this.modelSvc.orgBasicDTO.mobileNo.length;
    const mobileNumber = $event.value;
    const mobileRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for mobile number

    let msgCode = this.modelSvc.mobileNoValidation(valueLength, allMobileNumbersCount, mobileRegex, mobileNumber);

    if(msgCode){
      this.showMsg(msgCode);
    }
  }

  telephoneNoValidation($event: any) {
    const valueLength = $event.value.length;
    const allTelephoneNumbersCount = this.modelSvc.orgBasicDTO.telephoneNo.length;
    const telephoneNumber = $event.value;
    const telephoneRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for telephone number

    let msgCode = this.modelSvc.telephoneNoValidation(valueLength, allTelephoneNumbersCount, telephoneRegex, telephoneNumber);

    if(msgCode){
      this.showMsg(msgCode);
    }
  }

  faxValidation($event: any) {
    const valueLength = $event.value.length;
    const allFaxNumbersCount = this.modelSvc.orgBasicDTO.fax.length;
    const faxNumber = $event.value;

    const faxRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for fax number

    let msgCode = this.modelSvc.faxValidation(valueLength, allFaxNumbersCount, faxRegex, faxNumber);

    if(msgCode){
      this.showMsg(msgCode);
    }
  }

  websiteValidation($event: any) {
    const valueLength = $event.value.length;
    const allWebsiteNumbersCount = this.modelSvc.orgBasicDTO.website.length;
    const websiteNumber = $event.value;
    const websiteRegex = new RegExp(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/[^\s]*)?$/); // Regex for website


    let msgCode = this.modelSvc.websiteValidation(valueLength, allWebsiteNumbersCount, websiteRegex, websiteNumber);

    if(msgCode){
      this.showMsg(msgCode);
    }
  }

  whatsAppNoValidation($event: any) {
    const valueLength = $event.value.length;
    const allWhatsAppNumbersCount = this.modelSvc.orgBasicDTO.whatsAppNo.length;
    const whatsAppNumber = $event.value;

    const whatsAppRegex = new RegExp(/^\+?[1-9]\d{1,14}$/); // Regex for whatsApp number

    let msgCode = this.modelSvc.whatsAppNoValidation(valueLength, allWhatsAppNumbersCount, whatsAppRegex, whatsAppNumber);

    if(msgCode){
      this.showMsg(msgCode);
    }
  }


  // Custom validations for chips --- end


  // Cutom Chips entry onFocusOut, space, tab and add validation --- Start

  mobileNoValidationFocusout(event: any) {
    const inputEl = event.target;
    if (inputEl.value) {
      let msgCode = this.modelSvc.addMobileNoChipManually(inputEl.value); // Add Chip Manually
      inputEl.value = '';  // Clear the input after adding the chip
      if(msgCode){
        this.showMsg(msgCode);
      }
    }
    this.basicInfoForm.form.markAsDirty();
  }

  handleKeyDownMobileNo(event: any) {
    // Check if the key pressed is space or tab
    if (event.key === ' ' || event.key === 'Tab') {
      event.preventDefault();  // Prevent the default action of space or tab

      // If there's a value, add the chip manually
      const inputEl = event.target;
      if (inputEl.value.trim()) {
        let msgCode = this.modelSvc.addMobileNoChipManually(inputEl.value.trim());  // Add Chip Manually
        inputEl.value = '';  // Clear the input after adding the chip
        if(msgCode){
          this.showMsg(msgCode);
        }
      }
    }

    this.basicInfoForm.form.markAsDirty();
  }


  telephoneNoValidationFocusout(event: any) {
    const inputEl = event.target;
    if (inputEl.value) {
      let msgCode = this.modelSvc.addTelephoneNoChipManually(inputEl.value); // Add Chip Manually
      inputEl.value = '';  // Clear the input after adding the chip
      if(msgCode){
        this.showMsg(msgCode);
      }
    }
    this.basicInfoForm.form.markAsDirty();
  }

  handleKeyDownTelephoneNo(event: any) {
    // Check if the key pressed is space or tab
    if (event.key === ' ' || event.key === 'Tab') {
      event.preventDefault();  // Prevent the default action of space or tab

      // If there's a value, add the chip manually
      const inputEl = event.target;
      if (inputEl.value.trim()) {
        let msgCode = this.modelSvc.addTelephoneNoChipManually(inputEl.value.trim());  // Add Chip Manually
        inputEl.value = '';  // Clear the input after adding the chip
        if(msgCode){
          this.showMsg(msgCode);
        }
      }
    }

    this.basicInfoForm.form.markAsDirty();
  }



  faxValidationFocusout(event: any) {
    const inputEl = event.target;
    if (inputEl.value) {
      let msgCode = this.modelSvc.addFaxChipManually(inputEl.value); // Add Chip Manually
      inputEl.value = '';  // Clear the input after adding the chip
      if(msgCode){
        this.showMsg(msgCode);
      }
    }
    this.basicInfoForm.form.markAsDirty();
  }

  handleKeyDownFax(event: any) {
    // Check if the key pressed is space or tab
    if (event.key === ' ' || event.key === 'Tab') {
      event.preventDefault();  // Prevent the default action of space or tab

      // If there's a value, add the chip manually
      const inputEl = event.target;
      if (inputEl.value.trim()) {
        let msgCode = this.modelSvc.addFaxChipManually(inputEl.value.trim());  // Add Chip Manually
        inputEl.value = '';  // Clear the input after adding the chip
        if(msgCode){
          this.showMsg(msgCode);
        }
      }
    }

    this.basicInfoForm.form.markAsDirty();
  }


  websiteValidationFocusout(event: any) {
    const inputEl = event.target;
    if (inputEl.value) {
      let msgCode = this.modelSvc.addWebsiteChipManually(inputEl.value); // Add Chip Manually
      inputEl.value = '';  // Clear the input after adding the chip
      if(msgCode){
        this.showMsg(msgCode);
      }
    }
    this.basicInfoForm.form.markAsDirty();
  }

  handleKeyDownWebsite(event: any) {
    // Check if the key pressed is space or tab
    if (event.key === ' ' || event.key === 'Tab') {
      event.preventDefault();  // Prevent the default action of space or tab

      // If there's a value, add the chip manually
      const inputEl = event.target;
      if (inputEl.value.trim()) {
        let msgCode = this.modelSvc.addWebsiteChipManually(inputEl.value.trim());  // Add Chip Manually
        inputEl.value = '';  // Clear the input after adding the chip
        if(msgCode){
          this.showMsg(msgCode);
        }
      }
    }

    this.basicInfoForm.form.markAsDirty();
  }


  whatsAppNoValidationFocusout(event: any) {
    const inputEl = event.target;
    if (inputEl.value) {
      let msgCode = this.modelSvc.addWhatsAppNoChipManually(inputEl.value); // Add Chip Manually
      inputEl.value = '';  // Clear the input after adding the chip
      if(msgCode){
        this.showMsg(msgCode);
      }
    }
    this.basicInfoForm.form.markAsDirty();
  }

  handleKeyDownWhatsAppNo(event: any) {
    // Check if the key pressed is space or tab
    if (event.key === ' ' || event.key === 'Tab') {
      event.preventDefault();  // Prevent the default action of space or tab

      // If there's a value, add the chip manually
      const inputEl = event.target;
      if (inputEl.value.trim()) {
        let msgCode = this.modelSvc.addWhatsAppNoChipManually(inputEl.value.trim());  // Add Chip Manually
        inputEl.value = '';  // Clear the input after adding the chip
        if(msgCode){
          this.showMsg(msgCode);
        }
      }
    }

    this.basicInfoForm.form.markAsDirty();
  }

  // Cutom Chips entry onFocusOut and add validation --- End
}
