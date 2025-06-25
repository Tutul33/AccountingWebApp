import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';

import {
  ProviderService,
  BaseComponent,
  UserProfileModelService, 
  UserProfileDataService,
  QueryData
} from '../index';

import { MenuService } from 'src/app/shared/services/menu.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-manage-user-profile',
  templateUrl: './manage-user-profile.component.html',
  providers: [UserProfileModelService, UserProfileDataService],
  standalone:true,
  imports:[SharedModule]
})
export class ManageUserProfileComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  gridOption: GridOption;
  pageHeader: string;
  
  userList = [];
  userIDList = [];
  userNameList = [];
  aDUserTypeList = [];
  employeeIDeList = [];
  employeeNameList = [];
  designationList = [];
  organizationList = [];
  emailList = [];
  contactNoList = [];
  isActiveList = [];

  constructor(
    protected providerSvc: ProviderService,
    public dialogService: DialogService,
    public modelSvc: UserProfileModelService,
    private dataSvc: UserProfileDataService,
    private menuService: MenuService,
  ) {
    super(providerSvc);
  }

  
  ngOnInit(): void {
    this.getUserListData(true, false);
    this.pageHeader = this.fieldTitle['userlist'];
    this.initGridOption();
  }

  getUserListData(isRefresh: boolean, isActive: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getUserListData(this.spData, isActive).subscribe({
        next: (res: any) => { 
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          this.userList = res[res.length - 1] || [];

          this.getUserPassword(isActive);
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

  getUserPassword(isActive: boolean) {
    try {
      this.dataSvc.getUserPassword(isActive).subscribe({
        next: (res: any) => {
          let data = res;
          this.userList.forEach((item)=> {
            data.forEach((e)=> {
              if(item.id == e.id)
              {
                item.confirmPassword = e.confirmPassword? e.confirmPassword : null;
                item.employeePassword = e.employeePassword? e.employeePassword: null;
              }
            });
          });
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: this.pageHeader,
        dataSource: "userList",
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
      { field: "userID", header: this.fieldTitle['userid'], isMultiselectFilter: true, dataList: this.userIDList, labelField: 'UserID' },
      { field: "userName", header: this.fieldTitle['username'], isMultiselectFilter: true, dataList: this.userNameList, labelField: 'UserName' },
      { field: "userType", header: this.fieldTitle['usertype'], isMultiselectFilter: true, dataList: this.aDUserTypeList, labelField: 'UserType' },
      { field: "hR_EmployeeID", header: this.fieldTitle['employeeid'], isMultiselectFilter: true, dataList: this.employeeIDeList, labelField: 'HR_EmployeeID' },
      { field: "employeeName", header: this.fieldTitle['employeename'], isMultiselectFilter: true, dataList: this.employeeNameList, labelField: 'EmployeeName' },
      { field: "designation", header: this.fieldTitle['designation'], isMultiselectFilter: true, dataList: this.designationList, labelField: 'Designation' },
      { field: "organization", header: this.fieldTitle['organization'], isMultiselectFilter: true, dataList: this.organizationList, labelField: 'Organization' },
      { field: "contactNo", header: this.fieldTitle['contactno'], isMultiselectFilter: true, dataList: this.contactNoList, labelField: 'ContactNo' },
      { field: "email", header: this.fieldTitle['email'], isMultiselectFilter: true, dataList: this.emailList, labelField: 'Email' },
      { field: "isActive", header: this.fieldTitle['active'], isStatusFilter: true, isBoolean: true, dataList: this.isActiveList, labelField: 'IsActive' },
      { header: this.fieldTitle['action'] }
    ]
  }

  refreshGridData() 
  {
    this.getUserListData(true, false);
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("HR_EmployeeID, HR_EmployeeID");
      ddlProperties.push("EmployeeName, EmployeeName");
      ddlProperties.push("Designation, Designation");
      ddlProperties.push("Organization, Organization");
      ddlProperties.push("Email, Email");
      ddlProperties.push("ContactNo, ContactNo");
      ddlProperties.push("IsActive, IsActive");
      ddlProperties.push("UserID, UserID");
      ddlProperties.push("UserName, UserName");
      ddlProperties.push("UserType, UserType");
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
      this.emailList = data[4];
      this.contactNoList = data[5];
      this.isActiveList = data[6];
      this.userIDList = data[7];
      this.userNameList = data[8];
      this.aDUserTypeList = data[9];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addNewUser() {
    let navigateUrl = '/ADMIN-PAGE/user-profile-entry';
    this.menuService.setpageInfoByUrl(navigateUrl);
    this.router.navigateByUrl(navigateUrl);
  }

  edit(entity: any) {
    try { 
      let obj = {
        entity: entity
      }
      this.dataTransferSvc.broadcast('userInfoObj', obj);
      let navigateUrl = '/ADMIN-PAGE/user-profile-entry';
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
}
