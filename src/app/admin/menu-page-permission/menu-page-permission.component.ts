import { Component, OnInit } from "@angular/core";
import {
  BaseComponent,
  DynamicDialogRef,
  GlobalMethods,
  ModalConfig,
  ProviderService,
  QueryData,
  UserListComponent,
  UserListMenuComponent,
} from "..";
import { MenuPagePermissionDataService, MenuPagePermissionModelService } from "../services/menu-page-permission/menu-page-permission.service";
import { DialogService } from "primeng/dynamicdialog";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-menu-page-permission",
  templateUrl: "./menu-page-permission.component.html",
  providers: [MenuPagePermissionModelService, MenuPagePermissionDataService],
  standalone:true,
    imports:[SharedModule]
})
export class MenuPagePermissionComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  groupList: any = [];
  ref: DynamicDialogRef;
  isDisable = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: MenuPagePermissionModelService,
    private dataSvc: MenuPagePermissionDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getMenuAndPagePermissionList();
    this.getGroupListForMenuAndPagePermission();
  }

  getGroupListForMenuAndPagePermission() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.GetGroupListForMenuAndPagePermission(this.spData).subscribe({
        next: (res: any) => {
          this.groupList = res[res.length - 1] || [];
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getMenuAndPagePermissionList() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.GetMenuAndPagePermissionList(this.spData).subscribe({
        next: (res: any) => {
          this.modelSvc.serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.modelSvc.treeDataList = this.modelSvc.prepareTreeData(this.modelSvc.serverDataList, null);
          this.modelSvc.tempTreeDataList = GlobalMethods.jsonDeepCopy(this.modelSvc.treeDataList);
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getMenuAndPagePermissionListByUserIDorGroupID(userId?: number, groupId?: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.GetMenuAndPagePermissionListByUserIDorGroupID(this.spData, userId, groupId).subscribe({
        next: (res: any) => {
          var result = res[res.length - 1] || [];
          this.modelSvc.prepareSelectedData(result);
          this.modelSvc.isExistDataList = result;
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  selectUser() {
    try {
      this.isDisable = true;
      const modalConfig = new ModalConfig();
      modalConfig.data = { isMultiSelect: false, dataList: [] };
      this.ref = this.dialogService.open(
        UserListComponent,
        modalConfig
      );
      this.ref.onClose.subscribe((obj: any) => {
        this.modelSvc.selectUser(obj,this.modelSvc.menuPermission.groupID);
        if(this.modelSvc.menuPermission.userID != null || this.modelSvc.menuPermission.groupID !=null){
          this.getMenuAndPagePermissionListByUserIDorGroupID(this.modelSvc.menuPermission.userID, this.modelSvc.menuPermission.groupID);
        }

      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onChangeGroup() {
    try {
      this.isDisable = true;
      this.modelSvc.changeGroup();
      if(this.modelSvc.menuPermission.userID != null || this.modelSvc.menuPermission.groupID !=null){
        this.getMenuAndPagePermissionListByUserIDorGroupID(this.modelSvc.menuPermission.userID, this.modelSvc.menuPermission.groupID);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onNodeSelect(node: any) {
    try {debugger
      node.selectedNode = true;
      if (node.children) {
        this.modelSvc.changeSelectedNode(node.children);
      }
    } catch (error) {
      throw error;
    }
  }

  onNodeUnSelect(node: any) {
    try {debugger
      node.selectedNode = false;
      this.modelSvc.selectNonSelectParentNode(node);
    } catch (error) {
      throw error;
    }
  }

  save() {
    try {
      this.modelSvc.beforeSave();
      this.dataSvc.save(this.modelSvc.menuPermissionList).subscribe({
        next: (res: any) => {
          this.showMsg(this.messageCode.saveCode);
          this.isDisable = false;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }

      });
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  reset() {
    try {
      this.isDisable = false;
      this.modelSvc.resetData();
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

}
