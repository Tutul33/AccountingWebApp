import { Component, OnInit, ViewChild } from "@angular/core";
import {
  BaseComponent,
  ModuleDataService,
  ModuleModelService,
  ProviderService,
  QueryData,
} from "..";
import { forkJoin } from "rxjs";
import { TreeDragDropService } from "primeng/api";
import { MessageService } from "primeng/api";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-menu-page-rearrange",
  templateUrl: "./menu-page-rearrange.component.html",
  providers: [
    ModuleModelService,
    ModuleDataService,
    TreeDragDropService,
    MessageService,
  ],
  standalone:true,
  imports:[SharedModule]
})
export class MenuPageRearrangeComponent
  extends BaseComponent
  implements OnInit
{
  isEdit:boolean=false;
  spData: any = new QueryData();  
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ModuleModelService,
    private dataSvc: ModuleDataService
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getAllData();
    setTimeout(()=>{
      this.modelSvc.dragDropEnable=false;
    },100);
  }

  getAllData() {
    try {
      this.spData.pageNo = 0;
      forkJoin([
        this.dataSvc.GetApplicationList(this.spData),
        this.dataSvc.GetModuleList(this.spData, null, null),
      ]).subscribe({
        next: (results: any) => {
          this.modelSvc.prepareRearrangeTreeData(results);          
        },
        error: (res: any) => {},
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  //Drag Node data management on drop
  onNodeDrop(event: any): void {
    try {
     
      // Retrieve the dragged node
      const draggedNode = event.dragNode;
      const droppedNode = event.dropNode;
      const parent = this.modelSvc.findParentOfLeaf(
        this.modelSvc.allTreeData,
        draggedNode.key,
        null
      );
      
      if(droppedNode.isPageOrMenu==2 && draggedNode.isPageOrMenu==2){//Page can not be placed under a Page.
        setTimeout(() => { 
           const reverted=this.modelSvc.revertChildNodeToPrevNode_IF_Page_Under_Page(draggedNode,droppedNode);
            if(reverted){
             this.showMsg('2223');
            }
            },
         50);
      }
      else{
        if (parent) {
          if (draggedNode.parentID >0 && droppedNode.parentID!=null) {
           this.modelSvc.expandOnMenuDrop(parent);
          }else{
            setTimeout(() => {
              const reverted=this.modelSvc.revertChildNodeToPrevNode(draggedNode);
              if(reverted){
               this.showMsg('2185');
              }
            }, 50);
          }
        }else{
          this.showMsg('2185');
          this.getAllData();
        }
  
        setTimeout(() => {
          if(draggedNode.parentID==null){
            const reverted=this.modelSvc.revertParentNodeToPrevNode(draggedNode);          
            if(reverted){
              this.showMsg('2190');
            }
          }
        }, 50);
      }
      
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  save() {
    try {     
      this.modelSvc.prepareDataToSave();

      const changeModuleList = this.modelSvc.changeModuleList;
      if (changeModuleList.length == 0) {
        this.showMsg("2187");
        return;
      }
 
      this.dataSvc.SaveRearrangeModule(changeModuleList).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.isEdit=false;
            this.modelSvc.changeModuleList = [];
            this.showMsg(this.messageCode.saveCode);
            this.getAllData();
          }
        },
        error: (res: any) => {
          this.isEdit=false;
          this.modelSvc.changeModuleList = [];
          this.showErrorMsg(res);
        },
        complete: () => {},
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  reset() {
    try {
      this.isEdit=false;
      this.modelSvc.resetRearrangeTree();
      this.getAllData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  edit(){
    try {
      this.isEdit=true;
      this.modelSvc.enableDragDrop();        
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  selectedNode: any = null;
  onNodeClick(node: any) {
    this.selectedNode = node;
  }
}
