import { Component, OnInit } from "@angular/core";
import {
  BaseComponent,
  ColumnType,
  DynamicDialogRef,
  GridOption,
  ModalConfig,
  ProviderService,
  QueryData,
  UserListComponent,
  MapUserWithUserRoleModelService,
  MapUserWithUserRoleDataService,
} from "..";
import { DialogService } from "primeng/dynamicdialog";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-map-user-with-user-role",
  templateUrl: "./map-user-with-user-role.component.html",
  providers: [MapUserWithUserRoleDataService, MapUserWithUserRoleModelService],
  standalone:true,
  imports:[SharedModule]
})
export class MapUserWithUserRoleComponent
  extends BaseComponent
  implements OnInit
{
  gridOptionRole: GridOption;
  gridOptionUserGroup: GridOption;
  spData: any = new QueryData();
  ref: DynamicDialogRef;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: MapUserWithUserRoleModelService,
    private dataSvc: MapUserWithUserRoleDataService,
    public dialogService: DialogService
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.initGridOptionOfRole();
    this.initGridOptionOfUserGroup();
    this.loadRole();
    this.initialUserList();
  }

  initialUserList() {
    try {
      this.modelSvc.setDefaultData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOptionOfRole() {
    try {
      const gridObj = {
        dataSource: "modelSvc.roleList",
        columns: this.gridColumnsRole(),
        refreshEvent: this.loadRole,
        paginator: false,
      } as GridOption;
      this.gridOptionRole = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumnsRole(): ColumnType[] {
    try {
      return [
        { field: "name", header: this.fieldTitle["role"], style: "" },
        { header: this.fieldTitle["action"], style: "" },
      ];
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  initGridOptionOfUserGroup() {
    try {
      const gridObj = {
        title: "",
        dataSource: "modelSvc.userList",
        columns: this.gridColumnsUserGroup(),
        paginator: false,
      } as GridOption;
      this.gridOptionUserGroup = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumnsUserGroup(): ColumnType[] {
    try {
      return [
        { field: "userID", header: this.fieldTitle["userid"], style: "" },
        {
          field: "employeeID",
          header: this.fieldTitle["employeeid"],
          style: "",
        },
        {
          field: "employeeName",
          header: this.fieldTitle["employeename"],
          style: "",
        },
        {
          field: "organization",
          header: this.fieldTitle["organization"],
          style: "",
        },
        {
          field: "designation",
          header: this.fieldTitle["designation"],
          style: "",
        },
        { header: this.fieldTitle["action"], style: "" },
      ];
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  loadRole() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.GetRoleList(this.spData).subscribe({
        next: (res: any) => {
          let resData = res[res.length - 1] || [];
          if (resData.length > 0) {
            this.modelSvc.prepareRoleList(resData);
          } else {
            this.modelSvc.roleList = [];
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  save() {
    try {
      if (!this.modelSvc.checkSelectedUserList()) {
        this.showMsg("2192");
        return;
      }
      if (!this.modelSvc.checkSelectedRoleList()) {
        this.showMsg("2193");
        return;
      }

      let saveData = this.modelSvc.prepareDataBeforeSave();

      this.dataSvc.Save(saveData).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.showMsg(this.messageCode.saveCode);
            this.modelSvc.resetAfterSave();
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {},
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  selectUsers() {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.data = {
        dataList: this.modelSvc.userList?this.modelSvc.userList:[],
        isMultiSelect: true,
      };
      this.ref = this.dialogService.open(UserListComponent, modalConfig);
      this.ref.onClose.subscribe((obj: any) => {
        if(obj)
        {
          this.modelSvc.userList = obj;
        }
        else{
          this.modelSvc.userList = [];
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  remove(item) {
    try {
      this.modelSvc.deleteItemFromCollection(item);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  reset(){
    try {
      this.modelSvc.roleList.forEach((item)=>{
       item.isSelected=false;
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
}
