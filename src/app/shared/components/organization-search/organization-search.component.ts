import { Component, OnInit } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeNode } from "primeng/api";
import { OrganizationSearchDataService, OrganizationSearchModelService } from './service/organization-search.service'
import { ModalService } from '../../services/modal.service';

import {
  ProviderService,
  QueryData  
} from '../../index';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TreeModule } from "primeng/tree";

@Component({
  selector: 'app-organization-search',
  templateUrl: './organization-search.component.html',
  providers: [ModalService, OrganizationSearchDataService, OrganizationSearchModelService],
  standalone:true,
   imports:[CommonModule,FormsModule,ButtonModule,TreeModule]
})
export class OrganizationSearchComponent extends BaseComponent implements OnInit {

  spData: any = new QueryData();
  isListShow: boolean = false;
  serverDataList: any[] = [];
  orgStructureList: TreeNode[] = [];
  treeDataList: TreeNode[];
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
    public modelSvc: OrganizationSearchModelService,
    private dataSvc: OrganizationSearchDataService,

    public dialogService: DialogService,
    public modalService: ModalService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.setDeafult();
  }

  setDeafult(){
    this.getOrgStructure();
  }

  getOrgStructure() {
    try {
      this.spData.pageNo = 0;
      this.dataSvc.getOrgStructure(this.spData).subscribe({
        next: (res: any) => {
          this.serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.treeDataList = this.modelSvc.prepareTreeData(this.serverDataList, null);
          this.expandAll();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onNodeClick(node: any) {
    try { 
      this.modalService.close(node.id);
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
}
