import { Component, OnInit } from "@angular/core";
import {
  BaseComponent,
  ColumnType,
  DynamicDialogRef,
  GlobalMethods,
  GridOption,
  ModalConfig,
  ProviderService,
  QueryData,
  RoleWiseUserListComponent,
  UserListComponent,
} from "..";
import { MenuPagePermissionDataService, MenuPagePermissionModelService } from "../services/menu-page-permission/menu-page-permission.service";
import { DialogService } from "primeng/dynamicdialog";
import { SharedModule } from "src/app/shared/shared.module";


@Component({
  selector: "app-edit-page-permission",
  templateUrl: "./edit-page-permission.component.html",
  providers: [MenuPagePermissionModelService, MenuPagePermissionDataService],
  standalone:true,
  imports:[SharedModule]
})
export class EditPagePermissionComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  groupList: any = [];
  ref: DynamicDialogRef;
  isDisable = false;
  list: any = [];
  menuList: any = [];

  ddlRoleList = [];
  ddlMenuList = [];
  ddlPageList = [];

  gridOption: GridOption;
  permissionLevel = {
    read: 9,
  };

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: MenuPagePermissionModelService,
    private dataSvc: MenuPagePermissionDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getGroupListForMenuAndPagePermission();
    this.getMenuList();
    this.initGridOption();
  }

  initGridOption() {
    try {
      const gridObj = {
        title: '',
        dataSource: "modelSvc.editPagePermissionList",
        columns: this.gridColumns(),
        isGlobalSearch: false,
        isClear: false,
        paginator: true,
        groupBy: '0,1' ,
        exportOption: {
          exportInXL: true,
          exportInPDF:true,
          title: 'Edit Page Permission'
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "groupName", header: this.fieldTitle['role'],isMultiselectFilter: true, dataList: this.ddlRoleList, labelField: 'groupName'},
      { field: "moduleHierarchy", header: this.fieldTitle['menu']},
      { field: "pageTitle", header: this.fieldTitle['pagename'] , isMultiselectFilter: true, dataList: this.ddlPageList, labelField: 'pageTitle' },
      { header: this.fieldTitle['hasaccess'] }
    ]
  }

  bindDataDDLProperties(data: any) {
    try {
      this.ddlRoleList = data[0];
      this.ddlPageList = data[1];
      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("groupName, groupName");
      ddlProperties.push("pageTitle, pageTitle");
    return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
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

  getMenuList() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.GetMenuAndPagePermissionList(this.spData).subscribe({
        next: (res: any) => {
          this.menuList = res[res.length - 1] || [];
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getPagePermissionByUserIdAndGroupId(userId?: number, groupId?: number) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
      });
      this.spData.pageNo = 0;
      this.dataSvc.GetPagePermissionByUserIdAndGroupId(this.spData, userId, groupId).subscribe({
        next: (res: any) => {debugger
          this.bindDataDDLProperties(res);
          var result = res[res.length - 1] || [];
          this.modelSvc.editPagePermissionList = this.modelSvc.setCustomModuleName(result, this.menuList);
          this.modelSvc.tempEditPagePermissionList = GlobalMethods.jsonDeepCopy(result);
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeRole() {
    try {
       this.getPagePermissionByUserIdAndGroupId(null, this.modelSvc.pagePermission.groupID);
      //this.modelSvc.changeRole();
         this.modelSvc.pagePermission.userEmployee = null;
      this.isDisable = false;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  selectUsers() {
      try {
        this.modelSvc.userID = null;
        const modalConfig = new ModalConfig();
        modalConfig.data = {
          dataList: this.modelSvc.userList?this.modelSvc.userList:[],
          isMultiSelect: false,
        };
        this.ref = this.dialogService.open(UserListComponent, modalConfig);
        this.ref.onClose.subscribe((obj: any) => {
             this.modelSvc.userList = obj;
          if (obj != undefined) {
               this.modelSvc.pagePermission.groupID = null;
          const employeeID = obj.hR_EmployeeID !=null ? ' - ' + obj.hR_EmployeeID  : '';
          this.modelSvc.pagePermission.userEmployee = obj.userName + employeeID ;
          this.modelSvc.userID = obj.id;
          if(this.modelSvc.pagePermission.groupID == null){
            this.getPagePermissionByUserIdAndGroupId(obj.id, this.modelSvc.pagePermission.groupID);

          }
          // else{
          //   this.getPagePermissionByUserIdAndGroupId(obj.id, obj.groupId);

          // }
        }
          // if(obj)
          // {
          //   this.modelSvc.userList = obj;
          // }
          // else{
          //   this.modelSvc.userList = [];
          // }
        });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }

  selectUser() {
    try {
      this.isDisable = true;
      const modalConfig = new ModalConfig();
      modalConfig.data = { isMultiSelect: false, dataList: [], groupId: this.modelSvc.pagePermission.groupID };
      this.ref = this.dialogService.open(
        RoleWiseUserListComponent,
        modalConfig
      );
      this.ref.onClose.subscribe((obj: any) => {
        if (obj != undefined) {
          const employeeID = obj.employeeID !=null ? ' - ' + obj.employeeID  : '';
          this.modelSvc.pagePermission.userEmployee = obj.userName + employeeID ;
          this.modelSvc.userID = obj.id;
          if(this.modelSvc.pagePermission.groupID == null){
            this.getPagePermissionByUserIdAndGroupId(obj.id, this.modelSvc.pagePermission.groupID);

          }else{
            this.getPagePermissionByUserIdAndGroupId(obj.id, obj.groupId);

          }
        }

      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  permisssionChange(entity: any, isCheck: any, permissionLevel: any) {
    try {
      this.isDisable = true;
      this.modelSvc.permisssionChange(entity, isCheck, permissionLevel);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  savePagePermission() {
    try {
      this.modelSvc.beforePagePermission();
      this.dataSvc.savePagePermission(this.modelSvc.pagePermissionList).subscribe({
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
      this.modelSvc.editPagePermissionList = GlobalMethods.jsonDeepCopy(this.modelSvc.tempEditPagePermissionList);
    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  resetSearch() {
    try {
      this.isDisable = false;
      this.modelSvc.resetSearch();
      this.modelSvc.pagePermission.groupID = null;
      this.modelSvc.tempEditPagePermissionList = [];

    } catch (e) {
      this.showErrorMsg(e);
    }

  }


}
