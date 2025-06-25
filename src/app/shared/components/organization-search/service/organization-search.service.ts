import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Config } from '../../..';
import { ApiService } from '../../../services/api.service';
import { QueryData } from 'src/app/shared/models/common.model';
import { TreeNode } from "primeng/api";
import { DynamicDialogRef } from "primeng/dynamicdialog";

@Injectable()
export class OrganizationSearchDataService {
  controllerName = Config.url.orgLocalUrl + "OrgStructure";

  spData: any = new QueryData();

  constructor(private apiSvc: ApiService) { this.spData.pageNo = 0; }

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
}

@Injectable()
export class OrganizationSearchModelService {
  treeDataList: TreeNode[];
  reportingTreeDataList: TreeNode[];
  ref: DynamicDialogRef;
  selectedNode: any = null;
  reportingSelectedNode: any = null;
  selectedNodeList:TreeNode[] = [];

  constructor() { }

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
