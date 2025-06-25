import { Injectable } from "@angular/core";
import { TreeNode } from "primeng/api";
import { FixedIDs, QueryData } from "src/app/app-shared";
import { COA } from "../../models/coa/coa";
import { UntypedFormGroup } from "@angular/forms";
import { COAOrgMapDTO } from "../../models/coa/coa-org-map";


@Injectable()
export class COAModelService {
  static instance: COAModelService;

  coaForm: UntypedFormGroup;
  isAccountNature = false;
  isGroupLedger = false;
  isSubGroupLedger = false;
  isControlLedger = false;
  isLedger = false;
  coa: COA = new COA();
  companyList: any = [];
  projectWise: number;


  //for report
  spData: any = new QueryData();
  treeDataList: TreeNode[];
  orgAndProjectData: any = [];
  projectWiseDataList: TreeNode[];
  selectedMenu: any = [];
  cOAOrgMapList: COAOrgMapDTO[] = [];
  cOAOrgMapDTO: COAOrgMapDTO;
  //tempTreeDataList: TreeNode[];
  serverDataList: any[] = [];
  officeBrachUnitList: any = [];
  commonDropDownList: any = [];
  tempTreeData: any[] = [];
  selectedNode: any = null;

  constructor(
  ) {
    return COAModelService.instance = COAModelService.instance || this;

  }
  afferSaveData: any = null;
  ch: any;

  findNodeById(nodes: any, id: number) {

    try {
      for (let node of nodes) {
        if (node.id === id) {
          if (node.children && node.children.length > 0) {
            node.children.push(
              {
                id: this.afferSaveData.id,
                key: this.afferSaveData.id,
                label: this.afferSaveData.accountName,
                accountName: this.afferSaveData.accountName,
                parentID: this.afferSaveData.parentID,
                editParentID:this.afferSaveData.editParentID,///
                subLedgerTypeID : this.afferSaveData.subLedgerTypeID,
                isSubLedgerType : this.afferSaveData.isSubLedgerType,
                depreciationRate:this.afferSaveData.depreciationRate,
                parentLedgerID:this.afferSaveData.parentLedgerID,
                expandLevel: node.expandLevel,
                cOALevelCode: this.afferSaveData.cOALevelCode,//node.cOALevelCode,
                assetTypeCode: this.afferSaveData.assetTypeCode,
                transactionNatureCode: this.afferSaveData.transactionNatureCode,
                accountNatureCd: this.afferSaveData.accountNatureCd,
                accountCode: this.afferSaveData.accountCode,
                note: this.afferSaveData.note,
                expanded: node.expanded,
                isActive: node.isActive,
                isRoot: node.isRoot,

              });
          } else {
            node.children = [
              {
                id: this.afferSaveData.id,
                key: this.afferSaveData.id,
                label: this.afferSaveData.accountName,
                accountName: this.afferSaveData.accountName,
                parentID: this.afferSaveData.parentID,
                editParentID:this.afferSaveData.editParentID,///
                subLedgerTypeID : this.afferSaveData.subLedgerTypeID,
                isSubLedgerType : this.afferSaveData.isSubLedgerType,
                depreciationRate:this.afferSaveData.depreciationRate,
                parentLedgerID:this.afferSaveData.parentLedgerID,
                expandLevel: node.expandLevel,
                cOALevelCode: this.afferSaveData.cOALevelCode,//node.cOALevelCode,
                assetTypeCode: this.afferSaveData.assetTypeCode,
                transactionNatureCode: this.afferSaveData.transactionNatureCode,
                accountNatureCd: this.afferSaveData.accountNatureCd,
                accountCode: this.afferSaveData.accountCode,
                note: this.afferSaveData.note,
                expanded: node.expanded,
                isActive: node.isActive,
                isRoot: node.isRoot,
              }
            ];

          }
          break;
        }
        if (node.children && node.children.length > 0) {
          this.ch = node.children;
          const foundNode = this.findNodeById(node.children, id);
          if (foundNode) {
            break;
          }
        }
      }
      return null;
    } catch (e) {
      let r = this.ch;
      throw e;
    }
  }

  findNodeByIdForEdit(nodes: any, id: number) {
    try {
      for (let node of nodes) {
        if (node.id === id) {
          node.key = this.afferSaveData.id;
          node.id = this.afferSaveData.id;
          node.parentID = this.afferSaveData.parentID;
          node.label = this.afferSaveData.accountName;
          node.accountName = this.afferSaveData.accountName;
          node.assetTypeCode = this.afferSaveData.assetTypeCode;
          node.transactionNatureCode = this.afferSaveData.transactionNatureCode,
          node.note = this.afferSaveData.note;
          node.accountCode = this.afferSaveData.accountCode;
          node.subLedgerTypeID = this.afferSaveData.subLedgerTypeID,
          node.isSubLedgerType = this.afferSaveData.isSubLedgerType,
          node.depreciationRate = this.afferSaveData.depreciationRate,
          node.parentLedgerID = this.afferSaveData.parentLedgerID,
          node.isActive = this.afferSaveData.isActive;

          if (node.children && node.children.length > 0) {
            node.children[0].key = this.afferSaveData[0].childOrgList[0].id;
            node.children[0].label = this.afferSaveData[0].childOrgList[0].accountName;
            node.key = this.afferSaveData.id;
            node.label = this.afferSaveData.accountName;

          } else {
            node.key = this.afferSaveData.id;
            node.label = this.afferSaveData.accountName;

          }
          break;
        }
        if (node.children && node.children.length > 0) {
          const foundNode = this.findNodeByIdForEdit(node.children, id);
          if (foundNode) {
            break;
          }
        }
      }
      return null;
    } catch (e) {
      throw e;
    }
  }


