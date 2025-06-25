import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiService, Config } from "src/app/shared";

@Injectable()
export class OpeningBalanceDataService {
  controllerName = Config.url.accountingLocalUrl + "OpeningBalance";
  constructor(private apiSvc: ApiService) { }
  
  save(ledgerSummaryDTO: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, ledgerSummaryDTO, true);
  }

  deleteItemByIds(spData: any, deleteitems:any) {
      // return this.apiSvc.post(this.controllerName + "/ItemByIds",
      //   {
      //     data: JSON.stringify(spData),deleteitems:deleteitems
      //   })
      //   .pipe(
      //     map((response: any) => {
      //       return response.body;
      //     })
      //   );
      return this.apiSvc.save(`${this.controllerName}/DeleteItemByIds`, deleteitems, true);
    }
  getOpeningBalanceList(spData: any) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetOpeningBalanceList",
        {
          data: JSON.stringify(spData)
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

  getOpeningBalanceByCorrespondingID(spData: any,companyID:number,orgID?:number,projectID?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetOpeningBalanceByIds",
        {
          data: JSON.stringify(spData),companyID:companyID, orgID:orgID == null ? '' :orgID, projectID:projectID == null ? '' :projectID
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    getOrgAndProjectCOAList(spData: any,companyID:number,orgID?:number,projectID?:number) {
      return this.apiSvc.executeQuery(this.controllerName + "/GetOrgAndProjectCOAList",
        {
          data: JSON.stringify(spData),companyID:companyID, orgID:orgID == null ? '' :orgID, projectID:projectID == null ? '' :projectID
        })
        .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    saveBulkUpload(spData: any,fileOption:any) 
    {
      return this.apiSvc
      .save(`${this.controllerName}/SaveBulkUpload`,fileOption, true)
      .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }

    uploadOpeningBalanceFile(spData: any,file:any) 
    {
      return this.apiSvc
      .save(`${this.controllerName}/UploadOpeningBalanceFile`,file, true)
      .pipe(
          map((response: any) => {
            return response.body;
          })
        );
    }


  // getOpeningBalanceByCorrespondingID(spData: any,companyID:number,orgID?:number,projectID?:number) {
  //     return this.apiSvc.executeQuery(this.controllerName + "/GetOpeningBalanceByCorrespondingID",
  //       {
  //         data: JSON.stringify(spData),companyID:companyID, orgID:orgID == null ? '' :orgID, projectID:projectID == null ? '' :projectID
  //       })
  //       .pipe(
  //         map((response: any) => {
  //           return response.body;
  //         })
  //       );
  //   }
  

}