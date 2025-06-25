import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { OrgBasicDTO, OrgAddressDTO, OrgContactDetailsDTO } from '../../models/company-information/company-information';



@Injectable()
export class CompanyInformationDataService {
  controllerName = Config.url.orgLocalUrl + "CompanyInformation"; 

  constructor(private apiSvc: ApiService) { }

  SaveBasicInfo(orgBasicDTO: OrgBasicDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveBasicInfo`, orgBasicDTO, true);
  }

  SaveAddressInfo(addrssList: OrgAddressDTO[]): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveAddressInfo`, addrssList, true);
  }

  saveContactDetailInfo(contactDetailsList: OrgContactDetailsDTO[]): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveContactDetailInfo`, contactDetailsList, true);
  }

  removeAddress(id: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/DeleteAddress`, { id: id})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  getOrgStructureTreeListForComInfo(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructureTreeListForComInfo",
      {
        data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getParentOrgAddress(spData: any, id: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetParentOrgAddress",
      {
        data: JSON.stringify(spData), id: id
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrganizationStructureAddress(spData: any, id: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrganizationStructureAddress",
      {
        data: JSON.stringify(spData), id: id
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getBasicInfoData(orgStructureID: number){
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgBasicData",
      {
        orgStructureID: orgStructureID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getSocialContactsData(orgStructureID: number){
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgSocialContactsData",
      {
        orgStructureID: orgStructureID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getAddressData(orgStructureID: number, addressTypeCd: number){
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgAddressData",
      {
        orgStructureID: orgStructureID,
        addressTypeCd: addressTypeCd
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgContactDetailsData(orgStructureID: number){
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgContactDetailsData",
      {
        orgStructureID: orgStructureID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgAddressContactPersonData(orgAddressID: number){
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgAddressContactPersonData",
      {
        orgAddressID: orgAddressID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
}
