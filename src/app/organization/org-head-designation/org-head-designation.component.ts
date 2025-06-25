import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeNode } from "primeng/api";
import { OrgHeadDesignation, orgHeadDesignationValidation } from "../models/org-head-designation/org-head-designation";
import { UntypedFormGroup, NgForm } from '@angular/forms';

import {
  ProviderService,
  ModalConfig,
  QueryData,
  BaseComponent,
  ValidatorDirective,
  ORGHeadDesignationModelService,
  ORGHeadDesignationDataService,
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";


@Component({
  selector: 'app-company-head-define',
  templateUrl: './org-head-designation.component.html',
  providers: [ORGHeadDesignationModelService, ORGHeadDesignationDataService],
  standalone:true,
  imports:[SharedModule]
})
export class ORGHeadDesignationComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("orgHeadDesignationForm", { static: true, read: NgForm }) orgHeadDesignationForm: NgForm;
  public validationMsgObj: any;
  spData: any = new QueryData();
  isListShow: boolean = false;
  serverDataList: any[] = [];
  orgStructureList: TreeNode[] = [];
  treeDataList: TreeNode[];
  organizationName: string = '';
  isSubmited: boolean = false;

  ref: DynamicDialogRef;
  msgCode = {
    deleteConfirmation: '2235',
    deleteSuccess: '2236',
  }
  selectedNode: any = null;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ORGHeadDesignationModelService,
    private dataSvc: ORGHeadDesignationDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = orgHeadDesignationValidation();
  }

  ngOnInit(): void {
    this.setDeafult();
  }

  setDeafult(){
    this.modelSvc.setDefault();
    this.getOrgStructureId();
    this.getEmployeeDesgination();
  }

  getEmployeeDesgination() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getEmployeeDesgination(this.spData).subscribe({
        next: (res: any) => {
          this.modelSvc.designationList = res[res.length - 1];
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

  getOrgStructureId() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgStructureId(this.spData).subscribe({
        next: (res: any) => {
          let result = res[res.length - 1];
          this.getOrgStructureTreeList(result[0].elementID);
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

  getOrgStructureTreeList(id: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgStructureTreeList(this.spData, id).subscribe({
        next: (res: any) => { 
          this.serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.treeDataList = this.modelSvc.prepareTreeData(this.serverDataList, null);
          //this.expandAll();
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

  getOrgStructureTreeByParentIDList(parentID: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgStructureTreeByParentIDList(this.spData, parentID).subscribe({
        next: (res: any) => {
          this.orgStructureList = [];
          let serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.orgStructureList = this.modelSvc.prepareTreeData(serverDataList, null);
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

  onNodeClick(node: any) {
    try {
      this.isListShow = true;

      this.modelSvc.orgHeadDesignationDTO.orgStructureID = 0;
      this.organizationName = '';
      this.modelSvc.orgHeadDesignationDTO.orgStructureID = node.id;
      this.organizationName = node.label;

      this.change();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  expandAll() {
    this.treeDataList.forEach((node) => {
      this.modelSvc.expandRecursive(node, true);
    });
  }

  collapseAll() {
    this.treeDataList.forEach((node) => {
      this.modelSvc.expandRecursive(node, false);
    });
  }

  save(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.saveOrgHeadDesignation(this.modelSvc.orgHeadDesignationDTO);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveOrgHeadDesignation(orgHeadDesignationtDTO: OrgHeadDesignation) {
    try {
      let messageCode = this.messageCode.editCode;
      this.dataSvc.save(orgHeadDesignationtDTO).subscribe({
        next: (res: any) => {
          this.modelSvc.setDefault();
          this.organizationName = '';
          this.showMsg(messageCode);
          this.isSubmited = false;
        },
        error: (res: any) => {
          this.showMsg(this.messageCode.duplicateEntry);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  change()
  {
    this.isSubmited = true;
    this.orgHeadDesignationForm.form.markAsDirty();
  }

  reset()
  {
    this.modelSvc.setDefault();
    this.organizationName = '';
    this.isSubmited = false;
  }


}
