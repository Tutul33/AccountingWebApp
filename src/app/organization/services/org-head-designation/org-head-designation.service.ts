import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { ApiService, Config } from "src/app/shared";
import { TreeNode } from "primeng/api";
import { OrgHeadDesignation } from "../../models/org-head-designation/org-head-designation";

@Injectable()
export class ORGHeadDesignationDataService {
  controllerName = Config.url.orgLocalUrl + "ORGHeadDesignation";
  constructor(private apiSvc: ApiService) { }

  save(oRGHeadDesignationDTO: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, oRGHeadDesignationDTO, true);
  }

  getEmployeeDesgination(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetEmployeeDesgination",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
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

}

@Injectable()
export class ORGHeadDesignationModelService {
  orgHeadDesignationDTO: OrgHeadDesignation;
  tempOrgHeadDesignationDTO: OrgHeadDesignation;
  isEdit: boolean = false;
  isParent: boolean = false;
  designationList = [];

  constructor(
  ) { }

  setDefault()
  {
    this.orgHeadDesignationDTO = new OrgHeadDesignation();
    this.tempOrgHeadDesignationDTO = new OrgHeadDesignation();
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

  // for org-straucture list

  mapTreeObjectProps(data: any[]) {
    try {
      return data.map((x) => {
        return {
          label: x.name,
          key: x.id,
          parentID: x.parentID,
          id: x.id,
          selectedNode: false,
          isRoot: false,
          styleClass: this.prepareNodeStyle(x)
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  prepareNodeStyle(x) {
    try {
      return (x.textColorCd ? 'color:' + x.textColorCd + ';' : '') + (x.fillColorCd ? 'background:' + x.fillColorCd : '');
    } catch (e) {
      throw e;
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
