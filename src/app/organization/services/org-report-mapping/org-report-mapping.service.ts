import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService, Config } from "src/app/shared";
import { TreeNode } from "primeng/api";
import { OrgReportMapping } from "../../models/org-report-mapping/org-report-mapping";


@Injectable()
export class OrgReportMappingDataService {
  controllerName = Config.url.orgLocalUrl + "OrgReportMapping";
  constructor(private apiSvc: ApiService) { }

  save(orgReportMappingDTO: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, orgReportMappingDTO, true);
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


  getOrgStructureTreeListByChildID(spData: any, childID: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetOrgStructureTreeListByChildID",
      {
        data: JSON.stringify(spData), childID: childID
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  

}

@Injectable()
export class OrgReportMappingModelService {
  orgReportMappingDTO: OrgReportMapping;
  tempOrgReportMappingDTO: OrgReportMapping;
  isEdit: boolean = false;
  isParent: boolean = false;
  reportToOrgStructureList = [];

  constructor(
  ) { }

  setDefault()
  {
    this.orgReportMappingDTO = new OrgReportMapping();
    this.tempOrgReportMappingDTO = new OrgReportMapping();
  }

  expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }


  // parent

  mapObjectProps(data: any[]) {
    try {
      return data.map((x) => {
        return { 
          label: x.name,
          key: x.id,
          parentID: x.parentID,
          id: x.id,
          typeCd: x.typeCd,
          selectedNode: false,
          isRoot: false,
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  prepareTreeData(arr, parentID) {
    try {
      const master: any[] = [];
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        val.label = val.label;
        if (val.parentID == parentID) {
          const children = this.prepareTreeData(arr, val.key);
          if (children.length) {
            val.children = children;
          }
          master.push(val);
        }
      }
      return master;
    } catch (error) {
      throw error;
    }
  }


  expandTree(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandTree(childNode, isExpand);
      });
    }
  }
}
