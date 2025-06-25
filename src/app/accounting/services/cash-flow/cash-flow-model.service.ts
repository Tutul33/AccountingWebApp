import { Injectable } from '@angular/core';
import { GlobalMethods } from 'src/app/shared';
import { CashFlowActivityDTO, CashFlowActivityWiseLedgerDTO } from '../../models/cash-flow/cash-flow.model';

@Injectable()
export class CashFlowModelService {

  cashFlow: CashFlowActivityDTO = new CashFlowActivityDTO();
  tempCashFlow: CashFlowActivityDTO = new CashFlowActivityDTO();
  selectList: any = [];
  groupList: any = [];
  treeMapByActivityID: { [activityID: number]: any[] } = {};
  cashFlowStatementGroups: any = [];
  filterDataList:any = [];

  constructor() { }

  resetForm(entity: any) {
    try {
      if (entity.id > 0) {
        this.cashFlow = new CashFlowActivityDTO(this.tempCashFlow);
        this.cashFlow.cashFlowActivityWiseLedgerList = this.tempCashFlow.cashFlowActivityWiseLedgerList;
      } else {
        this.cashFlow = new CashFlowActivityDTO(this.tempCashFlow);
        this.cashFlow.groupName = entity.label;
        this.cashFlow.cashFlowActivityWiseLedgerList = [];
      }
    } catch (e) {
      throw e;
    }
  }

  prepareExistingSelectedData(selectedDataList: any) {
    try {
      selectedDataList.forEach((element) => {
        const existingData = selectedDataList.filter(
          (x) => x.cOAStructID == element.cOAStructID
        )[0];
        let obj = new CashFlowActivityWiseLedgerDTO();
        obj.cOAStructID = existingData.cOAStructID;
        obj.ledger = existingData.ledger;
        obj.isDisabled = true;
        obj.isSelected = true;
        this.cashFlow.cashFlowActivityWiseLedgerList.entityPush(obj);
      });

    } catch (error) {
      throw error;
    }
  }

  getExistingData(entity: any) {
    try {
      if (entity.id > 0) {
        this.cashFlow.groupName = entity.groupName;
        this.cashFlow.cashFlowGrpCode = entity.cashFlowGrpCode;
        this.cashFlow.name = entity.name;
        this.cashFlow.cashFlowActivityWiseLedgerList = entity.cashFlowActivityWiseLedgerList;
        this.cashFlow.cashFlowActivityWiseLedgerList.forEach(element => {
          element.tag = 0;
        })
        this.cashFlow.id = entity.id;

        this.tempCashFlow = GlobalMethods.jsonDeepCopy(this.cashFlow);
        this.tempCashFlow.cashFlowActivityWiseLedgerList = GlobalMethods.jsonDeepCopy(this.cashFlow.cashFlowActivityWiseLedgerList);
      }
    } catch (e) {
      throw e;
    }
  }

  
  prepareTreeByActivityID() {
    try {
      if (!this.cashFlowStatementGroups || !this.groupList) return;
      this.cashFlowStatementGroups.forEach(element => {
        element.expanded = true;
      });

      this.groupList.forEach(panel => {
        const activityID = panel.activityID;

        this.treeMapByActivityID[activityID] = this.cashFlowStatementGroups
          .filter(x => x.code === activityID && x.label != null)
          .map(node => ({
            ...node,
            children: this.filterChildrenByActivityID(node.children, activityID)
          }));
      });

    } catch (error) {
      throw error;
    }
  }

  private filterChildrenByActivityID(children: any[], activityID: number): any[] {
    if (!children) return [];
    return children
      .filter(child => child.code === activityID)
      .map(child => ({
        ...child,
        children: this.filterChildrenByActivityID(child.children, activityID)
      }));
  }

  prepareTreeData(data: any[]): any[] {
    const tree: any[] = [];
    const nameMap = new Map();

    for (const row of data) {
      const key = `${row.name}_${row.activityID}`; // Unique key for name + activityID

      // Level 1: Group by name + activityID
      if (!nameMap.has(key)) {
        const nameNode = {
          label: row.name,
          children: [],
          isParentEdit: true,
          isDeleted: true,
          code: row.code,
          activityID: row.activityID,
        };
        nameMap.set(key, nameNode);
        tree.push(nameNode);
      }

      const nameNode = nameMap.get(key);

      // Level 2: Ledgers
      if (row.cOAStructID > 0) {
        nameNode.children.push({
          label: row.ledger,
          code: row.code,
          isDeleted: true,
          cashFlowActivityWiseLedgerID: row.cashFlowActivityWiseLedgerID,
          activityID: row.activityID,
          cOAStructID: row.cOAStructID,
        });
      }
    }

    return tree;
  }

}
