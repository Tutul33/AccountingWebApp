import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, Validators, FormsModule } from '@angular/forms';
//import { MapsAPILoader } from '@agm/core';
import { ValidatorDirective } from '../../directives/validator.directive';
import { ProviderService } from 'src/app/core/services/provider.service';
import { ModalService } from '../../services/modal.service';
import { AddressPicker, addressPickerValidation } from '../../models/common.model';
import { BaseComponent } from '../base/base.component';
import { GlobalMethods } from 'src/app/core/models/javascriptMethods';
import { GlobalConstants } from 'src/app/app-shared/models/javascriptVariables';
import { GoogleMapsModule, MapMarker } from '@angular/google-maps';
import { rangeValidator } from '../../models/custom-validators';
import { CommonModule } from '@angular/common';
import { AddValidatorsDirective } from '../../directives/add-validators.directive';

@Component({
  selector: 'app-address-picker',
  templateUrl: './address-picker.component.html',
  providers:[ModalService],
  standalone:true,
  imports:[FormsModule,CommonModule,AddValidatorsDirective,GoogleMapsModule]
})

//google map source code link : https://www.freakyjolly.com/angular-google-maps-using-agm-core/

export class AddressPickerComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("addressPickerForm", { static: true, read: NgForm }) addressPickerForm: NgForm;
  validationMsgObj: any;
  zoom: number = 14;
  addressPickerModel: AddressPicker;
  isModal: boolean = false;
  isShowMapAddressInput: boolean = true;
  private geoCoder: any;
  @ViewChild(MapMarker) mapMaker!: MapMarker;
  isShowMap: boolean = false;
  center: any = { lat: 23.804093, lng: 90.4152376 };
  marker = {
      position: { lat: 23.804093, lng: 90.4152376 },
  }

  constructor(
      protected providerSvc: ProviderService,
      private el: ElementRef,
      private ngZone: NgZone,
      public modalService: ModalService,
  ) {
      super(providerSvc);
      this.validationMsgObj = addressPickerValidation();
  }

  ngOnInit(): void {
      try {
          this.isModal = this.modalService.isModal;
          this.isShowMap = GlobalMethods.jsonDeepCopy(GlobalConstants.isGoogleMapEnable);

          if (this.isModal) {
              this.modalService.setClass('add-picker-modal');
              this.modalService.setHeader(this.fieldTitle['address']);
              this.modalService.setWidth("");
          }
          this.addressPickerModel = new AddressPicker();

          if(this.modalService.modalData)
          {
            this.addressPickerModel.latitude = this.modalService.modalData.latitude || 0;
            this.addressPickerModel.longitude = this.modalService.modalData.longitude || 0;
            this.addressPickerModel.mapAddress = this.modalService.modalData.mapAddress || null;
            this.addressPickerModel.address = this.modalService.modalData.address || null;
          }
      } catch (e) {
          this.showErrorMsg(e);
      }
  }

  ngAfterViewInit(): void {
      try {
          if (this.isShowMap) {
              this.setDefaultData();

            //   setTimeout(() => {
            //       this.setMapAddressValidation();
            //   }, 100);

          }
          this.isShowMapAddressInput = false;
      } catch (e) {
          this.showErrorMsg(e);
      }
  }


  setDefaultData() {
      try {
          this.addressPickerForm.form.markAsDirty();
          this.geoCoder = new google.maps.Geocoder;
          if(this.addressPickerModel.latitude > 0)
          {
            let latLong = { lat: Number(this.addressPickerModel.latitude), lng: Number(this.addressPickerModel.longitude) };
              this.center = latLong;
              this.marker = {
                position: latLong
              }
          }
          else{
            this.setCurrentLocation();
          } 
          
          var searhEl = this.el.nativeElement.querySelector('#mapAddress');
          let autocomplete = new google.maps.places.Autocomplete(searhEl);
          autocomplete.addListener("place_changed", () => {
              this.ngZone.run(() => {
                  //get the place result
                  let place: google.maps.places.PlaceResult = autocomplete.getPlace();

                  //verify result
                  if (place.geometry === undefined || place.geometry === null) {
                      return;
                  }
                  //set latitude, longitude and zoom
                  this.addressPickerModel.latitude = place.geometry.location.lat();
                  this.addressPickerModel.longitude = place.geometry.location.lng();
                  this.addressPickerModel.mapAddress = place.formatted_address;
                  this.center = new google.maps.LatLng(this.addressPickerModel.latitude, this.addressPickerModel.longitude);
                  this.mapMaker.marker.setPosition(GlobalMethods.jsonDeepCopy(this.center));
              });
          });
      } catch (e) {
          this.showErrorMsg(e);
      }
  }
  onClickMap($event: any) {
      this.addressPickerModel.latitude = $event.latLng.lat();
      this.addressPickerModel.longitude = $event.latLng.lng();
      this.mapMaker.marker.setPosition(new google.maps.LatLng($event.latLng.lat(), $event.latLng.lng()));
      this.setMapAddress(this.addressPickerModel.latitude, this.addressPickerModel.longitude);
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
      try {
          let lat = this.center.lat;
          let lng = this.center.lng;
          if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                  lat = position.coords.latitude;
                  lng = position.coords.longitude;
                  this.setMapAddress(lat, lng);
              }, () => {
                  this.setMapAddress(lat, lng);
              });
          }
      } catch (e) {
          throw e;
      }
  }

  setMapAddress(latitude: any, longitude: any) {
      try {
          debugger
          this.addressPickerModel.latitude = latitude;
          this.addressPickerModel.longitude = longitude;
          this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results: any, status: any) => {
              if (status === google.maps.GeocoderStatus.OK) {
                  if (results[0]) {
                      this.zoom = 15;
                      this.addressPickerModel.mapAddress = results[0].formatted_address;
                  }
              }
          });
      } catch (e) {
          this.showErrorMsg(e);
      }
  }

  onSubmit(formGroup: NgForm) {
      try {
          if (!formGroup.valid) {
              this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
              return;
          }
          this.closeModal();
      } catch (ex) {
          this.showErrorMsg(ex);
      }
  }

  closeModal() {
      if (this.modalService.isModal) {
          this.modalService.close(this.addressPickerModel);
      }
  }

  onClickChange() {
      this.isShowMapAddressInput = true;
      this.setMapAddressValidation();
  }

  setMapAddressValidation() {
      try {
          const ctrl = this.addressPickerForm.controls['mapAddress'];
          ctrl.setValidators(Validators.required);
          ctrl.updateValueAndValidity();
      } catch (e) {
          throw e;
      }
  }
}