  // Method to find a node by its ID
  findChildNodeById(nodes: any, id: number) {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = this.findChildNodeById(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

 
  
  // Method to move a child node to another parent
  moveNode(childId: number, newParentId: number, oldParentID: number): void {
    if (newParentId != oldParentID) {
      const childNode = this.findChildNodeById(this.treeDataList, childId);
      if (!childNode) {
        return;
      }
      const newParentNode = this.findChildNodeById(this.treeDataList, newParentId);
      if (!newParentNode) {
        return;
      }

      // Add the child node to the new parent
      if (!newParentNode.children) {
        newParentNode.children = [];
      }

      if (oldParentID != newParentId) {
        this.countLoop =1;
       this.removeNodeByIdAndParentId(this.treeDataList, childId, oldParentID, newParentId);
   
     }
      childNode.parentID =newParentId;
      newParentNode.children.push(childNode);
    }

  }

  countLoop =1;
  editParentID :any;
  removeNodeByIdAndParentId(
    nodes: any,
    id: number,
    oldParentID: number, newParentID: number
  ){
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === id && node.parentID === oldParentID) {
        if(this.countLoop == 1){
          nodes.splice(i, 1); 
          this.countLoop++;
        }
        return; 
      }

      // If the node has children, recursively search in its children
      if (node.children) {
        if (oldParentID != newParentID) {
          this.removeNodeByIdAndParentId(node.children, id, oldParentID, newParentID);
        }
      }
    }
  }

  





