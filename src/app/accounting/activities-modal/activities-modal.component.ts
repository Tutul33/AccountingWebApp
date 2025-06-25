import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalConfig, ModalService, ValidatorDirective } from '../../shared';
import {
  ProviderService,
  BaseComponent,
  GridOption,
  ColumnType,
  CashFlowModelService,
  LedgerModalComponent,
  CashFlowDataService,
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";
import { NgForm, UntypedFormGroup } from "@angular/forms";
import { CashFlowActivityDTO, cashFlowValidation } from "../models/cash-flow/cash-flow.model";

@Component({
  selector: 'app-activities-modal',
  templateUrl: './activities-modal.component.html',
  providers: [CashFlowModelService, CashFlowDataService, ModalService],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class ActivitiesModalComponent extends BaseComponent implements OnInit {

  public validationMsgObj: any;
  @ViewChild("activitiesForm", { static: true, read: NgForm }) activitiesForm: NgForm;
  @ViewChild(ValidatorDirective) directive;
  entity: any;
  tempEntity: any;
  gridOption: GridOption;
  ref: DynamicDialogRef;
  ledgerlist: any = [];
  constructor(
    protected providerSvc: ProviderService,
    public dialogService: DialogService,
    public modalService: ModalService,
    public modelSvc: CashFlowModelService,
    public dataSvc: CashFlowDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = cashFlowValidation();
  }

  ngOnInit(): void {
    this.entity = this.modalService.modalData?.entity;
    this.tempEntity = this.modalService.modalData?.entity;
    this.modelSvc.cashFlow.groupName = this.entity.label;
    this.modelSvc.cashFlow.cashFlowGrpCode = this.entity.code;
    this.modelSvc.getExistingData(this.entity);
    this.initGridOption();
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "modelSvc.cashFlow.cashFlowActivityWiseLedgerList",
        columns: this.gridColumns(),
        isGlobalSearch: true,
        globalFilterFields: ['ledger'],
        paginator: false
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

  onSelectLedger(node: any, isEdit: boolean) {
    try {
      const modalConfig = new ModalConfig();
      let existingDataList = this.modelSvc.cashFlow.cashFlowActivityWiseLedgerList.filter(x => x.isSelected);
      const obj = {
        entity: node,
        isEdit: isEdit,
        dataList: existingDataList
      };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['ledgerlist'];
      modalConfig.width = '700px';
      this.ref = this.dialogService.open(LedgerModalComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.modelSvc.prepareExistingSelectedData(data);
        }
      });

    } catch (error) {

    }
  }

  save(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.saveActivities(this.modelSvc.cashFlow);

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveActivities(activities: any) {
    try {
      let messageCode = this.modelSvc.cashFlow.id > 0
        ? this.messageCode.editCode
        : this.messageCode.saveCode;
      this.dataSvc.saveCashFlowActivity(activities).subscribe({
        next: (res: any) => {
          this.showMsg(messageCode);
          this.modalService.close(res);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }

      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  deleteItem(item: any) {
    try {
      this.modelSvc.cashFlow.cashFlowActivityWiseLedgerList.entityPop(item);

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  reset() {
    try {
      if (this.entity.id > 0) {
        this.modelSvc.getExistingData(this.tempEntity);
      }
      else {
        this.modelSvc.cashFlow = new CashFlowActivityDTO(this.entity);
        this.modelSvc.cashFlow.groupName = this.entity.label;
        this.modelSvc.cashFlow.cashFlowActivityWiseLedgerList = [];
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
}
