import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, FixedIDs, GlobalConstants, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { ModalService } from 'src/app/shared';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { ProjectDataService, ProjectModelService } from '..';
import { ProjectAttachmentDTO, ProjectDTO, projectUploadValidation } from '../models/project-information/project.model';
import { ColumnType, FileOption, GridOption } from 'src/app/shared/models/common.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-project-upload',
  templateUrl: './project-upload.component.html',
  providers: [ProjectDataService, ProjectModelService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class ProjectUploadComponent extends BaseComponent implements OnInit {

  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("projectUploadForm", { static: true, read: NgForm }) projectUploadForm: NgForm;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  fileName: string;
  dataList: any = [];
  gridOption: GridOption;
  isBrach: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ProjectModelService,
    public modalService: ModalService,
    public dataSvc: ProjectDataService,
    private orgSvc: OrgService,

  ) {
    super(providerSvc);
    this.validationMsgObj = projectUploadValidation();
  }

  ngOnInit(): void {
    debugger
    this.isBrach = this.modalService.modalData?.isBrach;
    this.getCompanyList();
    this.modelSvc.projectDTO = new ProjectDTO();
    this.modelSvc.projectDTO.projectFile = new ProjectAttachmentDTO();
    this.modelSvc.fileUpload = this.modelSvc.fileUploadOption();
    this.modelSvc.configFilePath();
  }

  getCompanyList() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString(), '').subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res;
          this.modelSvc.projectDTO.companyID = GlobalConstants.userInfo.companyID;
          if (this.modelSvc.projectDTO.companyID == null && this.modelSvc.companyList.length == 1) {
            this.modelSvc.projectDTO.companyID = res[0].id;
          }
          this.getOfficeBranchList(GlobalConstants.userInfo.companyID);
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

  onSelectToCompany() {
    try {
      this.modelSvc.newFileInfo.orgID = this.modelSvc.projectDTO.companyID;
      this.modelSvc.officeBranchList = [];
     if(this.isBrach){
      this.getOfficeBranchList(this.modelSvc.projectDTO.companyID);
     }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  fileUploadModal() {
    try {
      this.fileName = this.modelSvc.projectDTO.projectFile.fileName;
      this.modelSvc.fileOption.fileName = this.fileName;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onRemoveImage() {
    try {
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  closeModal() {
    try {
      if (this.modalService.isModal) {
        this.modalService.close();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveProjectUpload(projectUploadForm: NgForm) {
    try {
      //later add branch id
       if (!projectUploadForm.valid) {
              this.directive.validateAllFormFields(projectUploadForm.form as UntypedFormGroup);
              return;
            }
      this.modelSvc.newFileInfo.companyID = this.modelSvc.projectDTO.companyID;
      this.modelSvc.newFileInfo.orgID = this.modelSvc.projectDTO.orgID;
      let messageCode = this.messageCode.saveCode;
      this.dataSvc
        .saveProjectUpload(this.spData, this.modelSvc.newFileInfo)
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.showMsg(messageCode);
              this.modalService.close(res);
            }else{
              this.showMsg('2284');
              this.modalService.close(res);
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

  exportToExcel(): void {
    try {
      let company = this.modelSvc.companyList.find(x => x.id == this.modelSvc.projectDTO.companyID).name;
      if (this.isBrach) {
        let branch = this.branchList.find(x => x.id == this.modelSvc.projectDTO.orgID)?.name;
        this.dataList.push({ 'company': company, 'branch': branch });
      } else {
        this.dataList.push({ 'company': company });
      }


      this.initGridOption();
      this.gridOption.exportOption.title = this.fieldTitle['project'];
      this.modelSvc.exportCSVReport(this.gridOption, this.dataList, this.gridOption.columns);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "dataList",
        columns: this.GridColumns(),
        paginator: true,
        isGlobalSearch: false,
        exportOption: {
          exportInPDF: false,
          exportInXL: true,
          title: "",
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  GridColumns(): ColumnType[] {

    let list = [];

    list.push(
      { field: "company", header: "Company" });
    if (this.isBrach) {
      list.push(
        { field: "branch", header: "Branch" });
    }
    list.push(
      { field: "projectInformation", header: "ProjectInformation" },
      { field: "address", header: "Address" },
      { field: "contactPerson", header: "ContactPerson" },
      { field: "contactPersonEmail", header: "ContactPersonEmail" },
      { field: "contactPersonMobileNo", header: "ContactPersonMobileNo" },
      { field: "website", header: "Website" },
    )
    return list;
  }

  branchList: any;
  getOfficeBranchList(companyId: any) {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString(), companyId).subscribe({
        next: (res: any) => {
          debugger
          this.branchList = res;
          if(this.branchList.length ==1){
            if(this.isBrach){
              this.modelSvc.projectDTO.orgID = this.branchList[0].id;
            }
          }
          this.formResetByDefaultValue(this.projectUploadForm.form,this.modelSvc.projectDTO);
          this.modelSvc.officeBranchList = this.modelSvc.prepareOfficeBranchUnit(res || []).categories;
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



}
