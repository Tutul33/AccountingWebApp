import { Component, OnInit } from "@angular/core";
import { ModalService } from '../../shared';
import {
  ProviderService,
  BaseComponent,
  GridOption,
  ColumnType,
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";
import { CashFlowDataService } from "../services/cash-flow/cash-flow-data.service";

@Component({
  selector: 'app-ledger-modal',
  templateUrl: './ledger-modal.component.html',
  providers: [CashFlowDataService, ModalService],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class LedgerModalComponent extends BaseComponent implements OnInit {
  entity: any;
  list: any = [];
  tempLedgerList: any = [];
  isMultiSelect: boolean = false;
  selectedItemList: any = [];
  prevSelected: any;
  gridOption: GridOption;
  constructor(
    protected providerSvc: ProviderService,
    public modalService: ModalService,
    public coreAccService: CashFlowDataService,
  ) {
    super(providerSvc);

  }

  ngOnInit(): void {
    this.prevSelected = this.modalService?.modalData?.dataList;
    this.initGridOption();
    this.getLedgerList();
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "list",
        columns: this.gridColumns(),
        isGlobalSearch: true,
        globalFilterFields: ['ledger'],
        isClear: false
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "ledger", header: this.fieldTitle["ledgername"] },
      { header: this.fieldTitle['action'], style: "" }
    ];
  }

  getLedgerList() {
    try {
      this.coreAccService.getLedgerList().subscribe({
        next: (res: any) => {
          let data = res || [];
          this.list = this.prepareGridList(data);
          this.tempLedgerList = JSON.parse(
            JSON.stringify(this.list)
          );
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

  prepareGridList(dataList: any) {
    try {
      if (dataList.length > 0) {
        var result = dataList.map((x) => {
          const id = x.cOAStructID;
          let isPrevSelected = this.prevSelected.filter((e: any) => {
            const itmId = e.cOAStructID;
            return itmId == id;
          }).length;
          return {
            ...x,
            isSelected: isPrevSelected > 0 ? true : false,
            isDisabled: isPrevSelected > 0 ? true : false,
          };
        });
        return result;
      } else {
        this.list = [];
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  selectMultipleItem(item: any, isSelected: boolean) {
    if (isSelected)
      this.selectedItemList.push(item);
    else {
      const index = this.selectedItemList.indexOf(item, 0);
      if (index > -1) {
        this.selectedItemList.splice(index, 1);
      }
    }
  }

  ok() {
    if (this.modalService.isModal) {
      var list = this.selectedItemList.filter(x => x.isSelected == true);
      list.forEach(element => {
        element.isDisabled = true;
      });
      this.modalService.close(list);
    }
  }

  reset() {
    try {
      this.selectedItemList = [];
      this.list = this.prepareGridList(this.tempLedgerList);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

}
