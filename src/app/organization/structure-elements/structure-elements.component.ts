import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm } from '@angular/forms';
import { ColumnType, GridOption } from "src/app/shared/models/common.model";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShortAddressComponent } from '../../shared/components/short-address/short-address.component'
import { AddressComponent } from '../../shared/components/address/address.component'
import { Address } from '../../shared/models/common.model';
import { OrganizationSearchComponent } from '../../shared/components/organization-search/organization-search.component'

import {
  ProviderService,
  BaseComponent,
  ValidatorDirective,
  StructureElementDataService,
  StructureElementModelService
} from '../index';

import { StruetureElementDTO, StruetureElementMapDTO, struetureElementValidation } from '../models/structure-elements/structure-elements';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-structure-elements',
  templateUrl: './structure-elements.component.html',
  providers: [ProviderService, StructureElementModelService, StructureElementDataService],
  standalone:true,
  imports:[SharedModule]
})
export class StructureElementsComponent extends BaseComponent implements OnInit {
  ref: DynamicDialogRef;
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("commonElementForm", { static: true, read: NgForm }) commonElementForm: NgForm;
  public validationMsgObj: any;
  

  isOpenModal: boolean = false;
  gridOption: GridOption;
  isSubmited: boolean = false;

  address = {
    PresentAddress: 'Dhaka',
    PermanentAddress: 'Brahmanbaria',
    Post: 'Dhaka 1230',
    District: 'Dhaka'
  };
  

  constructor(
    protected providerSvc: ProviderService,
    public dialogService: DialogService,
    public modelSvc: StructureElementModelService,
    private dataSvc: StructureElementDataService,
  ) {
    super(providerSvc);
    this.validationMsgObj = struetureElementValidation();
  }

  ngOnInit(): void {
    this.loadDefault();
  }

  loadDefault(){
    try {
      this.modelSvc.struetureElementDTO = new StruetureElementDTO();
      this.modelSvc.struetureElementMapDTO = new StruetureElementMapDTO();
      this.modelSvc.loadOrgBehaviorList();
      this.modelSvc.loadOrgTypList();
      this.getStructureElementsList();

      this.initGridOption();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getStructureElementsList() {
    try {
      this.dataSvc.getStructureElementsList().subscribe({
        next: (res: any) => {
          this.modelSvc.orgElementsList = this.prepareGridList(res || []);    
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  prepareGridList(dataList: any) {
    try {
      return this.modelSvc.prepareGridList(dataList);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: this.fieldTitle['organizationelementlist'],
        dataSource: "modelSvc.orgElementsList",
        columns: this.gridColumns(),
        refreshEvent: this.getStructureElementsList,
        isGlobalSearch: true,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "elementName", header: this.fieldTitle['organizationalelements'] },
      { field: "isSelected", header: this.fieldTitle['select'], isBoolean: true, styleClass:"d-center" },
      { field: "behaviorName", header: this.fieldTitle['behavior'] },
      { field: "typeName", header: this.fieldTitle['type'] },
      { header: this.fieldTitle['action'] }
    ]
  }

  Add() {
    try {
      this.formResetByDefaultValue(this.commonElementForm.form, this.modelSvc.struetureElementMapDTO);
      this.modelSvc.struetureElementDTO = new StruetureElementDTO();
      this.isOpenModal = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  closeModal() {
    try {
      this.isOpenModal = false;
      this.isSubmited = false;
      this.modelSvc.setDefault();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveElement(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      this.modelSvc.prepareDataBeforeSave();
      
      let isDuplicate = this.utilitySvc.checkDuplicateEntry(this.modelSvc.orgElementsList, this.modelSvc.struetureElementDTO, 'elementName,typeName,behaviorName');
      if(isDuplicate)
      {
        this.showMsg(this.messageCode.duplicateCheck);
      }
      else
      {
        this.save(this.modelSvc.struetureElementDTO);
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private save(struetureElementDTO: StruetureElementDTO) {
    try {
      let messageCode = this.messageCode.editCode;
      this.dataSvc.save(struetureElementDTO).subscribe({
        next: (res: any) => {
          this.modelSvc.setDefault();
          this.getStructureElementsList();
          this.showMsg(messageCode);
          this.isOpenModal = false;
        },
        error: (e) => {
          this.showErrorMsg(e);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  reset()
  {
    this.isSubmited = false;
    
    let struetureElementDTO =  new StruetureElementDTO(this.modelSvc.tempStruetureElementDTO);

    let data = {
      id: struetureElementDTO.id,
      elementID: this.modelSvc.tempStruetureElementMapDTO.elementID,
      elementName: struetureElementDTO.elementName,
      behaviorCd: this.modelSvc.tempStruetureElementMapDTO.behaviorCd,
      typeCd: struetureElementDTO.typeCd,
      isSelected: struetureElementDTO.isSelected,
      structureElementMapList: [],
      
      //extra properties
      locationID: struetureElementDTO.locationID,
      createdByID: struetureElementDTO.createdByID,
      tag: struetureElementDTO.tag,
    }

    this.formResetByDefaultValue(this.commonElementForm.form, data);
    this.modelSvc.struetureElementMapDTO = new StruetureElementMapDTO(this.modelSvc.tempStruetureElementMapDTO);
    this.modelSvc.struetureElementDTO = new StruetureElementDTO(this.modelSvc.tempStruetureElementDTO);
  }

  edit(entity: any){
    try {
      this.modelSvc.prepareDataForUpdateModal(entity);
      this.isOpenModal = true;
    } catch (error) {
      
    }
  }


  delete(entity: any) {
    try { 
      this.utilitySvc.showConfirmModal(this.messageCode.confirmDelete).subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.dataSvc.remove(entity.elementStructureID).subscribe({
            next: (res: any) => {
              this.showMsg(this.messageCode.deleteCode);
              this.modelSvc.setDefault();
              this.getStructureElementsList();
            },
            error: (res: any) => { this.showErrorMsg(res) }
          });
        }
      });
    } catch (e) {
      this.showErrorMsg(e)
    }
  }

  changeActiveStatus(entity: any) {
    try {
      this.dataSvc.updateSelectStatus(entity.elementStructureID, entity.isSelected).subscribe({
        next: (res: any) => {
          this.showMsg(this.messageCode.editCode);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  change()
  {
    this.isSubmited = true;
  }

  openShortAddressModal() {
    this.ref = this.dialogService.open(ShortAddressComponent, {
      data: this.address,
      header: 'Short Address',
      width: '50%'
    });

    this.ref.onClose.subscribe((shortAddressDescription) => {
      if (shortAddressDescription) {
        console.log('Short Address Description:', shortAddressDescription);
      }
    });
  }

  openAddressModal() {
    this.ref = this.dialogService.open(AddressComponent, {
      data: new Address(),
      header: 'Address',
      width: '85%'
    });

    this.ref.onClose.subscribe((obj: any) => {
      if (obj) {
        console.log('Address Description:', obj);
      }
    });
  }

  organizationModal() {
    this.ref = this.dialogService.open(OrganizationSearchComponent, {
      header: 'Organization Search',
      width: '45%'
    });

    this.ref.onClose.subscribe((obj: any) => {
      if (obj) {
        console.log('Organization Search id:', obj);
      }
    });
  }

  

}
