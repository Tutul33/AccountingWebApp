import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { ColumnType, GridOption } from "src/app/shared/models/common.model";
import {
  ProviderService,
  BaseComponent,
  ValidatorDirective,
  ManageRoleDataService,
  ManageRoleModelService,
  QueryData
} from '../index';
import { ManageRole, manageRoleValidation } from 'src/app/admin/models/manage-role/manage-role.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-manage-role',
  templateUrl: './manage-role.component.html',
  providers: [ManageRoleModelService, ManageRoleDataService],
  standalone:true,
  imports:[SharedModule]
})
export class ManageRoleComponent extends BaseComponent implements OnInit {
  
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("manageRoleForm", { static: true, read: NgForm }) manageRoleForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  roleList: any [];
  isActiveList: any [];
  isDefaultList: any [];
  spData: any = new QueryData();
  pageHeader: string;
  isActive: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ManageRoleModelService,
    private dataSvc: ManageRoleDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = manageRoleValidation();
  }


  ngOnInit(): void {
    this.modelSvc.setDefault();
    this.getUserRoleList(true, this.isActive);
    this.pageHeader = this.fieldTitle['userrolelist'];
    this.initGridOption();
  }

  initGridOption() {
    try {
      const gridObj = {
        title: this.fieldTitle['userrolelist'],
        dataSource: "modelSvc.userRoleList",
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
      { field: "name", header: this.fieldTitle['role'], isMultiselectFilter: true, dataList: this.roleList, labelField: 'Name' },
      { field: "descr", header: this.fieldTitle['description'] },
      { field: "isActive", header: this.fieldTitle['active'], isStatusFilter: true, isBoolean: true, dataList: this.isActiveList, labelField: 'IsActive' },
      { field: "isDefault", header: this.fieldTitle['isdefault'], isStatusFilter: true, isBoolean: true, dataList: this.isDefaultList, labelField: 'IsDefault' },
      { header: this.fieldTitle['action'], styleClass: "d-center" }
    ]
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("Name, Name");
      ddlProperties.push("IsActive, IsActive");
      ddlProperties.push("IsDefault, IsDefault");
    return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.roleList = data[0];
      this.isActiveList = data[1];
      this.isDefaultList = data[2];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  refreshGridData() 
  {
    this.getUserRoleList(true, this.isActive);
  }

  getUserRoleList(isRefresh: boolean, isActive: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getUserRoleList(this.spData, isActive).subscribe({
        next: (res: any) => { 
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          this.modelSvc.userRoleList = res[res.length - 1] || [];
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

  saveManageRole(formGroup: NgForm)
  {
    try{
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.save(this.modelSvc.manageRole);

    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  private save(manageRole: ManageRole) {
    try {
      let messageCode = manageRole.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.save(manageRole).subscribe({
        next: (res: any) => {
          this.updateList(res.body);
          this.setNew();
          this.showMsg(messageCode);
        },
        error: (res: any) => {
          if(res.error.message == '896')
          {
            this.showMsg(this.messageCode.duplicateEntry);
          }
          else
          {
            this.showErrorMsg(this.messageCode);
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(entity: any){
    try {
      if (this.manageRoleForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.modelSvc.prepareEditForm(entity);
            }
          });
      } else {
        this.modelSvc.prepareEditForm(entity);
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
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
                this.gridOption.totalRecords = this.modelSvc.userRoleList.length;
                if (entity.id == this.modelSvc.tempManageRole.id) {
                  this.setNew();
                }
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

  updateList(entity: any) {
    try {
      this.modelSvc.updateCollection(entity);
      if(entity.id == 0)
      {
        this.modelSvc.userRoleList.push(entity);
      }
      this.initGridOption();
      this.gridOption.totalRecords = this.modelSvc.userRoleList.length;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  
  setNew() {
    try {
      this.modelSvc.setDefault();
      this.formResetByDefaultValue(this.manageRoleForm.form, this.modelSvc.manageRole);
      this.focus(this.manageRoleForm.form, 'ManageRole');
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.focus(this.manageRoleForm.form, "manageRole");
      if (this.modelSvc.manageRole.id > 0) {
        this.modelSvc.prepareEditForm(this.modelSvc.tempManageRole);
        this.manageRoleForm.form.markAsPristine();
      } 
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

}
