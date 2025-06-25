import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';

import {
  ProviderService,
  BaseComponent,
  RoleWiseUserInfoModelService, 
  RoleWiseUserInfoDataService,
  QueryData
} from '../index';

import { MenuService } from 'src/app/shared/services/menu.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-role-wise-user-info',
  templateUrl: './role-wise-user-info.component.html',
  providers: [RoleWiseUserInfoModelService, RoleWiseUserInfoDataService],
  standalone:true,
  imports:[SharedModule]
})
export class RoleWiseUserInfoComponent extends BaseComponent implements OnInit {

  roleList = [];
  userIDList = [];
  employeeIDeList = [];
  employeeNameList = [];
  designationList = [];
  organizationList = [];

  spData: any = new QueryData();
  gridOption: GridOption;
  pageHeader: string;


  constructor(
    protected providerSvc: ProviderService,
    public dialogService: DialogService,
    public modelSvc: RoleWiseUserInfoModelService,
    private dataSvc: RoleWiseUserInfoDataService,
    private menuService: MenuService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    console.log('Field Title:',this.fieldTitle);
    this.getRoleWiseUserList(true);
    this.pageHeader = this.fieldTitle['rolewiseuserlist'];
    this.initGridOption();
  }

  getRoleWiseUserList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getRoleWiseUserList(this.spData).subscribe({
        next: (res: any) => { 
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          this.modelSvc.roleWiseUserList = res[res.length - 1] || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { 
          this.spData.isRefresh = false;
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: this.pageHeader,
        dataSource: "modelSvc.roleWiseUserList",
        columns: this.gridColumns(),
        refreshEvent: this.refreshGridData,
        isGlobalSearch: true,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.pageHeader
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "role", header: this.fieldTitle['role'], isMultiselectFilter: true, dataList: this.roleList, labelField: 'Role' },
      { field: "userID", header: this.fieldTitle['userid'], isMultiselectFilter: true, dataList: this.userIDList, labelField: 'UserID' },
      { field: "employeeID", header: this.fieldTitle['employeeid'], isMultiselectFilter: true, dataList: this.employeeIDeList, labelField: 'EmployeeID' },
      { field: "employeeName", header: this.fieldTitle['employeename'], isMultiselectFilter: true, dataList: this.employeeNameList, labelField: 'EmployeeName' },
      { field: "organization", header: this.fieldTitle['organization'], isMultiselectFilter: true, dataList: this.organizationList, labelField: 'Organization' },
      { field: "designation", header: this.fieldTitle['designation'], isMultiselectFilter: true, dataList: this.designationList, labelField: 'Designation' },
      { header: this.fieldTitle['action'] }
    ]
  }

  refreshGridData() 
  {
    this.getRoleWiseUserList(true);
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("EmployeeID, EmployeeID");
      ddlProperties.push("EmployeeName, EmployeeName");
      ddlProperties.push("Designation, Designation");
      ddlProperties.push("Organization, Organization");
      ddlProperties.push("Role, Role");
      ddlProperties.push("UserID, UserID");
    return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.employeeIDeList = data[0];
      this.employeeNameList = data[1];
      this.designationList = data[2];
      this.organizationList = data[3];
      this.roleList = data[4];
      this.userIDList = data[5];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addNewUserWiseRole() {
    let navigateUrl = '/ADMIN-PAGE/map-user-with-user-role';
    this.menuService.setpageInfoByUrl(navigateUrl);
    this.router.navigateByUrl(navigateUrl);
  }

  delete(entity: any){
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.remove(entity.id).subscribe({
              next: (res: any) => { 
                this.modelSvc.deleteCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                //this.initGridOption();
                this.gridOption.totalRecords = this.modelSvc.roleWiseUserList.length;
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
          }
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
}
