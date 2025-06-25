import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { LockVoucherDTO } from '../../models/lock-voucher-edit-or-entry/lock-voucher.model';
import { QueryData } from 'src/app/app-shared';

@Injectable()
export class LockVoucherEditOrEntryDataService {

  controllerName = Config.url.accountingLocalUrl + "LockVoucher"; 
  spData: any = new QueryData();

  constructor(private apiSvc: ApiService) { }

  saveLockVoucher(LockVoucherDTO: LockVoucherDTO): Observable<any> {
      return this.apiSvc.save(`${this.controllerName}/Save`, LockVoucherDTO, true);
    }
  
  remove(id: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/Delete`, { id: id})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  getLockVoucherList(spData : any){
    return this.apiSvc.executeQuery(this.controllerName + "/GetLockVoucherList", { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }    
}
