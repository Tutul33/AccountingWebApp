import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';

import {
  ProviderService,
  BaseComponent,
  UserListModelService, 
  UserListDataService,
  QueryData,
  ModalService
} from '../index';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  providers: [ModalService, UserListModelService, UserListDataService],
  standalone:true,
  imports:[SharedModule]
})
export class UserListComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  gridOption: GridOption;
  pageHeader: string;
  isMultiSelect: boolean = false;
  
  userList = [];
  tempUserList = [];

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

  selectedUserList: any = [];
  tempSelectedUserList: any = [];
  modalDataList: any = [];

  constructor(
    protected providerSvc: ProviderService,
    public dialogService: DialogService,
    public modalService: ModalService,
    public modelSvc: UserListModelService,
    private dataSvc: UserListDataService,
    
  ) {
    super(providerSvc);
  }

  
  ngOnInit(): void {
    this.modalService.setHeader(this.fieldTitle['userlist']);
    this.modalService.setWidth('');
    this.isMultiSelect = this.modalService.modalData?.isMultiSelect || false;
    this.modalDataList = this.modalService?.modalData?.dataList;
    this.getUserListData(true, true);
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
          let dataList = res[res.length - 1] || [];

          if (this.modalDataList.length > 0)
          {
            this.modalDataList.forEach(entity => {
              this.selectedUserList.push(entity);
              this.tempSelectedUserList.push(entity);
            });
            this.userList = this.prepareGridList(dataList);
          }
          else
          {
            this.userList = dataList;
          }
          this.tempUserList = JSON.parse(JSON.stringify(this.userList));
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

  prepareGridList(dataList: any) {
    try {
      if (dataList.length > 0) {
        var result = dataList.map((x) => {
          const id = x.id;
          let isPrevSelected = this.modalDataList.filter(
            (e: any) => {
              const modalId = e.id;
              return modalId == id
            }).length;
          return {
            ...x,
            isSelected: isPrevSelected > 0 ? true : false,
            isDisabled: isPrevSelected > 0 ? true : false,
          }
        });
        return result;
      } else {
        this.userList = [];
        this.tempUserList = [];
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  selectSingleItem(entity: any) {
    try {
      if (this.modalService.isModal) {
        this.modalService.close(entity);
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  selectMultipleItem(entity: any, isSelected: boolean) {
    try {
      if(isSelected)
        {
          this.selectedUserList.push(entity);  
        }
      else
        {
          const index = this.selectedUserList.indexOf(entity, 0);
            if (index > -1) {
              this.selectedUserList.splice(index, 1);
            }
        }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  ok() {
    try {
      if (this.modalService.isModal) {
        var list = this.selectedUserList.filter(x => x.isSelected == true);
        this.modalService.close(list);
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  reset() {
    try {
      this.selectedUserList = [];
      this.selectedUserList = this.tempSelectedUserList;
      this.userList = this.prepareGridList(this.tempUserList);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  closeModal() {
    if (this.modalService.isModal) {
      this.modalService.close(this.selectedUserList);
    }
  }
}
