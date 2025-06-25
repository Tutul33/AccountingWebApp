import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config, FixedIDs, UtilityService } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { ChangeIndustryTypeDTO } from '../../models/change-industry-type/change-industry-type';

@Injectable()
export class ChangeIndustryTypeDataService {

  controllerName = Config.url.orgLocalUrl + "ChangeIndustryType";

  constructor(private apiSvc: ApiService) { }

  save(ChangeIndustryTypeDTO: ChangeIndustryTypeDTO): Observable<any> { 
    return this.apiSvc.save(`${this.controllerName}/Save`, ChangeIndustryTypeDTO, true);
  }

  getUDCIndustryTypeList(): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetUDCIndustryTypeList`, { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

}


@Injectable()
export class ChangeIndustryTypeModelService {

  changeIndustryTypeDTO: ChangeIndustryTypeDTO;
  tempChangeIndustryTypeDTO: ChangeIndustryTypeDTO;

  industryTypList: any = [];

  constructor(private utilitySvc: UtilityService) { }

  setDefault() {
    try {
      this.changeIndustryTypeDTO = new ChangeIndustryTypeDTO();
      this.tempChangeIndustryTypeDTO = new ChangeIndustryTypeDTO();
    } catch (e) {
      throw e;
    }
  }

  updateDefault() {
    try {
      let data = this.industryTypList.find(x=> x.isActive == 1);

      this.changeIndustryTypeDTO = new ChangeIndustryTypeDTO(data);
      this.tempChangeIndustryTypeDTO = new ChangeIndustryTypeDTO(data);

    } catch (e) {
      throw e;
    }
  }

  
}
