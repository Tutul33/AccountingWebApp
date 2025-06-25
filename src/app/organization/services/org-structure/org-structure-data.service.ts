import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService, Config } from "src/app/shared";

@Injectable()
export class OrgStructureDataService {
  controllerName = Config.url.orgLocalUrl + "OrgStructure";
  constructor(private apiSvc: ApiService) { }

  save(oRGStructureDTOs: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, oRGStructureDTOs, true);
  }

  delete(id: number) {
    return this.apiSvc.removeByID(`${this.controllerName}`, id).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  getOrgStructureId(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructureId",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgStructureTreeList(spData: any, id: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructureTreeList",
      {
        data: JSON.stringify(spData), id: id
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgElementList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgElementList",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOfficeOrgElementsList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOfficeOrgElementsList",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgStructureTreeByParentIDList(spData: any, parentID: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructureTreeByParentIDList",
      {
        data: JSON.stringify(spData), parentID: parentID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgStructureByID(spData: any, id: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructureByID",
      {
        data: JSON.stringify(spData), id: id
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgStructureByIDForEdit(spData: any, id: number, parentID?: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructureByIDForEdit",
      {
        data: JSON.stringify(spData), id: id, parentID: parentID == null ? '' : parentID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getOrgStructure(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructure",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getReportingOrgStructure(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetReportingOrgStructure",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getReportingOrgByDesignation(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetReportingOrgByDesignation",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  getReportingOrgByPerson(spData: any, orgID:number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetReportingOrgByPerson",
      {
        data: JSON.stringify(spData),
        orgID: orgID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  


}