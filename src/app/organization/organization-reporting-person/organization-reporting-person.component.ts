import { Component, OnInit } from "@angular/core";
import { BaseComponent, GlobalMethods, ModalConfig, ProviderService } from "src/app/app-shared";
import {OrgStructureDataService, ORGStructureModelService } from "..";
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
  selector: 'app-organization-reporting-person',
  templateUrl: './organization-reporting-person.component.html',
  providers: [ORGStructureModelService, OrgStructureDataService],
  standalone:true,
  imports:[SharedModule,HighchartsChartModule]
})
export class OrganizationReportingPersonComponent extends BaseComponent implements OnInit {
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
      // this.getReportingOrgByPerson();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getOrgStructure() {
    try {
      this.modelSvc.spData.pageNo = 0;
      this.dataSvc.getOrgStructure(this.modelSvc.spData).subscribe({
        next: (res: any) => {
          let serverDataList = this.modelSvc.mapTreeObjectProps(res[res.length - 1] || []);
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

  getReportingOrgByPerson(orgID:number) {
    try {
      this.modelSvc.spData.pageNo = 0;
      this.dataSvc.getReportingOrgByPerson(this.modelSvc.spData, orgID).subscribe({
        next: (res: any) => {
          this.modelSvc.tempTreeData = res[res.length - 1] || [];
          let serverDataList = this.modelSvc.mapTreeObjectProps(this.modelSvc.tempTreeData);

          if(serverDataList.length > 0)
          {
            this.modelSvc.reportingTreeDataList = GlobalMethods.prepareTreeData(serverDataList, null);

            this.modelSvc.reportingSelectedNode = this.modelSvc.reportingTreeDataList[0];
            let totalChildLevel = GlobalMethods.getMaxDepthOfNode(this.modelSvc.reportingSelectedNode);
            if(totalChildLevel > 0)
            {
              let parentLevel = GlobalMethods.getNodeLevel(this.modelSvc.reportingSelectedNode, this.modelSvc.reportingTreeDataList, 1);
              this.showLevelSelectionModal(parentLevel, totalChildLevel);
            }
          }

          // if(this.modelSvc.reportingTreeDataList.length > 0)
          // {
          //   let findNode = GlobalMethods.findNodeByKey(this.modelSvc.reportingTreeDataList, this.modelSvc.selectedNode.key);
          //   if(findNode)
          //   {
             
          //   }
          // }

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
          let node =  GlobalMethods.getNodeWithLimitedChildLevel(this.modelSvc.reportingSelectedNode, obj.childLevel);
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
    try {
      this.modelSvc.selectedNode = event.node;
      if(this.modelSvc.selectedNode)
      {

        this.getReportingOrgByPerson(this.modelSvc.selectedNode.id);

       
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  exportPdf(){
    try {
      const chartElement = document.getElementById('org-chart');
      GlobalMethods.exportPdf(chartElement, 'Reporting Organization Structure By Designation');
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

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

