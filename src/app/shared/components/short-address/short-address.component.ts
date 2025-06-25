import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProviderService } from 'src/app/core/services/provider.service';
import { ModalService } from '../../services/modal.service';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { Address, addressValidation } from '../../models/common.model';
import { AddValidatorsDirective } from '../../directives/add-validators.directive';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-short-address',
  templateUrl: './short-address.component.html',
  providers:[ModalService],
  standalone:true,
  imports:[CommonModule,FormsModule,AddValidatorsDirective]
})

export class ShortAddressComponent extends BaseComponent implements OnInit {

  @ViewChild("shortAddressForm", { static: true, read: NgForm }) shortAddressForm: NgForm;
  public validationMsgObj: any;

  modalData: any;
  address: Address;
  tempAddress: Address;
  addressKeys: string[] = [];
  selectedItems: any = {};
  shortAddressDescription: string = '';
  tempShortAddressDescription: string = '';
  isSubmited: boolean = false;
  isCheckAddres1: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modalService: ModalService,
  ) {
      super(providerSvc);
      this.validationMsgObj = addressValidation();
  }

  ngOnInit(): void {
      try {
        this.modalService.setWidth("540px");
        this.modalData = this.modalService?.modalData;
        this.prepareData(this.modalData);
      } 
      catch (e) {
        this.showErrorMsg(e);
      }
  }
  
  prepareData(addressData: any) {
    try {
      this.address = addressData;
      this.tempAddress = addressData;
      
      this.shortAddressDescription = addressData.shortAddress;
      this.tempShortAddressDescription = addressData.shortAddress;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onclick(event: Event, key: keyof Address) {
    const value = this.address[key]?.toString().trim();
  
    if (value) {
      if (this.shortAddressDescription) {
        this.shortAddressDescription += `, ${value}`;
      } else {
        this.shortAddressDescription = value;
      }
    }

    this.change();
  }


  closeModal() {
    if(this.shortAddressDescription.length > 200)
    {
      this.showMsg("Value max length 200!");
      return;
    }
    else
    {
      this.isSubmited = false;
      this.address.shortAddress = this.shortAddressDescription;
      this.modalService.close(this.address);
    }
  }

  reset()
  {
    this.isSubmited = false;
    this.formResetByDefaultValue(this.shortAddressForm.form, this.tempShortAddressDescription );
    this.shortAddressDescription = this.tempShortAddressDescription;

    const checkboxes = document.querySelectorAll('.form-check-input');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = false;
    });
  }

  change()
  {
    this.isSubmited = true;
    this.shortAddressForm.form.markAsDirty();
  }
}
