import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { FixedIDs, GlobalMethods, ValidatorDirective } from '../../../shared';
import { NgForm, UntypedFormGroup } from "@angular/forms";
import {
  GlobalConstants,
  ProviderService,
  BaseComponent,
  BusinessConfigDataService,
  BusinessConfigModelService
} from '../../index';
import { ProjectBranchDTO } from "../../models/business-config/business-config.model";
import { AuthenticationService } from '../../../login/services/authentication.service';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-project-branch',
  templateUrl: './project-branch.component.html',
  providers: [BusinessConfigDataService, BusinessConfigModelService],
   standalone:true,
    imports:[
      SharedModule
    ]
})
export class ProjectBranchComponent extends BaseComponent implements OnInit{
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("projectBranchForm", { static: true, read: NgForm }) projectBranchForm: NgForm;
  public validationMsgObj: any;
  voucherType: any = FixedIDs.voucherType;
  isBranchModuleDisable: boolean = false;
  isProjectModuleDisable: boolean = false;

  constructor(
    private authService: AuthenticationService, 
    protected providerSvc: ProviderService,
    public modelSvc: BusinessConfigModelService,
    private dataSvc: BusinessConfigDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.modelSvc.keyCode = "IBMA";
    this.modelSvc.projectBranchDTO = new ProjectBranchDTO();
    this.modelSvc.tempProjectBranchDTO = new ProjectBranchDTO();
    this.getVoucherListForBizConfig();
    this.getProjectBranchList();
  }

  getVoucherListForBizConfig() {
    try {
      this.dataSvc.getVoucherListForBizConfig().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.voucherListForBizConfig = data;
          this.prepareBizConfigData();
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

  prepareBizConfigData() {
    try {
      if(this.modelSvc.voucherListForBizConfig.length > 0)
      {
        this.isBranchModuleDisable = true;
        let data = this.modelSvc.voucherListForBizConfig.find(x => x.projectID != null || x.projectID != '');
        if(data)
        {
          this.isProjectModuleDisable = true;
        }
        else
        {
          this.isProjectModuleDisable = false;
        }
      }
      else
      {
        this.isBranchModuleDisable = false;
        this.isProjectModuleDisable = false;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getProjectBranchList() {
    try {
      this.dataSvc.getProjectBranchList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.projectBranchList = data;

          this.modelSvc.prepareProjectBranchSavedData();
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

  changeBranchorProject(keyCode: string){
    try {
      this.modelSvc.keyCode = keyCode;
      this.modelSvc.prepareProjectBranchSavedData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  saveProjectBranch (formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.modelSvc.prepareProjectBranchDataBeforeSave();
      this.save(this.modelSvc.projectBranchDTO);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  private save(projectBranchDTO: ProjectBranchDTO) {
    try {
      let messageCode = projectBranchDTO.id ? this.messageCode.editCode : this.messageCode.saveCode;
  
      this.dataSvc.saveProjectBranch(projectBranchDTO).subscribe({ 
        next: (res: any) => {
          let data = res.body;
          this.modelSvc.updateVoucherListCollection(data);
          this.modelSvc.tempProjectBranchDTO.isBranchModuleActive = data.isBranchModuleActive;
          this.modelSvc.tempProjectBranchDTO.isProjectModuleActive = data.isProjectModuleActive;
          this.showMsg(messageCode);
          this.projectBranchForm.form.markAsPristine();

          setTimeout(() => {
            this.authService.logout();
          }, 3500);
        },
        error: (e) => {
          this.showErrorMsg(e);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      this.focus(this.projectBranchForm.form, "projectBranch");
      if (this.modelSvc.projectBranchDTO.id > 0) {
        this.modelSvc.projectBranchDTO = GlobalMethods.jsonDeepCopy(this.modelSvc.tempProjectBranchDTO);
      } 
      else {
        this.modelSvc.prepareProjectBranchSavedData();
      }
      this.projectBranchForm.form.markAsPristine();
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }
}
