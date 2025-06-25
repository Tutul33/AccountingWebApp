import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { ChequeBookDTO, ChequeLogDTO } from '../../models/cheque-book/cheque-book';

@Injectable()
export class ReceivedChequeManagementDataService {
  controllerName = Config.url.accountingLocalUrl + "ReceivedChequeManagement";
  
  constructor(private apiSvc: ApiService) { }

  saveChequeBook(chequeBookDTO: ChequeBookDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, chequeBookDTO, true);
  }

  saveChequeLog(chequeLogDTO: ChequeLogDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SaveChequeLog`, chequeLogDTO, true);
  }

  updateIsUsed(id: number): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/UpdateIsUsed`, id, true);
  }

  remove(id: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/Delete`, { id: id })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getChequeBookList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetChequeBookList", { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getChequeBookLeafManagementList(spData: any,ids:any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetChequeBookLeafManagementList", { data: JSON.stringify(spData),ids:ids })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getChequeLogDetail(spData: any,voucherItemID:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetChequeLogDetail", { data: JSON.stringify(spData),voucherItemID:voucherItemID })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getChequeLogList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetChequeLogList", { data: JSON.stringify(spData)})
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getChequeLeafStatusList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetChequeLeafStatusList", { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getChequeBankAccountList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetChequeBankAccountList", { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  
}
