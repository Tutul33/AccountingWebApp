import { AfterViewInit, Component, HostListener, OnInit } from "@angular/core";
import { BaseComponent, GlobalMethods, ModalConfig, ProviderService } from "src/app/app-shared";
import { OrgStructureDataService, ORGStructureModelService } from "..";
import { OrgLevelSelectionComponent } from "../org-level-selection/org-level-selection.component";
import * as Highcharts from "highcharts";
import HCSankey from "highcharts/modules/sankey";
import HCOrganization from "highcharts/modules/organization";
import HCExporting from 'highcharts/modules/exporting';
import HCOfflineExporting from 'highcharts/modules/offline-exporting';
import HCAccessibility from 'highcharts/modules/accessibility';
import { SharedModule } from "src/app/shared/shared.module";
import { HighchartsChartModule } from "highcharts-angular";

HCExporting(Highcharts); 
HCSankey(Highcharts);
HCOrganization(Highcharts);
HCOfflineExporting(Highcharts);
HCAccessibility(Highcharts);

@Component({
  selector: 'app-org-structure-list',
  templateUrl: './org-structure-list.component.html',
  providers: [ORGStructureModelService, OrgStructureDataService],
  standalone:true,
  imports:[SharedModule,HighchartsChartModule]
})
export class OrgStructureListComponent extends BaseComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts; 
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ORGStructureModelService,
    private dataSvc: OrgStructureDataService
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    try {
      this.getOrgStructure();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  

  getOrgStructure() {
    try {
      this.modelSvc.spData.pageNo = 0;
      this.dataSvc.getOrgStructure(this.modelSvc.spData).subscribe({
        next: (res: any) => {
          this.modelSvc.tempTreeData = res[res.length - 1] || [];
          let serverDataList = this.modelSvc.mapTreeObjectProps(this.modelSvc.tempTreeData);
          this.modelSvc.treeDataList = GlobalMethods.prepareTreeData(serverDataList, null);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  showLevelSelectionModal(parentLevel:number, totalChildLevel:number) {
    try {
      this.modelSvc.selectedNodeList = [];
      const modalConfig = new ModalConfig();
      var obj = {
        parentLevel : parentLevel,
        totalChildLevel : totalChildLevel
      };
      modalConfig.data = obj;
      this.modelSvc.ref = this.dialogSvc.open(OrgLevelSelectionComponent, modalConfig);
      this.modelSvc.ref.onClose.subscribe((obj: any) => {
        if (obj) {
          let node =  GlobalMethods.getNodeWithLimitedChildLevel(this.modelSvc.selectedNode, obj.childLevel);
          //this.modelSvc.expandTree(node, true);
          //this.modelSvc.selectedNodeList.push(node);
          let list = this.modelSvc.prepareTreeListFromNode(node);
          this.modelSvc.prepareHighChartData(list);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  

  
  nodeSelect(event:any)
  {
    try 
    {
      this.modelSvc.selectedNode = event.node;

      if(this.modelSvc.selectedNode)
      {
        let totalChildLevel = GlobalMethods.getMaxDepthOfNode(this.modelSvc.selectedNode);
        if(totalChildLevel > 0)
        {
          let parentLevel = GlobalMethods.getNodeLevel(this.modelSvc.selectedNode, this.modelSvc.treeDataList, 1);
          this.showLevelSelectionModal(parentLevel, totalChildLevel);
        }
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  exportPdf(){
    try {
      const chartElement = document.getElementById('org-chart');
      GlobalMethods.exportPdf(chartElement, 'Organization Structure');
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  // @HostListener('wheel', ['$event']) onMouseWheel(event: any) {
  //   if (event.ctrlKey == true) {
  //     this.modelSvc.chartOptions.chart
  //   }
  // } 

  expandAll() {
    this.modelSvc.treeDataList.forEach((node) => {
      this.modelSvc.expandTree(node, true);
    });
  }

  collapseAll() {
    this.modelSvc.treeDataList.forEach((node) => {
      this.modelSvc.expandTree(node, false);
    });
  }

}

