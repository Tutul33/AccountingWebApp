import { Component, OnInit } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColumnType, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { GlobalConstants } from '../../shared';

import {
  ProviderService,
  BaseComponent,
  QueryData,
  ChequeStatusUpdateModalComponent,
  ReceivedChequeManagementDataService,
  ReceivedChequeManagementModelService
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";
@Component({
  selector: 'app-received-cheque-management',
  templateUrl: './received-cheque-management.component.html',
  providers: [ReceivedChequeManagementDataService, ReceivedChequeManagementModelService],
  standalone:true,
  imports:[SharedModule]
})
export class ReceivedChequeManagementComponent extends BaseComponent implements OnInit{
ref: DynamicDialogRef;
  gridOption: GridOption;
  spData: any = new QueryData();
  banks: any = [];
  chequeLeafStatusList: any = [];
  ids: any = '';

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ReceivedChequeManagementModelService,
    private dataSvc: ReceivedChequeManagementDataService,
    public dialogService: DialogService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {

    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.getChequeLeafStatusList();
    this.initGridOption();
  }

  getChequeBookLeafManagementList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });
      this.dataSvc.getChequeBookLeafManagementList(this.spData, this.ids).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);

          let data = res[res.length - 1] || [];
          this.modelSvc.chequeBookLeafManagementList = data;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {
          this.spData.isRefresh = false;
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.chequeBookLeafManagementList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["receivedchequemanagement"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "company", header: this.fieldTitle['company'], isDDFilter: true, dataList: this.modelSvc.companyDDList, labelField: 'company' },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "org", header: this.fieldTitle['unit/branch'], isDDFilter: true, dataList: this.modelSvc.officeBranchUnitDDList, labelField: 'org' }] : []),
      ...(this.modelSvc.isProjectModuleActive ? [{ field: "project", header: this.fieldTitle['project'], isDDFilter: true, dataList: this.modelSvc.projectDDList, labelField: 'project' }] : []),
      { field: "chequeNo", header: this.fieldTitle['chequeno'], styleClass: 'd-center', isDDFilter: true, dataList: this.modelSvc.chequeNoDDList, labelField: 'chequeNo' },
      { field: "bankAccount", header: this.fieldTitle['bankaccount'], isDDFilter: true, dataList: this.modelSvc.bankAccountDDList, labelField: 'bankAccount' },
      { field: "chequeAmount", header: this.fieldTitle['amount'], isDDFilter: true, dataList: this.modelSvc.chequeAmountDDList, labelField: 'chequeAmount' },
      { field: "chequeDate", header: this.fieldTitle['chequedate'], isDDFilter: true, dataList: this.modelSvc.chequedateDDList, labelField: 'chequeDate' },
      { field: "voucherNo", header: this.fieldTitle['vouchernumber'], isDDFilter: true, dataList: this.modelSvc.voucherNoDDList, labelField: 'voucherNo' },
      { field: "voucherDate", header: this.fieldTitle['voucherdate'], isDDFilter: true, dataList: this.modelSvc.voucherDateDDList, labelField: 'voucherDate' },
      { field: "toAccount", header: this.fieldTitle['toaccount'], isDDFilter: true, dataList: this.modelSvc.toAccountDDList, labelField: 'toAccount' },
      { field: "subLedgerName", header: this.fieldTitle['sub-ledger'], isDDFilter: true, dataList: this.modelSvc.subLedgerNameDDList, labelField: 'subLedgerName' },
      { field: "lastUpdate", header: this.fieldTitle['lastupdate'], isDDFilter: true, dataList: this.modelSvc.lastUpdateDDList, labelField: 'lastUpdate' },
      { field: "status", header: this.fieldTitle['status'], isDDFilter: true, dataList: this.modelSvc.statusDDList, labelField: 'status' },
    ]
    
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("company, company");
      ddlProperties.push("org, org");
      ddlProperties.push("project, project");
      ddlProperties.push("chequeNo, chequeNo");
      ddlProperties.push("bankAccount, bankAccount");
      ddlProperties.push("chequeAmount, chequeAmount");
      ddlProperties.push("chequeDate, chequeDate");
      ddlProperties.push("voucherNo, voucherNo");
      ddlProperties.push("voucherDate, voucherDate");
      ddlProperties.push("toAccount, toAccount");
      ddlProperties.push("subLedgerName, subLedgerName");
      ddlProperties.push("lastUpdate, lastUpdate");
      ddlProperties.push("status, status");
      
      return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.companyDDList = data[0];
      this.modelSvc.officeBranchUnitDDList = data[1];
      this.modelSvc.projectDDList = data[2];
      this.modelSvc.chequeNoDDList = data[3];
      this.modelSvc.bankAccountDDList = data[4];
      this.modelSvc.chequeAmountDDList = data[5];
      this.modelSvc.chequedateDDList = data[6];
      this.modelSvc.voucherNoDDList = data[7];
      this.modelSvc.voucherDateDDList = data[8];
      this.modelSvc.toAccountDDList = data[9];
      this.modelSvc.subLedgerNameDDList = data[10];
      this.modelSvc.lastUpdateDDList = data[11];
      this.modelSvc.statusDDList = data[12];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  refresh() {
    try {
      this.getChequeBookLeafManagementList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getChequeLeafStatusList() {
    try {
      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getChequeLeafStatusList(spData).subscribe({
        next: (res: any) => {
          this.chequeLeafStatusList = res[res.length - 1] || [];
          this.chequeLeafStatusList.forEach(element => {
            if (element.code == 3 || element.code == 5 || element.code == 6 || element.code == 8 || element.code == 11) {
              element.isActive = true;
            } else {
              element.isActive = false;
            }
          });
          this.onChequeLeafStatus(null);
          this.getChequeBookLeafManagementList(true);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {
          this.spData.isRefresh = false;
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChequeLeafStatus(item) {
    try {
      this.ids = '';
      this.chequeLeafStatusList.forEach(element => {
        if (item != null) {
          if (item.code == element.code) {
            element.isActive = item.isActive;
          }
        }
        if (element.isActive) {
          this.ids += element.code + ','
        }
      });
      this.getChequeBookLeafManagementList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectStatus(entity: any) {
    try {
      const modalConfig = new ModalConfig();
      const obj = { entity: entity };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['statusupdate'];
      this.ref = this.dialogService.open(ChequeStatusUpdateModalComponent, modalConfig);
      

      this.ref.onClose.subscribe((data: any) => {
        this.getChequeBookLeafManagementList(true);
        // if (data) {
        //   this.getChequeBookLeafManagementList(true);
        // }
      });

    } catch (error) {

    }
  }
}
