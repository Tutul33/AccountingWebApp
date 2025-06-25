import { Injectable } from "@angular/core";
import { UtilityService } from "src/app/shared/services/utility.service";
import {
  Config,
  FileUploadOption,
  GlobalConstants,
  GlobalMethods,
} from "../..";
import { UntypedFormGroup } from "@angular/forms";
import { ImageFile } from "src/app/shared/models/common.model";
import { Module, ModuleImage } from "../../models/module/module.model";
import { TreeNode } from "primeng/api";
import { FileUploadService } from "src/app/shared/services/file-upload.service";

@Injectable()
export class ModuleModelService {
  menuForm: UntypedFormGroup;
  pageForm: UntypedFormGroup;
  moduleModel: Module;
  moudleList: Module[] = [];
  pageList: Module[] = [];
  projectModuleList: any[] = [];
  imageFileUploadOption: FileUploadOption;
  expandParentMenu: any;
  changeModuleList: any[] = [];
  allMenuList: any[] = [];

  searchQuery: string = "";
  dragDropEnable: boolean = true;

  allTreeData: any[];
  tempTreeMenuList: any;

  tempMenu: any;
  tempNode: any;
  showAction: boolean = false;

  constructor(
    private utilitySvc: UtilityService,
    public fileUploadService: FileUploadService
  ) {}

  setDefaultData(data) {
    try {
      if (data) {
        this.moduleModel = new Module(data);
        this.moduleModel.moduleImage = new ModuleImage();
        if (data.imageName != null) {
          this.moduleModel.moduleImage.id = data.id;
          this.moduleModel.moduleImage.fileName = data.imageName;
          this.moduleModel.moduleImage.folderName =
            Config.imageFolders.pageMenu;
          this.moduleModel.moduleImage.fileTick =
            this.imageFileUploadOption.fileTick;
        }
      } else {
        this.moduleModel = new Module();
      }
    } catch (error) {
      throw error;
    }
  }
  selectedParentMenu:any;
  setTempMenuNode(data) {
    try {
      this.tempMenu = data.selectedMenu;
      this.selectedParentMenu = data.selectedMenu;
      this.tempNode = data.selectedNode;
    } catch (error) {}
  }
  copyPreviousImage() {
    try {
      this.fileUploadService
        .shiftPermanentToTemporaryFiles(
          this.moduleModel.moduleImage.fileTick,
          this.moduleModel.moduleImage.folderName,
          this.moduleModel.moduleImage.folderName,
          this.moduleModel.moduleImage.id.toString()
        )
        .subscribe({
          next: (res: any) => {},
          error: (res: any) => {},
        });
    } catch (error) {
      throw error;
    }
  }

  setMenuInfo(menu) {
    try {
      this.moduleModel.menuTitle = menu.moduleName;
      if (this.moduleModel.id == 0) {
        this.moduleModel.parentID = menu.id;
        this.moduleModel.isPageOrMenu = 2;
        this.moduleModel.applicationID = menu.applicationID;
        this.moduleModel.serialNo = this.getPageSerialNo(this.pageList);
      }
    } catch (error) {}
  }
  getPageSerialNo(page) {
    try {
      let slNo = 0;

      if (this.pageList.length) {
        slNo = this.pageList.length + 1;
      } else {
        slNo = 1;
      }

      return slNo;
    } catch (error) {
      throw error;
    }
  }
  resetModule() {
    try {
      return new Module();
    } catch (error) {
      throw error;
    }
  }

  preparePageList(data) {
    try {
      this.pageList = data;
    } catch (error) {
      throw error;
    }
  }

