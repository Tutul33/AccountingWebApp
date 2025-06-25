import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { ModalConfig, ValidatorDirective } from '../../../shared';
import { NgForm } from "@angular/forms";

import {
  ProviderService,
  BaseComponent,
  ActivitiesModalComponent,
  CashFlowModelService
} from '../../index';
import { SharedModule } from "src/app/shared/shared.module";
import { CashFlowDataService } from "../../services/cash-flow/cash-flow-data.service";
import { CashFlowActivityWiseLedgerDTO } from "../../models/cash-flow/cash-flow.model";

@Component({
  selector: 'app-cash-flow-statement-groups',
  templateUrl: './cash-flow-statement-groups.component.html',
  providers: [CashFlowDataService, CashFlowModelService],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class CashFlowStatementGroupsComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  ref: DynamicDialogRef;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("cashFlowStatementGroupsForm", { static: true, read: NgForm }) cashFlowStatementGroupsForm: NgForm;
  public validationMsgObj: any;
  searchText: any = '';

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CashFlowModelService,
    private dataSvc: CashFlowDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getCashFlowStatementGroups();
  }

  getCashFlowStatementGroups() {
    try {
      this.dataSvc.getCashFlowStatementGroups().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          const uniqueSet = new Set(data.map(item => JSON.stringify({ activityID: item.code, value: item.value })));
          this.modelSvc.groupList = [...uniqueSet].map(item => JSON.parse(item as any));

          this.modelSvc.cashFlowStatementGroups = this.modelSvc.prepareTreeData(data);
          this.modelSvc.filterDataList = data;
          this.modelSvc.prepareTreeByActivityID();

          console.log(data);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "name", header: this.fieldTitle['notify'] },
      { field: "value", isRequired: true, header: this.fieldTitle['days'] },
      { field: "isActive", header: this.fieldTitle['active'], isBoolean: true, styleClass: "d-center" },
    ]
  }


  onAdd(node: any) {
    try {
      node.label = node.value;
      node.code = node.activityID;
      const modalConfig = new ModalConfig();
      const obj = {
        entity: node,
      };
      modalConfig.data = obj;
      modalConfig.header = node.id ? this.fieldTitle['editactivities'] : this.fieldTitle['addactivities'];
      modalConfig.width = '600px';
      this.ref = this.dialogService.open(ActivitiesModalComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.getCashFlowStatementGroups();
        }

      });

    } catch (error) {

    }
  }

  getCashFlowActivitiesByID(id: number, groupName: string) {
    try {
      this.dataSvc.getCashFlowActivitiesByID(id).subscribe({
        next: (res: any) => {
          this.modelSvc.cashFlow.cashFlowActivityWiseLedgerList = [];
          if (res.length > 0) {
            let existObj = res[res.length - 1];
            this.modelSvc.cashFlow.groupName = groupName;
            this.modelSvc.cashFlow.name = existObj[0].name;
            this.modelSvc.cashFlow.cashFlowGrpCode = existObj[0].cashFlowGrpCode;
            this.modelSvc.cashFlow.id = existObj[0].activityID;
            existObj.forEach(element => {
              let obj = new CashFlowActivityWiseLedgerDTO();
              obj.cOAStructID = element.cOAStructID;
              obj.id = element.id;
              obj.activityID = this.modelSvc.cashFlow.id;
              obj.ledger = element.ledger;
              obj.isDisabled = true;
              obj.isSelected = true;
              obj.tag = 0;
              if (element.cOAStructID > 0) {
                this.modelSvc.cashFlow.cashFlowActivityWiseLedgerList.entityPush(obj);
              }
            });
            this.onAdd(this.modelSvc.cashFlow);
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }

      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onEdit(node: any, label: any) {
    try {
      node.isEdit = true;
      this.getCashFlowActivitiesByID(node.activityID, label);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onDelete(node: any) {
    try {
      let detailID = null;
      if (node.cashFlowActivityWiseLedgerID != undefined) {
        detailID = node.cashFlowActivityWiseLedgerID;
      }

      this.utilitySvc.showConfirmModal('2235').subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.dataSvc.deleteCashActivities(node.activityID, detailID).subscribe({
            next: (res: any) => {
              this.getCashFlowStatementGroups();
              this.showMsg('2236');
            },
            error: (res: any) => {
              this.showErrorMsg(res);
            },
          });
        }
      });

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onSearch() {
    try {
      let result = this.filterByNameOrLedger(this.modelSvc.filterDataList, this.searchText);
      this.modelSvc.cashFlowStatementGroups = this.modelSvc.prepareTreeData(result);
      this.modelSvc.prepareTreeByActivityID();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterByNameOrLedger(data: any[], searchText: string): any[] {
    const lowerSearch = searchText.toLowerCase();
    return data.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(lowerSearch) ?? false;
      const ledgerMatch = item.ledger?.toLowerCase().includes(lowerSearch) ?? false;

      return nameMatch || ledgerMatch;
    });
  }

}