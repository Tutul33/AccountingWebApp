import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { TreeNode } from "primeng/api";
import { ApiService, Config, GlobalMethods } from "src/app/shared";
import { MenuPermission, PagePermission } from "../../models/menu-page-permission/menuPage.model";

@Injectable()
export class MenuPagePermissionDataService {
  controllerName = Config.url.adminLocalUrl + "MenuPagePermission";
  constructor(private apiSvc: ApiService) { }

  save(menuPermissionList: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, menuPermissionList, true);
  }

  savePagePermission(pagePermissionList: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/SavePagePermission`, pagePermissionList, true);
  }

  GetMenuAndPagePermissionList(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetMenuAndPagePermissionList",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  GetMenuAndPagePermissionListByUserIDorGroupID(spData: any, userId: number, groupId: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetMenuAndPagePermissionListByUserIDorGroupID",
      {
        data: JSON.stringify(spData),
        userId: userId == null ? '' : userId,
        groupId: groupId == null ? '' : groupId
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }


  GetGroupListForMenuAndPagePermission(spData: any) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetGroupListForMenuAndPagePermission",
      {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  // edit page permission block start
  GetPagePermissionByUserIdAndGroupId(spData: any, userId: number, groupId: number) {
    return this.apiSvc.executeQuery(this.controllerName + "/GetPagePermissionByUserIdAndGroupId",
      {
        data: JSON.stringify(spData),
        userId: userId == null ? '' : userId,
        groupId: groupId == null ? '' : groupId
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
  // end

}


@Injectable()
export class MenuPagePermissionModelService {
  //for menu page permission
  menuPermissionList: MenuPermission[] = [];
  menuPermission: MenuPermission = new MenuPermission();
  selectedMenu: any = [];
  treeDataList: TreeNode[];
  tempTreeDataList: TreeNode[];
  serverDataList: any[];
  isExistDataList: any[];
   userList: any[] = [];

  //for edit page permission block
  editPagePermissionList: any[];
  tempEditPagePermissionList: any[];
  pagePermissionList: PagePermission[] = [];
  pagePermission: PagePermission = new PagePermission();
  hierachyNo: number = 0;
  moduleHierarchyName: any = '';
  maxHieracchyNo: number = 3;

  userID:number = 0;


  beforeSave() {
    try {debugger
      this.menuPermissionList = [];
      // set id selected existing data
      this.selectedMenu.forEach(element => {
        var obj= this.isExistDataList.find(x=>x.id == element.key);
        if(obj !=null){
          element.id = obj.menuPermissionID;
        }
      });

     //add existing unselected data
      this.isExistDataList.forEach(element => {
        var menuObj= this.selectedMenu.find(x=>x.id == element.menuPermissionID);
        if(menuObj==null){
          element.id = element.menuPermissionID;
          element.selectedNode = false;
          this.selectedMenu.push(element);
        }
      });

      //prepare save data list 
        this.selectedMenu.forEach(element => {
            var obj = new MenuPermission();
            obj.userID = this.menuPermission.userID;
            obj.groupID = this.menuPermission.groupID;
            obj.moduleID = element.key;
            obj.id = element.id;
            if(element.id > 0 && !element.selectedNode){
              obj.setDeleteTag();
            }
            if(element.id == 0){
              obj.setInsertTag();
            }
            if(obj.tag != 0 && obj.moduleID != 0){
              this.menuPermissionList.push(obj);
            }
        });
     
    } catch (e) {
      throw e;
    }
  }

  prepareMenuPermissionObj(data:any){
   
    var obj = new MenuPermission();
    obj.userID = this.menuPermission.userID;
    obj.groupID = this.menuPermission.groupID;
    obj.moduleID = data.key;
    obj.tag = data.tag;
    this.menuPermissionList.entityPush(obj);
  }

  prepareSelectedData(dataList: any) {
    try {debugger
      const selectedData = this.mapObjectProps(dataList);
      if (selectedData.length > 0) {
        const keys = selectedData.filter(x => x.key != null).map(x => x.key);

        keys.forEach(uniqueID => {
          const findData = this.serverDataList.filter(x => x.key == uniqueID)[0];
          if (findData) {
            findData.selectedNode = true;
            this.selectedMenu.push(findData);
          }
        });
      }
    } catch (error) {
      throw (error);
    }
  }


  prepareTreeData(arr, parentID) {
    try {
      const master: any[] = [];
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        val.label = val.pageTitle == null ? val.moduleName : val.pageTitle;
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

  mapObjectProps(data: any[]) {
    try {
      return data.map((x) => {

        return {
          label: x.pageTitle,
          key: x.id,
          id: 0,
          parentID: x.parentID,
          moduleName: x.moduleName,
          pageTitle: x.pageTitle,
          selectedNode: false,
          userID: x.userID,
          groupID: x.groupID,
          moduleID: x.moduleID,
          menuPermissionID:x.menuPermissionID,
          isRoot: false,
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  changeGroup() {
    try {
      this.selectedMenu = [];
      this.treeDataList = GlobalMethods.jsonDeepCopy(this.tempTreeDataList);
      //this.menuPermission.userID = null;
      // this.menuPermission.userName = '';
      // this.menuPermission.userEmployeeID = '';
      this.menuPermission.userEmployee = '';

    } catch (e) {
      throw (e);
    }
  }

  selectUser(obj: any,groupId:any) {
    try {
      this.treeDataList = GlobalMethods.jsonDeepCopy(this.tempTreeDataList);
      this.selectedMenu = [];
      if (obj != null) {
        this.menuPermission.userID = obj.id;
        this.menuPermission.groupID = groupId;
        const employeeID = obj.hR_EmployeeID !=null ? '(' + obj.hR_EmployeeID + ')' : '';
        this.menuPermission.userEmployee = obj.userName + employeeID ;
      }

    } catch (e) {
      throw (e);
    }
  }

  resetData() {
    try {
      this.selectedMenu = [];
      this.menuPermission = new MenuPermission();
      this.treeDataList = GlobalMethods.jsonDeepCopy(this.tempTreeDataList);
    } catch (e) {
      throw (e);
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
        node.parent.partialSelected = true;
        node.parent.selectedNode = false;
        if (node.parent.parent) {
          this.selectNonSelectParentNode(node.parent.parent);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // edit page permission block start

  beforePagePermission() {
    try {
      this.pagePermissionList = [];
      this.editPagePermissionList.forEach(element => {
        var obj = new PagePermission(element);
        obj.pageID = element.moduleID;
        obj.userID =this.userID;
        this.pagePermissionList.push(obj);
      });
    } catch (e) {
      throw e;
    }
  }

  permisssionChange(entity: any, isCheck: any, permissionLevel: any) {
    try {
      if (isCheck) {
        this.editPagePermissionList.forEach(element => {
          if (element.id == entity.id) {
            element.tag = isCheck ? 3 : 0;
            element.read = permissionLevel;
            element.accessDeny = null;
          }
        });
      } else {
        this.editPagePermissionList.forEach(element => {
          if (element.id == entity.id) {
            element.tag = isCheck ? 0 : 3;
            element.read = null;
            element.accessDeny = 10;
          }
        });
      }

    } catch (error) {
      throw (error);
    }
  }

  getmodulehierarchyName(moduleID: number, moduleList: any[]) {
    try {
      this.hierachyNo++;

      const moduleInfo = moduleList.find(x => x.id === moduleID);

      if (this.hierachyNo <= this.maxHieracchyNo && moduleInfo?.parentID) {
        const parentModule = moduleList.find(x => x.id === moduleInfo.parentID);

        this.moduleHierarchyName = `${parentModule.moduleName} > ${this.moduleHierarchyName}`;

        if (parentModule.parentID) {
          this.getmodulehierarchyName(parentModule.id, moduleList);
        }
      }
      return this.moduleHierarchyName;
    } catch (e) {
      throw (e);
    }

  }

  setCustomModuleName(userMenuPagePermisssion: any, moduleList: any) {
    try {
      var oldModuleID = null;

      for (var i = 0; i < userMenuPagePermisssion.length; i++) {

        if (oldModuleID === userMenuPagePermisssion[i].moduleID) {
          userMenuPagePermisssion[i].moduleHierarchy = this.moduleHierarchyName;
        } else {

          this.hierachyNo = 0;
          this.moduleHierarchyName = userMenuPagePermisssion[i].moduleName;
          oldModuleID = userMenuPagePermisssion[i].moduleID;
          this.getmodulehierarchyName(userMenuPagePermisssion[i].moduleID, moduleList);
          userMenuPagePermisssion[i].moduleHierarchy = this.moduleHierarchyName;

        }
      }
      return userMenuPagePermisssion;
    } catch (e) {
      throw (e);
    }

  }

  changeRole() {
    try {
      this.pagePermission.userEmployee = null;
      this.editPagePermissionList = [];
      this.tempEditPagePermissionList = [];
      
    } catch (e) {
      throw(e);
    }
  }

  resetSearch() {
    try {
      this.editPagePermissionList = [];
      this.pagePermission = new PagePermission();
    } catch (e) {
      throw (e);
    }

  }
  //end

}


