import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config, QueryData } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { CashFlowActivityDTO } from '../../models/cash-flow/cash-flow.model';


@Injectable()
export class CashFlowDataService {

  controllerName = Config.url.accountingLocalUrl + "CashFlow";
  spData: any = new QueryData();
  constructor(private apiSvc: ApiService) { }

  saveCashFlowActivity(cashFlowActivityDTO: CashFlowActivityDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, cashFlowActivityDTO, true);
  }

  getCashFlowActivitiesByID(id: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetCashFlowActivitiesByID", { id: id })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getCashFlowStatementGroups() {
    return this.apiSvc.executeQuery(this.controllerName + "/GetCashFlowStatementGroups", {})
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getLedgerList() {
    this.spData.pageNo = 0;
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetLedgerList`, { data: JSON.stringify(this.spData) })
      .pipe(
        map((response: any) => {
          return response.body[response.body.length - 1] || [];
        })
      );
  }

  deleteCashActivities(id: number, detailID?: number): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/DeleteCashActivities`, { id: id, detailID: detailID == null ? '' : detailID })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

}
