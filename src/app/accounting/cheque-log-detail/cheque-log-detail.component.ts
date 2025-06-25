import { Component, OnInit } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { ModalService } from '../../shared';
import {
  ProviderService,
  BaseComponent,
  QueryData,
} from '../index';
import { ChequeBookModelService } from "../services/cheque-book/cheque-book-model.service";
import { ChequeBookDataService } from "../services/cheque-book/cheque-book-data.service";
import { SharedModule } from "src/app/shared/shared.module";
@Component({
  selector: 'app-cheque-log-detail',
  templateUrl: './cheque-log-detail.component.html',
  providers: [ChequeBookDataService, ChequeBookModelService, ModalService],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class ChequeLogDetailComponent extends BaseComponent implements OnInit {

  gridOption: GridOption;
  entity: any;
  chequeLogDetailList: any = [];

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ChequeBookModelService,
    private dataSvc: ChequeBookDataService,
    public dialogService: DialogService,
    public modalService: ModalService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.entity = this.modalService.modalData?.entity;
    this.getChequeLogDetail();
    this.initGridOption();
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "chequeLogDetailList",
        columns: this.gridColumns(),
        paginator: false,
        isClear: false,

      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "status", header: this.fieldTitle['status'] },
      { field: "date", header: this.fieldTitle['date'] },
      { field: "userName", header: this.fieldTitle['updatedby'] },
      { field: "note", header: this.fieldTitle['note'] },
      { field: "actionDateTime", header: this.fieldTitle['updatetime'] },
    ]
  }

  getChequeLogDetail() {
    try {
      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getChequeLogDetail(spData, this.entity.voucherItemID).subscribe({
        next: (res: any) => {
          this.chequeLogDetailList = res[res.length - 1] || [];
        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

}