  // deleteNodeById(nodes: any[], id: number) {
  //   try {
  //     for (let i = 0; i < nodes.length; i++) {
  //       const node = nodes[i];
  //       if (node.id === id) {
  //         nodes.splice(i, 1);
  //         return true;
  //       }
  //       if (node.children && node.children.length > 0) {
  //         const foundNode = this.deleteNodeById(node.children, id);
  //         if (foundNode) {
  //           return true;
  //         }
  //       }
  //     }
  //     return false;
  //   } catch (e) {
  //     throw e;
  //   }
  // }
  deleteNodeById(nodes: any[], id: number): boolean {
    try {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
  
        // Check if the node itself matches the id
        if (node.id === id) {
          // Recursively delete all child nodes
          if (node.children && node.children.length > 0) {
            // Delete child nodes first
            this.deleteChildNodes(node.children);
          }
          // Remove the node itself
          nodes.splice(i, 1);
          return true;
        }
  
        // If the node has children, check recursively in those
        if (node.children && node.children.length > 0) {
          const foundNode = this.deleteNodeById(node.children, id);
          if (foundNode) {
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      throw e;
    }
  }
  
  // Helper method to delete child nodes (recursive)
  deleteChildNodes(nodes: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // Recursively delete child nodes
      if (node.children && node.children.length > 0) {
        this.deleteChildNodes(node.children);
      }
      // Delete the current node
      nodes.splice(i, 1);
    }
  }
  

  // parent

  mapObjectProps(data: any[]) {
    try {
      return data.map((x) => {

        return {
          label: x.accountName,
          key: x.id,
          parentID: x.parentID,
          id: x.id,
          editParentID: x.editParentID,
          accountNatureCd: x.accountNatureCd,
          accountName: x.accountName,
          assetTypeCode: x.assetTypeCode,
          transactionNatureCode: x.transactionNatureCode,
          subLedgerTypeID: x.subLedgerTypeID,
          isSubLedgerType:x.isSubLedgerType,
          note: x.note,
          depreciationRate: x.depreciationRate,
          parentLedgerID: x.parentLedgerID,
          accountCode: x.accountCode,
          isHide: x.isHide,
          isActive: x.isActive,
          cOALevelCode: x.cOALevelCode,

          cOAStructureID: x.cOAStructureID, // for org and project
          selectedNode: false,
          cOAOrgMapID: x.cOAOrgMapID,
          orgID: x.orgID,
          projectID: x.projectID,
          tag: 0,
          isRoot: false,
          expandLevel: 0

        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  prepareTreeData(arr, parentID) {
    try {
      const master: any[] = [];
      let level = 1;
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        val.expandLevel = level;
        val.label = val.label;
        if (val.parentID == parentID) {
          const children = this.prepareTreeData(arr, val.key);
          if (children.length) {
            val.children = children;
          }
          level++;
          master.push(val);
        }

      }
      return master;
    } catch (error) {
      throw error;
    }
  }



  // org wise coa start

  checkEmptyList() {
    try {
      if (this.cOAOrgMapList.length > 0) return false;
      else return true;
    }
    catch (e) {
      throw e;
    }
  }

  findLedgerNode(nodes: any[]) {
    try {
      nodes.forEach(element => {
        if (element.cOALevelCode == FixedIDs.accountHead.Ledger) {
          element.selectedNode = true;
        } else {
          if (element.children) {
            this.findLedgerNode(element.children);
          }
        }
      });
    } catch (error) {
      throw error
    }
  }

  changeSelectedNode(nodes: any[]) {
    try {
      nodes.forEach(element => {
        element.selectedNode = true;
        if (element.children) {
          this.changeSelectedNode(element.children);
        }
      });
    } catch (error) {
      throw error
    }
  }

  selectNonSelectParentNode(node: any) {
    try {
      if (node.parent) {
        node.parent.selectedNode = false;
        if (node.parent.parent) {
          this.selectNonSelectParentNode(node.parent.parent);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  isExistDataList: any[];
  beforeSave() {
    try {
      this.cOAOrgMapList = [];
      var existData = [];
      var seletedData = this.selectedMenu.filter(x => x.cOALevelCode == FixedIDs.accountHead.Ledger && x.cOAStructureID != null);
      if (this.isExistDataList != null) {
        existData = this.isExistDataList.filter(x => x.cOALevelCode == FixedIDs.accountHead.Ledger && x.cOAStructureID != null);
      }

      seletedData.forEach(element => {
        var obj = existData.find(x => x.id == element.key);
        if (obj != null) {
          element.resetTag();
        }

        // for new inserted
        if (obj == null) {
          element.setInsertTag();
        }
      });

      existData.forEach(element => {
        var obj = seletedData.find(x => x.key == element.id);
        if (obj == null) {
          //for deleted
          element.tag = FixedIDs.objectState.deleted;
          seletedData.push(element);
        }
      });

      //save obj

      seletedData.forEach(element => {
        var obj = new COAOrgMapDTO();
        obj.orgID = this.cOAOrgMapDTO.orgID;
        obj.projectID = this.cOAOrgMapDTO.projectID;
        obj.cOAStructureID = element.cOAStructureID;
        if (element.tag == FixedIDs.objectState.deleted) {
          obj.id = element.cOAOrgMapID;
        }
        obj.tag = element.tag;
        this.cOAOrgMapList.push(obj);

      });

    } catch (e) {
      throw e;
    }
  }

  resetData() {
    try {
      this.selectedMenu = [];
      this.cOAOrgMapDTO = new COAOrgMapDTO();
      //this.treeDataList = GlobalMethods.jsonDeepCopy(this.tempTreeDataList);
    } catch (e) {
      throw (e);
    }

  }

  prepareSelectedData(dataList: any) {
    try {
      const selectedData = this.mapObjectProps(dataList);
      if (selectedData.length > 0) {
        const keys = selectedData.filter(x => x.key != null).map(x => x.key);

        keys.forEach(uniqueID => {
          const findData = this.serverDataList.filter(x => x.key == uniqueID)[0];

          if (findData && findData.cOALevelCode == FixedIDs.accountHead.Ledger){
            findData.selectedNode = true;

            this.selectedMenu.push(findData);
          }
        });
      }
    } catch (error) {
      throw (error);
    }
  }

  updateSelectedNode(nodes: any[]) {
    try {
      nodes.forEach(element => {
        if (element.selectedNode) {
          if (element.children == undefined) { return; }
          const allChildrenSelected = element.children.every((child: any) => child.selectedNode);
          if (allChildrenSelected) {
            // Select the parent if all children are selected
            if (!this.selectedMenu.includes(element)) {
              this.selectedMenu.push(element);
            }
          } else {
            // Unselect the parent if not all children are selected
            const index = this.selectedMenu.indexOf(element);
            if (index !== -1) {
              this.selectedMenu.splice(index, 1);
            }
          }
          if (element.children) {
            this.updateSelectedNode(element.children);
          }
        }

      });
    } catch (error) {
      throw error
    }
  }


  prepareOfficeBranchUnit(data: any) {
    try {
      let categories = [
        {
          label: "-- Office --",
          value: "Office",
          items: [],
        },
        {
          label: "-- Branch --",
          value: "Branch",
          items: [],
        },

        {
          label: "-- Unit --",
          value: "Unit",
          items: [],
        }
      ];

      data.forEach((item) => {
        if (item.organizationElementID == FixedIDs.orgType.Office) {// office
          let catObj = categories.find((x) => x.value == "Office");
          if (catObj) {
            catObj.items.push(item);
          }
        } else if (item.organizationElementID == FixedIDs.orgType.Branch) {// Branch
          let catObj = categories.find((x) => x.value == "Branch");
          if (catObj) {
            catObj.items.push(item);
          }
        }
        else if (item.organizationElementID == FixedIDs.orgType.Unit) {// Unit
          let catObj = categories.find((x) => x.value == "Unit");
          if (catObj) {
            catObj.items.push(item);
          }
        }
      });
      return {
        categories: categories,
      };
    } catch (error) {
      throw error;
    }
  }

  //org wise coa end

}
