import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeNode } from "primeng/api";
import { TreeSelect } from 'primeng/treeselect';
import { OrgReportMapping, orgReportMappingValidation } from "../models/org-report-mapping/org-report-mapping";
import { UntypedFormGroup, NgForm } from '@angular/forms';

import {
  ProviderService,
  QueryData,
  BaseComponent,
  ValidatorDirective,
  OrgReportMappingDataService,
  OrgReportMappingModelService,
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-org-report-mapping',
  templateUrl: './org-report-mapping.component.html',
  providers: [OrgReportMappingDataService, OrgReportMappingModelService],
  standalone:true,
  imports:[SharedModule]
})
export class OrgReportMappingComponent extends BaseComponent implements OnInit {
  
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("orgReportMappingForm", { static: true, read: NgForm }) orgReportMappingForm: NgForm;
  public validationMsgObj: any;
  spData: any = new QueryData();
  isListShow: boolean = false;
  serverDataList: any[] = [];
  orgStructureList: TreeNode[] = [];
  treeDataList: TreeNode[];
  reportToOrgStructureList: TreeSelect [];
  organizationName: string = '';
  isSubmited: boolean = false;
  reportToOrgStructure: any;


  ref: DynamicDialogRef;
  msgCode = {
    deleteConfirmation: '2235',
    deleteSuccess: '2236',
  }
  selectedNode: any = null;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: OrgReportMappingModelService,
    private dataSvc: OrgReportMappingDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
    this.validationMsgObj = orgReportMappingValidation();
  }

  ngOnInit(): void {
    this.setDeafult();
  }

  setDeafult(){
    this.modelSvc.setDefault();
    this.getOrgStructureId();
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

  getOrgStructureTreeListByChildID(childID: number) {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgStructureTreeListByChildID(this.spData, childID).subscribe({
        next: (res: any) => {
          this.reportToOrgStructureList = [];
          let serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.reportToOrgStructureList = this.modelSvc.prepareTreeData(serverDataList, null);
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

      this.modelSvc.orgReportMappingDTO.orgStructureID = 0;
      this.organizationName = '';
      this.modelSvc.orgReportMappingDTO.orgStructureID = node.id;
      this.organizationName = node.label;

      this.getOrgStructureTreeListByChildID(node.id);

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
      this.modelSvc.orgReportMappingDTO.reportToOrgStructureID = this.reportToOrgStructure.id;
      this.saveOrgHeadDesignation(this.modelSvc.orgReportMappingDTO);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveOrgHeadDesignation(orgReportMappingDTO: OrgReportMapping) {
    try {
      let messageCode = this.messageCode.editCode;
      this.dataSvc.save(orgReportMappingDTO).subscribe({
        next: (res: any) => {
          this.modelSvc.setDefault();
          this.organizationName = '';
          this.showMsg(messageCode);
          this.isSubmited = false;
          this.reportToOrgStructure = '';
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
    this.orgReportMappingForm.form.markAsDirty();
  }

  reset()
  {
    this.modelSvc.setDefault();
    this.organizationName = '';
    this.reportToOrgStructure = '';
    this.isSubmited = false;
  }
}
