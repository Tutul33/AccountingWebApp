import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { FinancialYearDTO } from '../../models/financial-year/financial-year';

@Injectable()
export class FinancialYearDataService {

  controllerName = Config.url.accountingLocalUrl + "FinancialYear"; 
  
    constructor(private apiSvc: ApiService) { }
  
    saveFinancialYear(financialYearDTO: FinancialYearDTO): Observable<any> {
        return this.apiSvc.save(`${this.controllerName}/Save`, financialYearDTO, true);
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
    
      getFinancialYeartList(spData : any){
        return this.apiSvc.executeQuery(this.controllerName + "/GetFinancialYeartList", { data: JSON.stringify(spData) })
          .pipe(
            map((response: any) => {
              return response.body;
            })
          );
      }

      updateFinancialYearStatus(id: number, status: number): Observable<any> {
        return this.apiSvc
        .executeQuery(`${this.controllerName}/UpdateFinancialYearStatus`, { id: id, status: status})
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
      }

      
}
