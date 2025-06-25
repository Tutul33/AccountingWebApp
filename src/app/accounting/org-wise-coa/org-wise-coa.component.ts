import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, FixedIDs, GlobalConstants, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { COAModelService } from '../services/coa/coa-model.service';
import { COADataService } from '../services/coa/coa-data.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { COAOrgMapDTO, orgAndProjectValidation } from '../models/coa/coa-org-map';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { ActivatedRoute } from '@angular/router';
import { NgForm, UntypedFormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-org-wise-coa',
  templateUrl: './org-wise-coa.component.html',
  providers: [COAModelService, COADataService],
  standalone:true,
  imports:[SharedModule]
})
export class OrgWiseCoaComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("orgAndProjectForm", { static: true, read: NgForm }) orgAndProjectForm: NgForm;

  ref: DynamicDialogRef;
  spData: any = new QueryData();
  tempServerDataList: any = [];
  isControlLegerHide: boolean;
  isProjectWise = false;
  isBranchWise = true;
  hideValue: number = 0;
  showValue: number = 1;
  branchList = [];
  branchName: any;
  projectName: any
  companyName: any;
  projectList: any =[];
  isBranchModuleActive: boolean = false;
  msgCode = {
    deleteConfirmation: '2235',
    deleteSuccess: '2236',
  }

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: COAModelService,
    private dataSvc: COADataService,
    public dialogService: DialogService,
    public coreAccService: CoreAccountingService,
    private orgSvc: OrgService,
    private route: ActivatedRoute,
  ) {
    super(providerSvc);
    this.modelSvc.cOAOrgMapDTO = new COAOrgMapDTO();
    this.validationMsgObj = orgAndProjectValidation();

  }

  ngOnInit(): void {
    this.modelSvc.projectWise = this.route.snapshot.data['projectWise'];
    if (this.modelSvc.projectWise) {
      this.isProjectWise = true;
      this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
      if(!this.isBranchModuleActive){
        this.isBranchWise = false;
      }
    }
    this.getIsControlLedgerHide();
    this.getCompanyList();
    this.modelSvc.projectWiseDataList = [];
    this.modelSvc.treeDataList = [];
    this.modelSvc.selectedMenu = [];
    this.modelSvc.isExistDataList = [];
  }


  getProject(orgId: any) {
    try {
      this.coreAccService
        .getProject(orgId)
        .subscribe({
          next: (res: any) => {
            this.projectList = res || [];
            debugger
            this.modelSvc.cOAOrgMapDTO.orgID = this.isProjectWise && !this.isBranchWise ? null :this.modelSvc.cOAOrgMapDTO.orgID ;
            if(res.length ==1){
              this.modelSvc.cOAOrgMapDTO.projectID = res[0].id;
              
              this.onSelectToPrject();
               this.formResetByDefaultValue(this.orgAndProjectForm.form,this.modelSvc.cOAOrgMapDTO);
             
            }
            
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  onSelectToCompany() {
    try {
      this.projectList = [];
      this.companyName = this.modelSvc.companyList.find(x => x.id == this.modelSvc.cOAOrgMapDTO.companyID)?.name;
      this.modelSvc.officeBrachUnitList = [];
      if(this.isBranchWise){
        this.getOfficeBranchList(this.modelSvc.cOAOrgMapDTO.companyID);
      }
   
      if (this.isProjectWise) {
        this.getProject(this.modelSvc.cOAOrgMapDTO.companyID);
      }

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  checkValidation() {
    try {
      if (this.isProjectWise) {

        let orgctrl = this.orgAndProjectForm.form.controls["orgID"] as UntypedFormGroup;;
        let projectctrl = this.orgAndProjectForm.form.controls["projectID"] as UntypedFormGroup;;

        if (this.modelSvc.cOAOrgMapDTO.orgID == null && this.modelSvc.cOAOrgMapDTO.projectID == null) {
          orgctrl.setValidators(Validators.required);
          orgctrl.updateValueAndValidity();

          projectctrl.setValidators(Validators.required);
          projectctrl.updateValueAndValidity();
        } else if (this.modelSvc.cOAOrgMapDTO.orgID != null && this.modelSvc.cOAOrgMapDTO.projectID == null) {
          projectctrl.reset();
          projectctrl.removeValidators(Validators.required);
          projectctrl.updateValueAndValidity();
        } else if (this.modelSvc.cOAOrgMapDTO.projectID != null && this.modelSvc.cOAOrgMapDTO.orgID == null) {
          orgctrl.reset();
          orgctrl.removeValidators(Validators.required);
          orgctrl.updateValueAndValidity();
        }

      }

    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  onSelectToOfficeBranch() {
    try {
      //this.checkValidation();
      this.branchName = this.branchList.find(x => x.id == this.modelSvc.cOAOrgMapDTO.orgID)?.name;
      if(this.projectList.length == 1){
        this.modelSvc.cOAOrgMapDTO.projectID = this.projectList[0].id;
        this.projectName = this.projectList.find(x => x.id == this.modelSvc.cOAOrgMapDTO.projectID)?.name;
      }
      this.getOrgAndProjectWiseTreeList(this.isControlLegerHide ? this.showValue : this.hideValue);
      this.getOrgAndProjectWiseCOAList(this.isControlLegerHide ? this.showValue : this.hideValue, this.modelSvc.cOAOrgMapDTO.orgID, this.modelSvc.cOAOrgMapDTO.projectID);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectToPrject() {
    try {
      //this.checkValidation();
      
      this.modelSvc.cOAOrgMapDTO.orgID = this.isProjectWise && !this.isBranchWise ? null :this.modelSvc.cOAOrgMapDTO.orgID ;
      this.projectName = this.projectList.find(x => x.id == this.modelSvc.cOAOrgMapDTO.projectID)?.name;
      this.getOrgAndProjectWiseTreeList(this.isControlLegerHide ? this.showValue : this.hideValue);
      this.getOrgAndProjectWiseCOAList(this.isControlLegerHide ? this.showValue : this.hideValue, this.modelSvc.cOAOrgMapDTO.orgID, this.modelSvc.cOAOrgMapDTO.projectID);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onNodeSelect(node: any) {
    try {
      this.orgAndProjectForm.form.markAsDirty();
      node.selectedNode = true;
      if (node.children) {
        this.modelSvc.changeSelectedNode(node.children);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onNodeUnSelect(node: any) {
    try {
      this.orgAndProjectForm.form.markAsDirty();
      node.selectedNode = false;
      this.modelSvc.selectNonSelectParentNode(node);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  save(formGroup: NgForm) {
    try {
      //this.checkValidation();
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.modelSvc.beforeSave();
      //check empty list
      if (this.modelSvc.checkEmptyList()) {
        this.showMsg(this.messageCode.emptyList);
        return;
      }
      this.dataSvc.orgWiseCOASave(this.modelSvc.cOAOrgMapList).subscribe({
        next: (res: any) => {
          this.showMsg(this.messageCode.saveCode);
          this.getOrgAndProjectWiseTreeList(this.isControlLegerHide ? this.showValue : this.hideValue);///
          this.getOrgAndProjectWiseCOAList(this.isControlLegerHide ? this.showValue : this.hideValue, this.modelSvc.cOAOrgMapDTO.orgID, this.modelSvc.cOAOrgMapDTO.projectID);
          formGroup.form.markAsPristine();

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
      this.modelSvc.projectWiseDataList = [];
      this.companyName = '';
      this.branchName = '';
      this.projectName = '';
      this.modelSvc.officeBrachUnitList = [];
      this.projectList = [];
      this.modelSvc.resetData();
      this.formResetByDefaultValue(this.orgAndProjectForm.form, this.modelSvc.cOAOrgMapDTO);
      this.orgAndProjectForm.form.markAsPristine();

    } catch (e) {
      this.showErrorMsg(e);
    }

  }

  getCompanyList() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString(), '').subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res || [];
          this.modelSvc.cOAOrgMapDTO.companyID = GlobalConstants.userInfo.companyID;
          if(this.modelSvc.cOAOrgMapDTO.companyID == null &&  this.modelSvc.companyList.length == 1){
            this.modelSvc.cOAOrgMapDTO.companyID =res[0].id;
          }
          if(res.length >0){
            this.companyName = this.modelSvc.companyList.find(x => x.id == this.modelSvc.cOAOrgMapDTO.companyID)?.name;
          }debugger
          if(this.isBranchWise){
            this.getOfficeBranchList(this.modelSvc.cOAOrgMapDTO.companyID);
          }
          this.getProject(this.modelSvc.cOAOrgMapDTO.companyID);
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

  getOfficeBranchList(companyId: any) {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString(), companyId).subscribe({
        next: (res: any) => {
          this.branchList = res;
          if(this.branchList.length ==1){
            this.modelSvc.cOAOrgMapDTO.orgID = this.branchList[0].id;
            this.onSelectToOfficeBranch();
             this.formResetByDefaultValue(this.orgAndProjectForm.form,this.modelSvc.cOAOrgMapDTO);
            //  this.getOrgAndProjectWiseTreeList(this.isControlLegerHide ? this.showValue : this.hideValue);
            //  this.getOrgAndProjectWiseCOAList(this.isControlLegerHide ? this.showValue : this.hideValue, this.modelSvc.cOAOrgMapDTO.orgID, this.modelSvc.cOAOrgMapDTO.projectID);
           
          }
          this.modelSvc.officeBrachUnitList = this.modelSvc.prepareOfficeBranchUnit(res || []).categories;
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

  getOrgAndProjectWiseCOAList(isHide: number, orgId?: number, projectId?: number) {
    try {
      this.modelSvc.projectWiseDataList = [];
      this.modelSvc.selectedMenu = [];
      this.modelSvc.isExistDataList = [];
      this.spData.pageNo = 0;
      this.dataSvc.getOrgAndProjectWiseCOAList(this.spData, orgId, projectId, isHide).subscribe({
        next: (res: any) => {
          var results = res[res.length - 1] || [];
          if (results.length > 0) {
            this.modelSvc.selectedMenu =[];
            this.modelSvc.orgAndProjectData = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
            this.modelSvc.projectWiseDataList = this.modelSvc.prepareTreeData(this.modelSvc.orgAndProjectData, null);
            this.modelSvc.prepareSelectedData(results);
            this.modelSvc.isExistDataList = results;
            this.modelSvc.updateSelectedNode(this.modelSvc.treeDataList);

            this.updateParentSelection(this.modelSvc.treeDataList);


          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getOrgAndProjectWiseTreeList(isHide: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgAndProjectWiseTreeList(this.spData, isHide).subscribe({
        next: (res: any) => {
          this.modelSvc.commonDropDownList = res[res.length - 1] || [];
          this.tempServerDataList = res[res.length - 1] || [];
          this.modelSvc.serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.modelSvc.treeDataList = this.modelSvc.prepareTreeData(this.modelSvc.serverDataList, null);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getIsControlLedgerHide() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getIsControlLedgerHide(this.spData).subscribe({
        next: (res: any) => {
          let result = res[res.length - 1] || [];
          if (result.length > 0) {
            this.getOrgAndProjectWiseTreeList(this.showValue);
            this.isControlLegerHide = true;
          } else {
            this.getOrgAndProjectWiseTreeList(this.hideValue);
            this.isControlLegerHide = false;
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
///
  updateParentSelection(nodes: any[]) {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        // Recursively update children first
        this.updateParentSelection(node.children);

        // Check if all children are selected
        const allChildrenSelected = node.children.every((child: any) => child.selectedNode === true);

        // Update the parent's selectedNode based on children's selection
        node.selectedNode = allChildrenSelected;
        if(node.selectedNode){
          this.modelSvc.selectedMenu.push(node);
        }
      }
    }
  }
}



