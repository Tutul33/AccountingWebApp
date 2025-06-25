import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService, Config, QueryData } from 'src/app/app-shared';

@Injectable()
export class CreditReceiptVoucherDataService {

  controllerName = Config.url.accountingLocalUrl + "CreditReceiptVoucher";
  spData: any = new QueryData();
  constructor(private apiSvc: ApiService) {}
  GetVoucherList(
    voucherCd: any,
    spData: any
  ) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetCreditReceiptVoucherList`, {
        voucherCd: voucherCd,        
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  GetVoucherByVoucherID(
    VoucherID: any,
    spData: any
  ) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetVoucherByVoucherID`, {
        VoucherID: VoucherID,        
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );

  }  
  save(entity: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, entity, true);
  }
  getVoucherForPrint(voucherID: number, spData: any) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetCreditReceiptVoucherForPrint`, {
        data: JSON.stringify(spData),
        voucherID: voucherID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getReports(entity: any) {
    return this.apiSvc.post(
      Config.url.accountingLocalUrl + "Report/ShowReport",
      entity
    );
  }
}
