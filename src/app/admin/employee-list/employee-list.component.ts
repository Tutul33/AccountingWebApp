import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';

import {
  ProviderService,
  BaseComponent,
  ModalService,
  UserProfileModelService, 
  UserProfileDataService,
  QueryData
} from '../index';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  providers: [ModalService, UserProfileModelService, UserProfileDataService],
  standalone:true,
  imports:[SharedModule]
})
export class EmployeeListComponent extends BaseComponent implements OnInit {

  spData: any = new QueryData();
  gridOption: GridOption;
  pageHeader: string;
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
    public modalService: ModalService,
    public modelSvc: UserProfileModelService,
    private dataSvc: UserProfileDataService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.modalService.setHeader('Employee List');
    this.modalService.setWidth('');
    this.getEmployeeListData(true, this.modalService.modalData?.isActive || true, this.modalService.modalData?.option || 0);
    this.pageHeader = this.fieldTitle['employeelist'];
    this.initGridOption();
  }

  getEmployeeListData(isRefresh: boolean, isActive: boolean, option?: any) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getEmployeeListData(this.spData, isActive, option).subscribe({
        next: (res: any) => { 
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          this.modelSvc.employeeList = res[res.length - 1] || [];
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
        dataSource: "modelSvc.employeeList",
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
      { field: "hR_EmployeeID", header: this.fieldTitle['employeeid'], isMultiselectFilter: true, dataList: this.employeeIDeList, labelField: 'HR_EmployeeID' },
      { field: "employeeName", header: this.fieldTitle['employeename'], isMultiselectFilter: true, dataList: this.employeeNameList, labelField: 'EmployeeName' },
      { field: "designation", header: this.fieldTitle['designation'], isMultiselectFilter: true, dataList: this.designationList, labelField: 'Designation' },
      { field: "organization", header: this.fieldTitle['organization'], isMultiselectFilter: true, dataList: this.organizationList, labelField: 'Organization' },
      { field: "email", header: this.fieldTitle['email'], isMultiselectFilter: true, dataList: this.emailList, labelField: 'Email' },
      { field: "contactNo", header: this.fieldTitle['contactno'], isMultiselectFilter: true, dataList: this.contactNoList, labelField: 'ContactNo' },
      { field: "isActive", header: this.fieldTitle['active'], isStatusFilter: true, isBoolean: true, dataList: this.isActiveList, labelField: 'IsActive' },
      { header: this.fieldTitle['action'] }
    ]
  }

  refreshGridData() 
  {
    this.getEmployeeListData(true, this.modalService.modalData?.isActive || true, this.modalService.modalData?.option || 0);
  }

  selectEmployee(entity: any) {
    try {
      this.modalService.close(entity);
    } catch (error) {
      this.showErrorMsg(error);
    }
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

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
}
