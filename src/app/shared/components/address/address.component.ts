import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { ValidatorDirective } from '../../directives/validator.directive';
import { ProviderService } from 'src/app/core/services/provider.service';
import { ModalService } from '../../services/modal.service';
import { Address, addressValidation } from '../../models/common.model';
import { BaseComponent } from '../base/base.component';
import { GlobalConstants } from 'src/app/app-shared/models/javascriptVariables';
import { AddressModelService, AddressDataService } from './services/address.service'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ShortAddressComponent } from '../short-address/short-address.component'
import { AddressPickerComponent } from'../address-picker/address-picker.component'
import { ModalConfig } from "src/app/shared/models/common.model";
import { CommonModule } from '@angular/common';
import { AddValidatorsDirective } from '../../directives/add-validators.directive';
import { DropdownModule } from 'primeng/dropdown';
import { NiSelectedTextDirective } from '../../directives/ni-selected-text.directive';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  providers:[ModalService, AddressModelService, AddressDataService],
  standalone:true,
  imports:[FormsModule,CommonModule,AddValidatorsDirective,DropdownModule,NiSelectedTextDirective,SelectModule]
})
export class AddressComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("addressForm", { static: true, read: NgForm }) addressForm: NgForm;
  validationMsgObj: any;
  locationID = GlobalConstants.userInfo.locationID;
  isSubmited: boolean = false;
  ref: DynamicDialogRef;

  constructor(
    protected providerSvc: ProviderService,
    public modalService: ModalService,
    public modelSvc: AddressModelService,
    public dataSvc: AddressDataService,
    public dialogService: DialogService,
) {
    super(providerSvc);
    this.validationMsgObj = addressValidation();
}

  ngOnInit(): void {
    try {
      this.getCountires();
      
      setTimeout(() => {
        this.setDefault(this.modalService?.modalData);
      }, 50);

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setDefault(modalData?: any){
    try {
      this.modelSvc.setDefaultData(modalData);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getCountires(){
    try {
      this.dataSvc.getCountries(this.locationID).subscribe({
        next: (res: any) => {
          this.modelSvc.countryList = res[res.length - 1] || [];
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

  change()
  {
    this.isSubmited = true;
  }

  reset(){
    try {
      this.isSubmited = false;
      this.modelSvc.adressDTO = new Address(this.modelSvc.tempAdress);

      setTimeout(() => {
        this.formResetByDefaultValue(this.addressForm.form, this.modelSvc.adressDTO);
      }, 20);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  closeModal(formGroup: NgForm){
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      this.modalService.close(this.modelSvc.adressDTO);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  openShortAddressModal() {
    const modalConfig = new ModalConfig();
    modalConfig.data = this.modelSvc.adressDTO;
    modalConfig.header = 'Address';
    modalConfig.width = '70%';
    this.ref = this.dialogService.open(ShortAddressComponent, modalConfig);

    this.ref.onClose.subscribe((obj: any) => {
      if (obj) {
        console.log('Short Address Description:', obj);
      }
    });
  }

  mapAddressModal() {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.data = { 
        mapAddress: this.modelSvc.mapAdress.mapAddress, 
        address:  this.modelSvc.mapAdress.address, 
        latitude:  this.modelSvc.mapAdress.latitude,
        longitude: this.modelSvc.mapAdress.longitude 
      };
      this.ref = this.dialogService.open(AddressPickerComponent, modalConfig);
      this.ref.onClose.subscribe((obj: any) => {
        if (obj) {
          this.modelSvc.prepareMapAddress(obj);
          this.change();
          this.addressForm.form.markAsDirty();
        }
      });
    } catch (e) {
      this.showErrorMsg(e); 
    }
  }
}
