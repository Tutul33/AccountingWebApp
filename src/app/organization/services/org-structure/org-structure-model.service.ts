import { Injectable } from "@angular/core";
import { TreeNode } from "primeng/api";
import { ORGStructureDTO } from "../../models/org-structure/org-structure";
import { QueryData } from "src/app/shared/models/common.model";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import * as Highcharts from "highcharts";

@Injectable()
export class ORGStructureModelService {
  //static instance: ORGStructureModelService;
  oRGStructureDTOs: ORGStructureDTO[] = [];
  orgStructure: ORGStructureDTO = null;
  isEdit: boolean = false;
  isParent: boolean = false;

  //for report
  spData: any = new QueryData();
  treeDataList: TreeNode[];
  tempTreeData:any[] = [];
  reportingTreeDataList: TreeNode[];
  ref: DynamicDialogRef;
  selectedNode: any = null;
  reportingSelectedNode: any = null;
  selectedNodeList:TreeNode[] = [];

  hideParentName:boolean = false;
  chartOptions: Highcharts.Options;
  linksFrom:any;
  offset = 0;
  randomColor:any[] = [];
  expandIcon:string = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M12 17a1.72 1.72 0 0 1-1.33-.64l-4.21-5.1a2.1 2.1 0 0 1-.26-2.21A1.76 1.76 0 0 1 7.79 8h8.42a1.76 1.76 0 0 1 1.59 1.05a2.1 2.1 0 0 1-.26 2.21l-4.21 5.1A1.72 1.72 0 0 1 12 17"/></svg>';
  collapseIcon:string = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M16.21 16H7.79a1.76 1.76 0 0 1-1.59-1a2.1 2.1 0 0 1 .26-2.21l4.21-5.1a1.76 1.76 0 0 1 2.66 0l4.21 5.1A2.1 2.1 0 0 1 17.8 15a1.76 1.76 0 0 1-1.59 1"/></svg>';
  constructor(
  ) { 
    //return (ORGStructureModelService.instance = ORGStructureModelService.instance || this);
  }

