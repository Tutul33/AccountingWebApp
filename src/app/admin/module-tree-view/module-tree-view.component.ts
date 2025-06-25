import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  BaseComponent,
  MenuSetUpComponent,
  ModuleDataService,
  ModuleModelService,
  ProviderService,
  QueryData,
} from "..";
import { TreeNode } from "primeng/api";
import { forkJoin } from "rxjs";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-module-tree-view",
  templateUrl: "./module-tree-view.component.html",
  providers: [ModuleModelService, ModuleDataService],
  standalone:true,
  imports:[SharedModule]
})
export class ModuleTreeViewComponent extends BaseComponent implements OnInit {
  spData: any = new QueryData();
  selectedMenu: any;
  tempNode: any;
  serverDataList: any[] = [];
  applist: any[] = [];
  searchQuery: string = "";
  //filteredTreeData: TreeNode[];
  //allTreeData: TreeNode[];

  @Input() parentComMenu: MenuSetUpComponent;

  //Transmit data to parent comment
  @Output() outputEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ModuleModelService,
    private dataSvc: ModuleDataService
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getAllData();
  }

  getAllData() {
    try {
      this.spData.pageNo = 0;
      let isMenu = 1;
      forkJoin([
        this.dataSvc.GetApplicationList(this.spData),
        this.dataSvc.GetModuleList(this.spData, isMenu, null),
      ]).subscribe({
        next: (results: any) => {
          let appData = results[0] || [];
          this.applist = this.modelSvc.mapAppObjectProps(
            appData[appData.length - 1]
          );
          let appMenuList = this.modelSvc.prepareItemTreeData(
            this.applist,
            null
          );

          let menuData = results[1] || [];
          this.modelSvc.allMenuList =
            menuData.length > 0 ? menuData[menuData.length - 1] : [];
         
          appMenuList.forEach((app: TreeNode) => {
            app.expanded = true;
            let appMenuList = this.modelSvc.allMenuList.filter(
              (x) => x.applicationID == app.key
            );
            let treeMenuData = this.modelSvc.mapObjectProps(appMenuList);
            app.children = this.modelSvc.prepareItemTreeData(
              treeMenuData,
              null
            );
          });
          this.modelSvc.allTreeData = appMenuList;
          //this.filteredTreeData=appMenuList;

          //
         /*  if (this.modelSvc.expandParentMenu) {
            //this.modelSvc.expandHierarchy(this.filteredTreeData);
            this.modelSvc.expandHierarchy(this.allTreeData);
            this.outputEvent.emit({
              allMenu: this.allMenuList,
              isInsertOrUpdate: true,
            });
          } */
        },
        error: (res: any) => {},
      });
    } catch (error) {}
  }

  onNodeSelect(node: any) {
    try {
      this.modelSvc.allTreeData.forEach((item) => {
        this.modelSvc.changeSelectedNode(item.children);
      });
      node.selectedNode = !node.selectedNode;
      let menu = this.modelSvc.allMenuList.find((x) => x.id == node.key);
      if (menu) {
        menu.parentName = node.parent.label;
      } else {
        menu = this.modelSvc.resetModule();
        menu.parentName = node.label;
        menu.parentID = null;
        menu.applicationID = node.applicationID;
      }

      this.outputEvent.emit({
        selectedMenu: menu,
        allMenu: this.modelSvc.allMenuList,
        selectedNode: node,
        isInsertOrUpdate: false,
        allTreeData:this.modelSvc.allTreeData
      });
    } catch (error) {
      throw error;
    }
  }

  updateTree(menu, node,treeData,type) {
    try {
      this.modelSvc.expandParentMenu = menu;
      this.tempNode = node;
      
      this.modelSvc.manageNode(node,menu,treeData,type)

      this.modelSvc.expandHierarchy(this.modelSvc.allTreeData);     
    } catch (error) {
      throw error;
    }
  }
  
  expandChildNode(nodes: any[], menu) {
    try {
      nodes.forEach((element: TreeNode) => {
        if (element.key == menu.parentID) {
          element.expanded = true;
        } else {
          element.expanded = false;
        }
        if (element.children) {
          this.modelSvc.changeSelectedNode(element.children);
        }
      });
    } catch (error) {
      throw error;
    }
  }
  
  selectedNode: any = null;
  onNodeClick(node: any) {
   try {
     this.selectedNode = node;
   } catch (error) {
    this.showErrorMsg(error);
   }
  }

}
