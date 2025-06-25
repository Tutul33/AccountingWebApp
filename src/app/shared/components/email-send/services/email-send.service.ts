import { Injectable } from '@angular/core';
import { Config } from '../../..';
import { ApiService } from '../../../services/api.service';
import { QueryData } from 'src/app/shared/models/common.model';
import { Email } from 'src/app/shared/models/common.model';
import { map, Observable } from 'rxjs';

@Injectable()
export class EmailSendDataService {

  controllerName = Config.url.adminLocalUrl + "SendEmail";
    spData: any = new QueryData();
  
    constructor(private apiSvc: ApiService) { this.spData.pageNo = 0; }
  
    sendEmail(emailDTO: Email): Observable<any> {
      return this.apiSvc.save(`${this.controllerName}/SendEmail`, emailDTO, true);
    }
}


@Injectable()
export class EmailSendModelService {
  emailDTO: Email; 
  tempEmailDTO: Email; 

  constructor() { }

  setDefaultData(modalData?: any){
    try {
      this.emailDTO = new Email();
      this.tempEmailDTO = new Email();
      this.emailDTO.moduleName = modalData.moduleName;
      this.tempEmailDTO.moduleName = modalData.moduleName;

      if(modalData.attachmentName.length > 0)
      {
        modalData.attachmentName.forEach(element => {
          this.emailDTO.files.push(element);
          this.tempEmailDTO.files.push(element);
        });
      }
    } catch (e) {
      throw e;
    }
  }

}
