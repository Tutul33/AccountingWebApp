import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColumnType, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalConstants, GlobalMethods, ValidatorDirective } from '../../shared';

import {
  ProviderService,
  BaseComponent,
  QueryData,
  ChequeStatusUpdateModalComponent,
} from '../index';
import { ChequeBookModelService } from "../services/cheque-book/cheque-book-model.service";
import { ChequeBookDataService } from "../services/cheque-book/cheque-book-data.service";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-cheque-book-leaf-management',
  templateUrl: './cheque-book-leaf-management.component.html',
  providers: [ChequeBookDataService, ChequeBookModelService],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class ChequeBookLeafManagementComponent extends BaseComponent implements OnInit {
  ref: DynamicDialogRef;
  gridOption: GridOption;
  spData: any = new QueryData();
  @ViewChild(ValidatorDirective) directive;

  chequeLeafStatusList: any = [];
  dllChequeLeafStatusList: any = [];
  ids: any = '';
  tempList:any =[];


  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ChequeBookModelService,
    private dataSvc: ChequeBookDataService,
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
          this.tempList = GlobalMethods.jsonDeepCopy(this.modelSvc.chequeBookLeafManagementList);
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
        paginator: true,
        exportOption: {
          exportInPDF: false,
          exportInXL: false,
          title: this.fieldTitle["chequebookleafmanagement"]
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
      { field: "bankAccount", header: this.fieldTitle['bankaccount'], isDDFilter: true, dataList: this.modelSvc.bankAccountDDList, labelField: 'bankAccount' },
      { field: "accountName", header: this.fieldTitle['accountholdername'], isDDFilter: true, dataList: this.modelSvc.accountDDList, labelField: 'accountName' },
      { field: "chequeType", header: this.fieldTitle['chequetype'] },
      { field: "chequeBookNo", header: this.fieldTitle['chequebooknumber'], isDDFilter: true, dataList: this.modelSvc.chequeBookNumberDDList, labelField: 'chequeBookNo' },
      { field: "leafNo", header: this.fieldTitle['chequeleafno'], styleClass: 'd-center', isDDFilter: true, dataList: this.modelSvc.chequeLeafNoDDList, labelField: 'leafNo' },
      { field: "used", header: this.fieldTitle['used'], styleClass: 'd-center', isDDFilter: true, dataList: this.modelSvc.usedDDList, labelField: 'used' },
      { header: this.fieldTitle['block'] },
      { field: "value", header: this.fieldTitle['status'], isDDFilter: true, dataList: this.modelSvc.statusDDList, labelField: 'value' },
      { field: "chequeDate", header: this.fieldTitle['chequedate'], isDDFilter: true, dataList: this.modelSvc.chequedateDDList, labelField: 'chequeDate' },
      { field: "clearedOnDate", header: this.fieldTitle['clearondate'], isDDFilter: true, dataList: this.modelSvc.clearedOnDateDDList, labelField: 'clearedOnDate' },
      { field: "voucherNo", header: this.fieldTitle['vouchernumber'], isDDFilter: true, dataList: this.modelSvc.voucherNoDDList, labelField: 'voucherNo' },
      { field: "voucherDate", header: this.fieldTitle['voucherdate'], isDDFilter: true, dataList: this.modelSvc.voucherDateDDList, labelField: 'voucherDate' },
      { field: "toAccount", header: this.fieldTitle['toaccount'], isDDFilter: true, dataList: this.modelSvc.toAccountDDList, labelField: 'toAccount' },
      { field: "subLedgerName", header: this.fieldTitle['sub-ledger'], isDDFilter: true, dataList: this.modelSvc.subLedgerNameDDList, labelField: 'subLedgerName' }
    ]
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("company, company");
      ddlProperties.push("org, org");
      ddlProperties.push("project, project");
      ddlProperties.push("bankAccount, bankAccount");
      ddlProperties.push("accountName, accountName");
      ddlProperties.push("chequeBookNo, chequeBookNo");
      ddlProperties.push("leafNo, leafNo");
      ddlProperties.push("used, used");

      ddlProperties.push("value, value");
      ddlProperties.push("chequeDate, chequeDate");
      ddlProperties.push("clearedOnDate, clearedOnDate");
      ddlProperties.push("voucherNo, voucherNo");
      ddlProperties.push("voucherDate, voucherDate");
      ddlProperties.push("toAccount, toAccount");
      ddlProperties.push("subLedgerName, subLedgerName");
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
      this.modelSvc.bankAccountDDList = data[3];
      this.modelSvc.accountDDList = data[4];
      this.modelSvc.chequeBookNumberDDList = data[5];
      this.modelSvc.chequeLeafNoDDList = data[6];
      this.modelSvc.usedDDList = data[7];

      this.modelSvc.statusDDList = data[8];
      this.modelSvc.chequedateDDList = data[9];
      this.modelSvc.clearedOnDateDDList = data[10];
      this.modelSvc.voucherNoDDList = data[11];
      this.modelSvc.voucherDateDDList = data[12];
      this.modelSvc.toAccountDDList = data[13];
      this.modelSvc.subLedgerNameDDList = data[14];

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

  onUpdateIsUsed(entity) {
    try {
      this.dataSvc.updateIsUsed(entity.id,entity.isBlocked).subscribe({
        next: (res: any) => {
          if (res) {
               this.showMsg("501");
          }
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

  getChequeLeafStatusList() {
    try {
      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getChequeLeafStatusList(spData).subscribe({
        next: (res: any) => {
          this.chequeLeafStatusList = res[res.length - 1] || [];
          this.chequeLeafStatusList.forEach(element => {
            if (element.code == FixedIDs.chequeLeafStatus.Issued || element.code == FixedIDs.chequeLeafStatus.Bounced || element.code == FixedIDs.chequeLeafStatus.OnHold || element.code == FixedIDs.chequeLeafStatus.PostDated || element.code == FixedIDs.chequeLeafStatus.UnUsed) {
              element.isActive = true;
            } else {
              element.isActive = false;
            }
          });
          this.dllChequeLeafStatusList = this.chequeLeafStatusList.filter(el =>el.code != FixedIDs.chequeLeafStatus.UnUsed);
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
      let code =this.tempList.find(x=>x.id ==entity.id).code;
      const obj = { entity: entity };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['statusupdate'];
      this.ref = this.dialogService.open(ChequeStatusUpdateModalComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {debugger
        if (data) {
          this.getChequeBookLeafManagementList(true);

        }
        if(data == undefined){
          entity.code = code;
        }

      });

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

}