  expandRecursive(node: any, isExpand: boolean) {
    try {
      node.expanded = isExpand;
    if (node.children) {
     
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand);
      });
    }
    
  } catch (e) {
    throw e;
  }
  }

  addAnotherAfferSave(node:any){
    try{
      
      this.afferSaveData = node;
this.findNodeById(this.treeDataList, node[0].id);
    }catch(e){
      throw e;
    }
  }

  afferSaveData:any = null;
  findNodeById(nodes: any, id: number){
    try {
    for (let node of nodes) {
      if (node.id === id) {
        if(node.children && node.children.length > 0){
          node.children.push(
            {
              id:this.afferSaveData[0].id ,
              key:this.afferSaveData[0].id,
              label:this.afferSaveData[0].name,
              parentID:node.parentID, 
              expandLevel:node.expandLevel, 
              expanded:node.expanded, 
              isActive:node.isActive, 
              isRoot:node.isRoot,
              children: this.afferSaveData[0].childOrgList.length > 0 ? [{
                  id:this.afferSaveData[0].childOrgList[0].id ,
                  key:this.afferSaveData[0].childOrgList[0].id,
                  label:this.afferSaveData[0].childOrgList[0].name,
                  parentID:this.afferSaveData[0].id, 
                  expandLevel:node.expandLevel, 
                  expanded:node.expanded, 
                  isActive:node.isActive, 
                  isRoot:node.isRoot }] : null
            
            });
        }else{
        node.children=[
          {
            id:this.afferSaveData[0].id,
            key:this.afferSaveData[0].id,
            label:this.afferSaveData[0].name,
            parentID:node.parentID, 
            expandLevel:node.expandLevel, 
            expanded:node.expanded, 
            isActive:node.isActive, 
            isRoot:node.isRoot,
            children: this.afferSaveData[0].childOrgList.length > 0 ? [{
                id:this.afferSaveData[0].childOrgList[0].id ,
                key:this.afferSaveData[0].childOrgList[0].id,
                label:this.afferSaveData[0].childOrgList[0].name,
                parentID:this.afferSaveData[0].id, 
                expandLevel:node.expandLevel, 
                expanded:node.expanded, 
                isActive:node.isActive, 
                isRoot:node.isRoot }] : null
            
           }
          ];
        
      }
      break;
      }
      if (node.children && node.children.length > 0) {
        const foundNode = this.findNodeById(node.children, id);
        if (foundNode) {
          break;
        }
      }
    }
    return null;
  } catch (e) {
    throw e;
  }
  }

  findNodeByIdForEdit(nodes: any, id: number){
    try {
    for (let node of nodes) {
      if (node.id === id) {
        debugger
        node.key = this.afferSaveData[0].id;
        node.label = this.afferSaveData[0].name;

        if(node.children && node.children.length > 0){
          node.children[0].key =this.afferSaveData[0].childOrgList[0].id;
          node.children[0].label = this.afferSaveData[0].childOrgList[0].name;

          node.key = this.afferSaveData[0].id;
          node.label = this.afferSaveData[0].name;
         
        }else{
          node.key = this.afferSaveData[0].id;
          node.label = this.afferSaveData[0].name;
        
      }
      break;
      }
      if (node.children && node.children.length > 0) {
        const foundNode = this.findNodeByIdForEdit(node.children, id);
        if (foundNode) {
          break;
        }
      }
    }
    return null;
  } catch (e) {
    throw e;
  }
  }

  deleteNodeById(nodes: any[], id: number) {
    try {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === id) {
            nodes.splice(i, 1);
            return true; 
        }
        if (node.children && node.children.length > 0) {
            const foundNode = this.deleteNodeById(node.children, id);
            if (foundNode) {
                return true; 
            }
        }
    }
    return false; 
  } catch (e) {
    throw e;
  }
  }

  expandLevelTree(node: TreeNode, isExpand: boolean) {
    try {
    node.expanded = isExpand;
  } catch (e) {
    throw e;
  }
  }

  collapseLevelTree(node: TreeNode, isExpand: boolean) {
    try {
    node.expanded = isExpand;
    if (node.children) {
     
      node.children.forEach((childNode) => {
        this.collapseLevelTree(childNode, false);
      });
    }
  } catch (e) {
    throw e;
  }
  }

  addNew() {
    try {
      this.orgStructure = new ORGStructureDTO();
    } catch (e) {
      throw e;
    }
  }

  prepareOrg(id: number) {
    try {
    this.oRGStructureDTOs = []; 
    let org = new ORGStructureDTO(this.orgStructure);
    org.parentID = id;
    org.isOffice = this.isEdit && org.isOffice ? true : false;
    this.isEdit ? org.setModifyTag() : org.setInsertTag()
    this.isEdit ? org.id = this.orgStructure.id : org.id = 0;
    this.isEdit ? org.parentID = this.orgStructure.parentID : org.parentID = org.parentID;
    if (org.office) {
      let orgObj = new ORGStructureDTO(org);
      orgObj.isOffice = true;
      orgObj.name = orgObj.office;
      orgObj.elementID = orgObj.orgElementID;
      this.isEdit ? orgObj.id = this.orgStructure.childID : orgObj.id = 0;
      this.isEdit ? orgObj.setModifyTag() : orgObj.setInsertTag();
      org.childOrgList = [];
      org.childOrgList.push(orgObj);
    }

    this.oRGStructureDTOs.push(org);
  } catch (e) {
    throw e;
  }
  }

  prepareOrgForEdit(parentID: any, orgobj: any) {
    try {
      // if (parentID == null) {
      //   this.orgStructure.name = orgobj.parentName;
      //   this.orgStructure.elementID = orgobj.ownElementID;
      //   this.isParent = false;
      // } else {

      if(orgobj.ownParentID ==null){
        this.hideParentName = true;
      }

        this.orgStructure.parentName = orgobj.parentName;
        this.orgStructure.elementID = orgobj.ownElementID;
        this.orgStructure.name = orgobj.ownName;
        this.orgStructure.orgElementID = orgobj.childElementID
        this.orgStructure.office = orgobj.childName;

        this.orgStructure.id = orgobj.ownID;
        this.orgStructure.childID = orgobj.childID;
        this.orgStructure.parentID = orgobj.ownParentID;
      //}
    } catch (e) {
      throw e;
    }
  }


  // parent

  mapObjectProps(data: any[]) {
    try {
      return data.map((x) => {

        return {
          label: x.name,
          key: x.id,
          parentID: x.parentID,
          id: x.id,
          typeCd: x.typeCd,
          selectedNode: false,
          isRoot: false,
          isActive:false,
          expandLevel:0
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  prepareTreeData(arr, parentID) {
    try {
      const master: any[] = [];
      let level = 1;
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        val.expandLevel = level;
        val.label = val.label;
        if (val.parentID == parentID) {
          const children = this.prepareTreeData(arr, val.key);
          if (children.length) {
            val.children = children;
          }
          level++;
          master.push(val);
        }
        
      }
      return master;
    } catch (error) {
      throw error;
    }
  }

  // for org-straucture list

  mapTreeObjectProps(data: any[]) {
    try {
      return data.map((x) => {
        return {
          label: x.name,
          key: x.id,
          parentID: x.parentID,
          id: x.id,
          selectedNode: false,
          isRoot: false,
          styleClass: this.prepareNodeStyle(x)
        } as TreeNode;
      });
    } catch (error) {
      throw error;
    }
  }

  prepareNodeStyle(x) {
    try {
      return (x.textColorCd ? 'color:' + x.textColorCd + ';' : '') + (x.fillColorCd ? 'background:' + x.fillColorCd : '');
    } catch (e) {
      throw e;
    }
  }

  expandTree(node: TreeNode, isExpand: boolean) {
    try{
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandTree(childNode, isExpand);
      });
    }
  } catch (e) {
    throw e;
  }
  }

  // Recursive function to prepare tree list
  prepareTreeListFromNode(selectedNode: TreeNode, parentId: string | null = null): any[] {
    try {
      let nodeList: any[] = [];
      let nodeStyle = this.tempTreeData.find(f => f.id == selectedNode.key);
      const currentNode: any = {
        id: selectedNode.key,
        parentID: parentId,
        name: selectedNode.label,
        fillColorCd: nodeStyle?.fillColorCd,
        textColorCd: nodeStyle?.textColorCd
      };
      nodeList.push(currentNode);

      if (selectedNode.children && selectedNode.children.length > 0) {
        for (let child of selectedNode.children) {
          nodeList = nodeList.concat(this.prepareTreeListFromNode(child, selectedNode.key));
        }
      }

    return nodeList;
    } catch (e) {
      throw e;
    }
  }

  getNodeStyleById(id:number){
    try {
      
    } catch (e) {
      throw e;
    }
  }

  getRandomColor(id:any) {
    let exColor = this.randomColor.find(f=> f.id == id);
    if(exColor)
    {
      return exColor.linkColor;
    }
    let color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    if(color == '#000000' || color == "#ffffff" || color == "#FFFFFF" || color.length < 7)
    {
      color = "#FF0000";
    }
    this.randomColor.push({
      id:id,
      linkColor: color
    });
    return color;
 }


  prepareHighChartData(treeList:any[]){
    try {
      this.randomColor = [];
    let dataList = treeList
      .filter(node => node.parentID)
      .map(node => ({ from: node.parentID.toString(), to: node.id.toString(), linkColor : this.getRandomColor(node.parentID), linkLineWidth: 1.8  }));
    let nodeList = treeList.map(node => ({
      id: node.id.toString(),
      name: node.name,
      collapsed: true,
      color: node.fillColorCd,
      dataLabels: {
        style: {
          color:node.textColorCd || 'white',
        },
      },
      offsetVertical : node.offsetVertical || 0,
      nodeWidth: 'auto',
    }));

    this.chartOptions = {
      chart: {
        height: 600,
        type: 'organization',
        inverted: true,
      },
      title: {
        text: 'Organization Structure'
      },
      plotOptions: {
        series: {
          point: {
            events: {
              click: function(event) {
                const point = event.point;
                const operateChildren = (childPoint, operation) => {
                  if(operation == 'hide' && childPoint.id != point.id)
                  {
                    childPoint.collapsed = true;
                    let iconHtml = document.getElementById('tree' + childPoint.id);
                    if(iconHtml)
                    {
                      iconHtml.innerHTML = this.expandIcon;
                    }
                  }
                  childPoint.linksFrom.forEach(link => {
                    link.graphic[operation]();
                    link.toNode.graphic[operation]();
                    link.toNode.dataLabel[operation]();
                    operateChildren(link.toNode, operation);
                  });
                };
                
                point.collapsed = !point.collapsed;

                if(point.collapsed)
                {
                  operateChildren(point, 'show');
                }
                else{
                  operateChildren(point, 'hide');
                }
                const icon = point['collapsed'] ? this.expandIcon : this.collapseIcon;  
                let iconHtml = document.getElementById('tree' + point.id);
                iconHtml.innerHTML = icon;
              }.bind(this)
            }
          },
        },
        organization:{
          dataLabels:{
            useHTML:true,
               nodeFormatter: function () {
                // Call the default renderer
                  var html = (Highcharts.defaultOptions
                    .plotOptions
                    .organization
                    .dataLabels as Highcharts.SeriesOrganizationDataLabelsOptionsObject)
                    .nodeFormatter
                    .apply(this);
                 const icon = this.point['collapsed'] ?  
                 '<div id="tree' + this.point['id'] + '" class="expandCollapse"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M12 17a1.72 1.72 0 0 1-1.33-.64l-4.21-5.1a2.1 2.1 0 0 1-.26-2.21A1.76 1.76 0 0 1 7.79 8h8.42a1.76 1.76 0 0 1 1.59 1.05a2.1 2.1 0 0 1-.26 2.21l-4.21 5.1A1.72 1.72 0 0 1 12 17"/></svg></div>' 
                 : 
                 '<div id="tree' + this.point['id'] + '" class="expandCollapse"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M16.21 16H7.79a1.76 1.76 0 0 1-1.59-1a2.1 2.1 0 0 1 .26-2.21l4.21-5.1a1.76 1.76 0 0 1 2.66 0l4.21 5.1A2.1 2.1 0 0 1 17.8 15a1.76 1.76 0 0 1-1.59 1"/></svg></div>'
                 ; // Dynamic icon (or use + and −)
            if (this.point['linksFrom'].length > 0) {
                const updatHtml = `<div>${icon}</div></h4>`;
                html = html.replace(
                  '</h4>',
                  updatHtml
                );
            }
                return html;
              }
                    
          }
        }
      },
      exporting: {
        sourceWidth: document.getElementById('container').offsetWidth,
        sourceHeight: document.getElementById('container').offsetHeight,
        // sourceHeight:800,
        // sourceWidth:600,
        allowHTML: true,
        enabled: true,
      },
      series: [
        {
          type: 'organization',
          name: 'Organization',
          keys: ['from', 'to'],
          data: dataList,
          nodes: nodeList,
          colorByPoint: false,  // Disable default color grouping
          color: '#007ad0',     // Set default color if needed
          borderColor: 'white',
          nodePadding: 5, 
          dataLabels: {
            // useHTML: false,
            style: {
              color: '#ffffff', // Default text color for all nodes
              fontSize: '11px',
              linkLength: 150,      // Adjust the space between nodes (affects height indirectly)
            },
            //align: 'center',  // Ensure alignment in the center
            //verticalAlign: 'middle',  // Ensure vertical alignment
          },
          nodeAlignment : 'center'
        }
      ],
      tooltip: {
        outside: true,
        distance:50,
      },
      credits: {
        enabled: false
      },
    };
    } catch (e) {
      throw e;
    }
  }
}
