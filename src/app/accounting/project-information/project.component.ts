import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColumnType, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalConstants, ValidatorDirective } from '../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  ProjectDataService,
  ProjectModelService,
  QueryData,
  ProjectUploadComponent
} from '../index';
import { ProjectDTO, projectValidation } from "../models/project-information/project.model";
import { OrgService } from "src/app/app-shared/services/org.service";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  providers: [ProjectDataService, ProjectModelService],
  standalone:true,
  imports:[SharedModule]
})
export class ProjectComponent extends BaseComponent implements OnInit {

  gridOption: GridOption;
  objectState: any = FixedIDs.objectState;
  spData: any = new QueryData();
  isInValidBranch: boolean = false;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("projectForm", { static: true, read: NgForm }) projectForm: NgForm;
  public validationMsgObj: any;
  isPlaceholderDisable: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ProjectModelService,
    private dataSvc: ProjectDataService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
  ) {
    super(providerSvc);
    this.validationMsgObj = projectValidation();
  }

  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.getDefaultData();
  }


  getDefaultData() {
    try {
      this.modelSvc.projectDTO = new ProjectDTO();
      this.getProjectList(true);
      this.getCompanyList();
      this.initGridOption();
    } catch (error) {
      throw error;
    }
  }


  getProjectList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getProjectList(this.spData).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);

          let data = res[res.length - 1] || [];
          this.modelSvc.projectList = data;
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

  getCompanyList() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res || [];
          this.onChangeCompany();

          if(this.modelSvc.companyList.length == 1) {
            this.isPlaceholderDisable = true;
          }
          else
          {
            this.isPlaceholderDisable = false;
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany() {
    try {
      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      let orgID = this.modelSvc.projectDTO.companyID ? this.modelSvc.projectDTO.companyID.toString() : null;
    
      this.orgSvc.getOrgStructure(elementCode, orgID).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareOfficeBranchUnitList(res || []);
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

  onEditLoadCompany(orgID) {
    try {
      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      this.orgSvc.getOrgStructure(elementCode, orgID).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareOfficeBranchUnitList(res || []);
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

  onSelectOrg() {
    try {
      if(this.modelSvc.isBranchModuleActive)
        this.isInValidBranch = this.modelSvc.projectDTO.companyID ? false : true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.projectList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["projectinformation"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "companyName", header: this.fieldTitle['company'], isDDFilter: true, dataList: this.modelSvc.orgNameDDList, labelField: 'CompanyName' },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "unitBranchName", header: this.fieldTitle['unit/branch'], isDDFilter: true, dataList: this.modelSvc.officeBranchUnitDDList, labelField: 'UnitBranchName' }] : []),
      { field: "name", header: this.fieldTitle['projectinformation'], isDDFilter: true, dataList: this.modelSvc.projectNameDDList, labelField: 'Name' },
      { field: "address", header: this.fieldTitle['address'], isDDFilter: true, dataList: this.modelSvc.addressDDList, labelField: 'Address' },
      { field: "contactPerson", header: this.fieldTitle['contactperson'], isDDFilter: true, dataList: this.modelSvc.cntactPersonDDList, labelField: 'ContactPerson' },
      { field: "contactPersonEmail", header: this.fieldTitle['contactpersonemail'], isDDFilter: true, dataList: this.modelSvc.contactPersonEmailDDList, labelField: 'ContactPersonEmail' },
      { field: "contactPersonMobileNo", header: this.fieldTitle['contactpersonmobile'], isDDFilter: true, dataList: this.modelSvc.contactPersonMobileNoDDList, labelField: 'ContactPersonMobileNo' },
      { field: "website", header: this.fieldTitle['website'] },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass: 'd-center' },
      { header: this.fieldTitle['action'] }
    ]
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("Name, Name");
      ddlProperties.push("Address, Address");
      ddlProperties.push("ContactPerson, ContactPerson");
      ddlProperties.push("ContactPersonEmail, ContactPersonEmail");
      ddlProperties.push("ContactPersonMobileNo, ContactPersonMobileNo");
      ddlProperties.push("CompanyName, CompanyName");
      ddlProperties.push("UnitBranchName, UnitBranchName");
      
      return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.projectNameDDList = data[0];
      this.modelSvc.addressDDList = data[1];
      this.modelSvc.cntactPersonDDList = data[2];
      this.modelSvc.contactPersonEmailDDList = data[3];
      this.modelSvc.contactPersonMobileNoDDList = data[4];
      this.modelSvc.orgNameDDList = data[5];
      this.modelSvc.officeBranchUnitDDList = data[6];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  refresh() {
    try {
      this.getProjectList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveProject(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.modelSvc.prepareDataBeforeSave();
      this.checkEntryValidityToSave();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  checkEntryValidityToSave() {
    try {
      const objBrnchPjctInValid = this.modelSvc.hasValidBranchProject();
      if (objBrnchPjctInValid) {  
        this.isInValidBranch = true;
        this.showMsg('2281');
        return;
      }else{
        this.isInValidBranch = false;
      }

      this.save(this.modelSvc.projectDTO);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private save(projectDTO: ProjectDTO) {
    try {
      let messageCode = projectDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.saveSubLedger(projectDTO).subscribe({
        next: (res: any) => {
          this.modelSvc.projectList.push(res.body);

          this.setNew();
          this.showMsg(messageCode);
        },
        error: (res: any) => {
          if (res.error.messageCode == this.messageCode.duplicateEntry) {
            this.showMsg(this.messageCode.duplicateEntry);
          }
          else {
            this.showErrorMsg(res);
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(entity: any) {
    try {
      if (this.projectForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.onEditLoadCompany(entity.orgID);
              this.modelSvc.prepareEditForm(entity);
              this.projectForm.form.markAsPristine();
            }
          });
      } else {
        this.onEditLoadCompany(entity.orgID);
        this.modelSvc.prepareEditForm(entity);
        this.projectForm.form.markAsPristine();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  delete(entity: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.remove(entity.id).subscribe({
              next: (res: any) => {
                this.modelSvc.deleteCollection(entity);
                this.showMsg(this.messageCode.deleteCode);
                this.initGridOption();
                this.gridOption.totalRecords = this.modelSvc.projectList.length;
                if (entity.id == this.modelSvc.tempProjectDTO.id) {
                  this.setNew();
                }
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
          }
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.getDefaultData();
      this.formResetByDefaultValue(this.projectForm.form, this.modelSvc.projectDTO);
      this.focus(this.projectForm.form, 'Project');
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      this.focus(this.projectForm.form, "Project");
      if (this.modelSvc.projectDTO.id > 0) {
        this.projectForm.form.markAsPristine();
        this.formResetByDefaultValue(this.projectForm.form, this.modelSvc.tempProjectDTO);
      }
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  ref: DynamicDialogRef;

  bulkUploadModal() {
    try {

      const modalConfig = new ModalConfig();
      const obj = {isBrach: GlobalConstants.bizConfigInfo.isBranchModuleActive};
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['projectupload'];
      this.ref = this.dialogService.open(ProjectUploadComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.getProjectList(true);
        }

      });

    } catch (error) {

    }
  }


}
