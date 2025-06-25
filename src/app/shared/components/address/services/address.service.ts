import { Address } from '../../../models/common.model';
import { AddressPicker } from '../../../models/common.model';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Config } from '../../..';
import { ApiService } from '../../../services/api.service';
import { QueryData } from 'src/app/shared/models/common.model';


@Injectable()
export class AddressDataService {

  controllerName = Config.url.adminLocalUrl + "Admin";
  spData: any = new QueryData();

  constructor(private apiSvc: ApiService) { this.spData.pageNo = 0; }

  getCountries(locationID: number) { 
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetCountries`, { locationID: locationID, data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
}


@Injectable()
export class AddressModelService {

  adressDTO: Address; 
  tempAdress: Address; 
  mapAdress: AddressPicker = new AddressPicker();
  countryList = [];
  mapAddressDisplay: string = "";
  
  constructor() { }

  setDefaultData(modalData?: any){
    try {
      this.adressDTO = new Address(modalData);
      this.tempAdress = new Address(modalData);
    } catch (e) {
      throw e;
    }
  }

  prepareMapAddress(address: any) {
    try {
      this.mapAdress = new AddressPicker(address);
      this.mapAdress.latitude = address.latitude.toString();
      this.mapAdress.longitude = address.longitude.toString();
      this.mapAdress.mapAddress = address.mapAddress;
      this.mapAdress.address = address.address;

      this.modifyMapObj(this.mapAdress);
    } catch (e) {
      throw e;
    }
  }

  modifyMapObj(adddress: any) {
    try {
      let obj = {
        latitude: adddress.latitude,
        longitude:  adddress.latitude,
        address:  adddress.address,
        mapAddress:  adddress.mapAddress,
      };
      this.adressDTO.mapObj = JSON.stringify(obj);
      this.mapAddressDisplay = adddress.address;
    } catch (error) {
      throw error;
    }
  }
}
