import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService, Config } from "src/app/shared";

@Injectable()
export class COADataService {
  controllerName = Config.url.accountingLocalUrl + "COA";
  constructor(private apiSvc: ApiService) { }

  getCOATreeList(spData: any,isHide:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetCOATreeList",
      {
        data: JSON.stringify(spData),isHide:isHide
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getControlLedgerID(spData: any,parentID:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetControlLedgerID",
      {
        data: JSON.stringify(spData),parentID:parentID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getAccountCodeByID(spData: any,id:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetAccountCodeByID",
      {
        data: JSON.stringify(spData),id:id
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getControlLedgerAndFixedAsset(spData: any,parentID:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetControlLedgerAndFixedAsset",
      {
        data: JSON.stringify(spData),parentID:parentID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getIsControlLedgerHide(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetIsControlLedgerHide",
      {
        data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getAccountNatureList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetAccountNatureList",
      {
        data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getParentAssetList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetParentAssetList",
      {
        data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  
  getSubLedgerTypeList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetSubLedgerTypeList",
      {
        data: JSON.stringify(spData)
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getGroupOrSubLedgerListByNatureCdAndLevelCd(spData: any,nCode:any,lCode:any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetGroupOrSubLedgerListByNatureCdAndLevelCd",
      {
        data: JSON.stringify(spData), nCode:nCode, lCode:lCode
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getLedgerNoteById(spData: any,id:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetLedgerNoteById",
      {
        data: JSON.stringify(spData),id:id
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  // delete(id: number) {
  //   return this.apiSvc.removeByID(`${this.controllerName}`, id).pipe(
  //     map((response: any) => {
  //       return response;
  //     })
  //   );
  // }

  delete(id: number, levelCode:number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/Delete`, { id: id, levelCode: levelCode })
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  isEmptyCOA(): Observable<any> {
    return this.apiSvc
    .get(`${this.controllerName}/IsEmptyCOA`)
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  

  save(coa: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, coa, true);
  }

  //start org wise coa

  orgWiseCOASave(cOAOrgMapList: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/OrgWiseCOASave`, cOAOrgMapList, true);
  }

  getOrgAndProjectWiseCOAList(spData: any,orgId?:number, projectId?:number, isHide?:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgAndProjectWiseCOAList",
      {
        data: JSON.stringify(spData),
        orgId: !orgId ? '' : orgId,
        projectId: !projectId ? '' : projectId
        ,isHide:isHide
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgAndProjectWiseTreeList(spData: any, isHide:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgAndProjectWiseTreeList",
      {
        data: JSON.stringify(spData), isHide:isHide
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }



  //end org wise coa

  getChartOfAccountReports(spData: any,orgId:number, projectId:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetChartOfAccountReports",
      {
        data: JSON.stringify(spData),
        orgId: !orgId ? '' : orgId,
        projectId: !projectId ? '' : projectId
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

}