import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { SubLedgerDTO } from '../../models/sub-ledger/sub-ledger.model';


@Injectable()
export class SubLedgerDataService {

  controllerName = Config.url.accountingLocalUrl + "SubLedger"; 

  constructor(private apiSvc: ApiService) { }

    saveSubLedger(subLedgerDTO: SubLedgerDTO): Observable<any> {
      return this.apiSvc.save(`${this.controllerName}/SaveSubLedger`, subLedgerDTO, true);
    }
  
    removeSubLedger(id: number): Observable<any> {
      return this.apiSvc
      .executeQuery(`${this.controllerName}/DeleteSubLedger`, { id: id})
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
    }
  
    getSubLedgerList(spData : any){
      return this.apiSvc.executeQuery(this.controllerName + "/GetSubLedgerList", { data: JSON.stringify(spData) })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getSubLedgerTypeList(){
      return this.apiSvc.executeQuery(this.controllerName + "/GetSubLedgerTypeList", { })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    saveSubLedgerUpload(spData: any,fileOption:any) 
    {
      return this.apiSvc
      .save(`${this.controllerName}/SaveSubLedgerUpload`,fileOption, true)
      .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }
}