  setFlagFileOption(entity: any) {
    try {
      entity.flagFile = new ImageFile();
      entity.flagFile.id = entity.id;
      entity.flagFile.fileName = entity.imageFileName;
      entity.flagFile.folderName = Config.imageFolders.pageMenu;
      entity.flagFile.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  prepareSaveDataOfMenu() {
    try {
      this.moduleModel.imageName = this.moduleModel.moduleImage.fileName;
      this.moduleModel.insertUserID = GlobalConstants.userInfo.userPKID;
      this.moduleModel.locationID = GlobalConstants.userInfo.locationID;
      this.moduleModel.isPageOrMenu = 1; //menu = 1
      let model = new Module(this.moduleModel);
      let errorCode = "";
      if (model.parentID == null) {
        if (model.action == "" || model.action == null) {
          errorCode = "2188";
        }
      }
      if (model.serialNo == null || model.serialNo == 0) {
        errorCode = "2189";      
      }
      return { model, errorCode };
    } catch (error) {
      throw error;
    }
  }
  prepareSaveDataOfPage() {
    try {
      this.moduleModel.insertUserID = GlobalConstants.userInfo.userPKID;
      this.moduleModel.locationID = GlobalConstants.userInfo.locationID;
    } catch (error) {
      throw error;
    }
  }

  setFileUploadOption() {
    try {
      this.imageFileUploadOption = new FileUploadOption();
      this.imageFileUploadOption.folderName = Config.imageFolders.pageMenu;
      this.imageFileUploadOption.acceptedFiles = ".png,.jpg,.jpeg,.gif";
      this.imageFileUploadOption.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  updateCollection(module: Module) {
    try {
      this.utilitySvc.updateCollection(this.pageList, module);
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(module: Module) {
    try {
      this.utilitySvc.deleteCollection(this.pageList, module);
    } catch (e) {
      throw e;
    }
  }

  mapAppObjectProps(data: any[]) {
    try {
      return data.map((x) => {
        return {
          label: x.applicationName,
          key: x.applicationID,
          id: 0,
          name: x.applicationName,
          parentID: null,
          parentName: null,
          imageFileName: null,
          selectedNode: false,
          imageFile: null,
          expanded: true,
          applicationID: x.applicationID,
          applicationName: x.applicationName,
          locationID: GlobalConstants.userInfo.locationID,
          isRoot: true,
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  mapObjectProps(data: any[]) {
    try {
      return data.map((x) => {
        let imageFile = null;
        imageFile = new ImageFile();
        imageFile.id = x.id ?? 0;
        imageFile.fileName = x.imageFileName;
        imageFile.folderName = Config.imageFolders.pageMenu;
        //for specific menu to exapnd
        let isExpanded = false;
        if (this.expandParentMenu) {
          if (x.id == this.expandParentMenu.parentID) {
            isExpanded = true;
          }
        }
        return {
          label: x.moduleName,
          key: x.id,
          id: 0,
          name: x.moduleName,
          parentID: x.parentID,
          parentName: x.parentName,
          imageFileName: x.imageFileName,
          selectedNode: false,
          imageFile: imageFile,
          expanded: isExpanded,
          applicationID: x.applicationID,
          applicationName: x.applicationName,
          locationID: x.locationID,
          isRoot: false,
          serialNo: x.serialNo,
          isPageOrMenu:x.isPageOrMenu
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }
  setUpTreeData(appMenuList: any[]) {
    try {
      appMenuList.forEach((app: any) => {
        app.expanded = true;
        let appMenuList = this.allMenuList.filter(
          (x) => x.applicationID == app.key
        );
        let treeMenuData = this.mapObjectProps(appMenuList);
        app.children = this.prepareItemTreeData(treeMenuData, null);
      });
    } catch (error) {
      throw error;
    }
  }
  prepareItemTreeData(arr, parentID) {
    try {
      const master: any[] = [];
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        if (val.parentID === parentID) {
          const children = this.prepareItemTreeData(arr, val.key);
          if (children.length) {
            val.children = children.sort((a, b) => a.serialNo - b.serialNo);
          }

          master.push(val);
        }
      }
      return master;
    } catch (error) {
      throw error;
    }
  }

  getMenuLevel(menu) {
    try {
      let menuLevel = 0;
      menuLevel = menu.menuLevel + 1;
      return menuLevel;
    } catch (error) {
      throw error;
    }
  }

  getMenuSerialNo(menu) {
    try {
      let slNo = 0;
      let menuList = this.moudleList.filter(
        (x) => x.menuLevel == menu.menuLevel && x.parentID == menu.parentID
      );
      if (menuList.length) {
        slNo = menuList.length + 1;
      } else {
        slNo = 1;
      }

      return slNo;
    } catch (error) {
      throw error;
    }
  }

  setNewModule(tempMenu) {
    try {
      this.setFileUploadOption();
      this.moduleModel = new Module();
      this.moduleModel.moduleImage = new ModuleImage();
      this.moduleModel.moduleName = null;
      this.moduleModel.id = 0;

      if (tempMenu.id == 0) {
        this.moduleModel.menuLevel = 1;
        this.moduleModel.parentID = null;
        this.moduleModel.parentName = tempMenu.parentName;
        this.moduleModel.applicationID = 1;
        this.moduleModel.locationID = 1;
        this.moduleModel.serialNo = this.getMenuSerialNo(this.moduleModel);
      } else {
        this.moduleModel.parentID = tempMenu.id;
        this.moduleModel.parentName = tempMenu.moduleName;
        this.moduleModel.applicationID = tempMenu.applicationID;
        this.moduleModel.locationID = GlobalConstants.userInfo.locationID;
        this.moduleModel.menuLevel = this.getMenuLevel(tempMenu);
        this.moduleModel.serialNo = this.getMenuSerialNo(this.moduleModel);
      }
    } catch (error) {
      throw error;
    }
  }

  //Expand new leaf to root hirarchy
  expandHierarchy(TreeData: TreeNode[]) {
    try {
      let leafKey = this.expandParentMenu.parentID.toString();
      let keys = this.findLeafHierarchy(TreeData[0], leafKey);

      if (keys.length > 0) {
        this.expandLeafHierarchy(TreeData, keys);
      }
    } catch (error) {}
  }

  // Function to find hierarchy of a leaf node
  findLeafHierarchy(treeData: any, leafKey: string): string[] {
    try {
      const path: string[] = [];
      this.findLeaf(treeData, leafKey, path);
      return path;
    } catch (error) {
      throw error;
    }
  }

  // Recursive function to find a leaf node and its hierarchy
  private findLeaf(node: TreeNode, leafKey: string, path: string[]) {
    try {
      if (node.key.toString() === leafKey) {
        path.push(node.key);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (this.findLeaf(child, leafKey, path)) {
            path.unshift(node.key.toString()); // Add parent node to the beginning of the path
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      throw error;
    }
  }
  expandLeafHierarchy(treeData: TreeNode[], hierarchyKeys: any) {
    try {
      treeData.forEach((element: TreeNode) => {
        let key = hierarchyKeys.find((key) => key == element.key);
        if (key) {
          element.expanded = true;
        } else {
          element.expanded = false;
        }
        if (element.children) {
          this.expandLeafHierarchy(element.children, hierarchyKeys);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // Recursive function to filter nodes
  filterNodes(nodes: TreeNode[], query: string): TreeNode[] {
    try {
      const filteredNodes: TreeNode[] = [];
      nodes.forEach((node) => {
        const label = node.label.toLowerCase();
        const matches = label.includes(query);
        if (matches) {
          node.expanded = true; // Expand matched node
          filteredNodes.push({
            ...node,
            children: this.filterNodes(node.children || [], query),
          });
        } else if (node.children && node.children.length > 0) {
          const filteredChildren = this.filterNodes(node.children, query);
          if (filteredChildren.length > 0) {
            node.expanded = true; // Expand parent if it has matched children
            filteredNodes.push({ ...node, children: filteredChildren });
          }
        }
      });
      return filteredNodes;
    } catch (error) {
      throw error;
    }
  }

  // Function to collapse all nodes
  collapseAllNodes(nodes: TreeNode[]) {
    try {
      nodes.forEach((node) => {
        node.expanded = false;
        if (node.children && node.children.length > 0) {
          this.collapseAllNodes(node.children);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  changeSelectedNode(nodes: any[]) {
    try {
      nodes.forEach((element) => {
        element.selectedNode = false;
        if (element.children) {
          this.changeSelectedNode(element.children);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  prepareDataToSave() {
    try {
      this.trackMenuChanges = [];
      this.changeModuleList = [];

      this.compareTrees(this.allTreeData, this.tempTreeMenuList);

      this.trackMenuChanges.forEach((item) => {
        if (item.type == "added") {
          //Re-arrange serial no after move a menu to new node
          item.neighbour.forEach((itemChild, index) => {
            let draggedMenu = this.allMenuList.find(
              (x) => x.id == itemChild.key
            );
            if (draggedMenu) {
              let module = this.changeModuleList.find(
                (x) => x.id == draggedMenu.id
              );
              if (module) {
                module.serialNo = index + 1;
                module.parentID = item.parentID;
              } else {
                draggedMenu.serialNo = index + 1;
                draggedMenu.parentID = item.parentID;
                if (item.parentID > 1) this.changeModuleList.push(draggedMenu);
              }
            }
          });
        } else if (item.type == "removed") {
          //Re-arrange serial no after move to another node
          item.neighbour.forEach((itemChild, index) => {
            let draggedMenu = this.allMenuList.find(
              (x) => x.id == itemChild.key
            );
            if (draggedMenu) {
              let module = this.changeModuleList.find(
                (x) => x.id == draggedMenu.id
              );
              if (module) {
                module.serialNo = index + 1;
              } else {
                draggedMenu.serialNo = index + 1;
                this.changeModuleList.push(draggedMenu);
              }
            }
          });
        } else if (item.type == "IndexChanged") {
          //Re-arrange serial no after change of position in same node
          item.neighbour.forEach((itemChild, index) => {
            let draggedMenu = this.allMenuList.find(
              (x) => x.id == itemChild.key
            );
            if (draggedMenu) {
              let module = this.changeModuleList.find(
                (x) => x.id == draggedMenu.id
              );
              if (module) {
                module.serialNo = index + 1;
              } else {
                draggedMenu.serialNo = index + 1;
                this.changeModuleList.push(draggedMenu);
              }
            }
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }
  trackMenuChanges: any[] = [];

  compareTrees(modifiedTree: any[], initialTree: any[]): void {
    try {
      // Iterate through tree1
      modifiedTree.forEach((node1, index) => {
        const correspondingNode = initialTree.find(
          (node2) => node1.key === node2.key
        );
        if (!correspondingNode) {
          this.trackMenuChanges.push({
            node: node1,
            type: "added",
            id: node1.key,
            label: node1.label,
            parentID: node1.parent.key,
            parentLabel: node1.parent.label,
            menuIndex: index,
            neighbour: modifiedTree,
          });
        } else {
          //Change of postion in same node detect
          const initIndex = initialTree.findIndex(
            (obj) => obj.key === node1.key
          );
          if (initIndex != index) {
            this.trackMenuChanges.push({
              node: node1,
              type: "IndexChanged",
              id: node1.key,
              label: node1.label,
              parentID: node1.parent.key,
              parentLabel: node1.parent.label,
              menuIndex: index,
              neighbour: modifiedTree,
            });
          }

          // Recursively compare children
          this.compareTrees(
            node1.children || [],
            correspondingNode.children || []
          );
        }
      });

      // Iterate through tree2 to find removed nodes
      initialTree.forEach((node2, index) => {
        const correspondingNode = modifiedTree.find(
          (node1) => node1.key === node2.key
        );
        if (!correspondingNode) {
          let parent = this.allMenuList.find((x) => x.id == node2.parentID);
          this.trackMenuChanges.push({
            node: node2,
            type: "removed",
            id: node2.key,
            label: node2.label,
            parentID: node2.parentID,
            parentLabel: parent?.moduleName,
            menuIndex: index,
            neighbour: modifiedTree,
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  deleteChangedCollection(module: Module) {
    try {
      this.utilitySvc.deleteCollection(this.changeModuleList, module);
    } catch (e) {
      throw e;
    }
  }

  findParentOfLeaf(
    tree: TreeNode[],
    leafLabel: string,
    parentNode?: any
  ): TreeNode | null {
    
    for (const node of tree) {
      // If the current node is a leaf node and matches the label, return its parent
      if (node.key === leafLabel) {
        return parentNode; // Return the current parent node
      }

      if (node.children) {
        // If the node has children, recursively search through its children
        const parent = this.findParentOfLeaf(node.children, leafLabel, node);
        if (parent) {
          return parent;
        }
      }
    }

    return null; // Leaf not found in the tree
  }

  prepareRearrangeTreeData(results) {
    try {
      let appData = results[0] || [];
      let applist = this.mapAppObjectProps(appData[appData.length - 1]);

      let appMenuList = this.prepareItemTreeData(applist, null);

      let menuData = results[1] || [];
      this.allMenuList =
        menuData.length > 0 ? menuData[menuData.length - 1] : [];

      this.setUpTreeData(appMenuList);

      this.tempTreeMenuList = GlobalMethods.jsonDeepCopy(appMenuList);

      this.allTreeData = appMenuList;
    } catch (error) {
      throw error;
    }
  }

  expandOnMenuDrop(parent) {
    try {
      this.expandParentMenu = {
        parentID: parent.key,
      };
      this.expandHierarchy(this.allTreeData);
    } catch (error) {
      throw error;
    }
  }

  resetRearrangeTree() {
    try {
      this.searchQuery = "";
      this.changeModuleList = [];
      this.dragDropEnable = false;
    } catch (error) {
      throw error;
    }
  }
  enableDragDrop() {
    try {
      this.dragDropEnable = true;
    } catch (error) {
      throw error;
    }
  }
  loadPageData(modalData) {
    try {
      this.pageList = modalData?.pageList;
      this.setFileUploadOption();
      this.setDefaultData(modalData?.page);
      this.setMenuInfo(modalData?.menu);
    } catch (error) {}
  }
  manageNode(node: any, menu, treeData, type) {
    try {
      const parentKey = node.key;
      if (parentKey) {
        switch (type) {
          case "addOrEdit":
            let parentNode = this.findNode(treeData, parentKey);
            if (parentNode) {
              this.addOrUpdateNode(parentNode, menu, node);
            } 
            break;
          case "delete":
            let parentDelNode = this.findNode(treeData, node.parent.key);
            if (parentDelNode) {  
              this.deleteNode(parentDelNode, menu, node);
            }           
            break;
          default:
            break;
        }

        this.allTreeData = treeData;
      }
    } catch (error) {
      throw error;
    }
  }
  private addOrUpdateNode(parentNode: any, menu: any, node: any) {
    try {
      let childList=[];
      if(parentNode.children){
        childList=parentNode.children;
      }else{
        childList=parentNode.parent.children;
      }
      let findMenu = childList.find((x) => x.key == menu.id);
      if (findMenu) {
        findMenu.label = menu.moduleName;
        findMenu.expanded = true;
        this.utilitySvc.updateCollection(this.allMenuList,menu);
      } else {
        let obj = {
          label: menu.moduleName,
          key: menu.id,
          id: 0,
          name: menu.moduleName,
          parentID: node.key,
          parentName: menu.parentName,
          imageFileName: null,
          selectedNode: false,
          imageFile: null,
          expanded: true,
          applicationID: node.applicationID,
          applicationName: node.applicationName,
          locationID: GlobalConstants.userInfo.locationID,
          isRoot: false,
        } as TreeNode;
    
        parentNode.children.push(obj);

        this.allMenuList.push(menu);
      }
    } catch (error) {
      throw error;
    }
  }
  private deleteNode(parentNode: any, menu: any, node: any) {
    try {
      let findMenu = parentNode.children.find((x) => x.key == menu.id);
      if (findMenu) {
        const index=parentNode.children.findIndex(x=>x.key==findMenu.key);
        parentNode.children.splice(index, 1);
      }
    } catch (error) {
      throw error;
    }
  }

  findNode(nodes: any[], key: string): any {
    try {
      for (let node of nodes) {
        if (node.key === key) {
          return node;
        } else if (node.children) {
          const foundNode = this.findNode(node.children, key);
          if (foundNode) {
            return foundNode;
          }
        }
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
  revertParentNodeToPrevNode(draggedNode:any):boolean{
    try {
      if(draggedNode.parent.key==1){//For Serial/Position/Index chnage
        return false;
      }
      const serialIndex=draggedNode.serialNo-1;
      const length=this.allTreeData[0].children.length;
      if(length>serialIndex){
        this.allTreeData[0].children.splice(serialIndex, 0, draggedNode);
      }else{
        this.allTreeData[0].children.push(draggedNode);
      }
      
      const draggedParentNode=this.findNode(this.allTreeData, draggedNode.parent.key);
      if(draggedParentNode.children){
        const index=draggedParentNode.children.findIndex(x=>x.key==draggedNode.key);
        draggedParentNode.children.splice(index, 1);
      }
      return true;
    } catch (error) {
      
    }
  }
  revertChildNodeToPrevNode(draggedNode:any):boolean{
    try {     
      if(draggedNode.parent.key>1){//For Serial/Position/Index chnage
        return false;
      }

      const draggedParentNode=this.findNode(this.allTreeData, draggedNode.parent.key);
      if(draggedParentNode.children){
        const index=draggedParentNode.children.findIndex(x=>x.key==draggedNode.key);
        draggedParentNode.children.splice(index, 1);
      }

      const prevParentNodeFromTemp=this.findNode(this.tempTreeMenuList, draggedNode.key);
      const prevParentNode=this.findNode(this.allTreeData, prevParentNodeFromTemp.parentID);

      let childList=prevParentNode.children?prevParentNode.children:[];
      if(childList.length){
        const serialIndex=prevParentNodeFromTemp.serialNo-1;
        if(childList.length>serialIndex){
          prevParentNode.children.splice(serialIndex, 0, draggedNode);
        }else{
          prevParentNode.children.push(draggedNode);
        }
      }else{
        prevParentNode.children.push(draggedNode);
      }

      return true;
    } catch (error) {
      
    }
  }

  revertChildNodeToPrevNode_IF_Page_Under_Page(draggedNode:any,droppedNode:any):boolean{
    try {  
      
      let droppedNodeObj=droppedNode.children.find(x=>x.key==draggedNode.key);
      if(!droppedNodeObj){
        return false;
      }


      const draggedNodeIndex=droppedNode.children.findIndex(x=>x.key==draggedNode.key);      
      droppedNode.children.splice(draggedNodeIndex, 1);

      const draggedParentNode=this.findNode(this.allTreeData, draggedNode.parent.key);
      if(draggedParentNode.children){
        const index=draggedParentNode.children.findIndex(x=>x.key==draggedNode.key);
        draggedParentNode.children.splice(index, 1);
      }
      
     

      const prevParentNodeFromTemp=this.findNode(this.tempTreeMenuList, draggedNode.key);
      const prevParentNode=this.findNode(this.allTreeData, prevParentNodeFromTemp.parentID);

      let childList=prevParentNode.children?prevParentNode.children:[];
      if(childList.length){
        const serialIndex=prevParentNodeFromTemp.serialNo-1;
        
        if(childList.length>0){
          prevParentNode.children.splice(serialIndex, 0, draggedNode);
        }else{
          prevParentNode.children.push(draggedNode);
        }
      }else{
        prevParentNode.children.push(draggedNode);
      }

      return true;
    } catch (error) {
      
    }
  }
}
