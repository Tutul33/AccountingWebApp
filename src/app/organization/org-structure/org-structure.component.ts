import { Component, OnInit } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeNode } from "primeng/api";
import { BaseComponent, ModalConfig, ProviderService, QueryData } from "src/app/app-shared";
import { OrgStructureDataService, OrgStructureEntryModalComponent, ORGStructureModelService } from "..";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-org-structure",
  templateUrl: "./org-structure.component.html",
  providers: [ORGStructureModelService, OrgStructureDataService],
  standalone:true,
  imports:[SharedModule]
})
export class OrgStructureComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  isListShow: boolean = false;
  serverDataList: any[] = [];
  tempServerDataList: any = [];
  orgStructureList: TreeNode[] = [];
  //treeDataList: TreeNode[];

  ref: DynamicDialogRef;
  msgCode = {
    deleteConfirmation: '2235',
    deleteSuccess: '2236',
  }
  selectedNode: any = null;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ORGStructureModelService,
    private dataSvc: OrgStructureDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
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
          this.tempServerDataList = res[res.length - 1] || [];
          this.serverDataList = this.modelSvc.mapObjectProps(res[res.length - 1] || []);
          this.modelSvc.treeDataList = this.modelSvc.prepareTreeData(this.serverDataList, null);
          this.expandAll();
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
          this.serverDataList.forEach((item) => {
            item.isActive = false;
            if(parentID == item.id){
              item.isActive = true;
            }
            });
  
            //this.treeDataList = this.modelSvc.prepareTreeData(this.serverDataList, null);
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


  onNodeClick(parentID: any) {
    try {
      this.isListShow = true;
      this.getOrgStructureTreeByParentIDList(parentID)
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onDelete(node: any) {
    try {
      this.utilitySvc.showConfirmModal(this.msgCode.deleteConfirmation).subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.dataSvc.delete(Number(node.id)).subscribe({
            next: (res: any) => {
             this.modelSvc.deleteNodeById(this.modelSvc.treeDataList,node.id);
              this.showMsg(this.msgCode.deleteSuccess);
            },
            error: (res: any) => { this.showErrorMsg(res) },
          });
        }
      });

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

 
  onAdd(entity: any, isEdit: boolean) {
    try {
      this.modelSvc.afferSaveData =null;
      const modalConfig = new ModalConfig();
      const obj = {
        entity: entity,
        isEdit: isEdit
      };
      modalConfig.data = obj;
      this.ref = this.dialogService.open(OrgStructureEntryModalComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
      this.modelSvc.afferSaveData=data;

      if(isEdit){
        this.modelSvc.findNodeByIdForEdit(this.modelSvc.treeDataList,entity.id);
      }else{
        this.modelSvc.findNodeById(this.modelSvc.treeDataList,entity.id);

      }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  expandAll() {
    let level = 1;
    this.modelSvc.treeDataList.forEach((node) => {
      if(level == 1){
        this.modelSvc.expandLevelTree(node, true);
        level++;
      }
    });
  }

  collapseAll() {
    let level = 1;
    this.modelSvc.treeDataList.forEach((node) => {
      if(level == 1){
        this.modelSvc.collapseLevelTree(node, true);
        level++;
      }
    });
  }



}
