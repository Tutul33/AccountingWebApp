import { Component, OnInit } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColumnType, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { GlobalConstants } from '../../shared';
import {
  ProviderService,
  BaseComponent,
  QueryData,
  ChequeLogDetailComponent,
} from '../index';
import { ChequeBookModelService } from "../services/cheque-book/cheque-book-model.service";
import { ChequeBookDataService } from "../services/cheque-book/cheque-book-data.service";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-cheque-log',
  templateUrl: './cheque-log.component.html',
  providers: [ChequeBookDataService, ChequeBookModelService],
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class ChequeLogComponent extends BaseComponent implements OnInit {
  ref: DynamicDialogRef;
  gridOption: GridOption;
  spData: any = new QueryData();

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
    this.getChequeLogList(true);
    this.initGridOption();
  }

  getChequeLogList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getChequeLogList(this.spData).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          let data = res[res.length - 1] || [];
          this.modelSvc.chequeBookLeafManagementList = data;
        }
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
      { field: "chequeTransaction", header: this.fieldTitle['chequetransaction'] },
      { field: "bankAccount", header: this.fieldTitle['bankaccount'], isDDFilter: true, dataList: this.modelSvc.bankAccountDDList, labelField: 'bankAccount' },
      { field: "leafNo", header: this.fieldTitle['chequeno'], styleClass: 'd-center', isDDFilter: true, dataList: this.modelSvc.chequeLeafNoDDList, labelField: 'leafNo' },
      { field: "amount", header: this.fieldTitle['amount'], styleClass: 'd-center', isDDFilter: true, dataList: this.modelSvc.amountDDList, labelField: 'amount' },
      { field: "chequeDate", header: this.fieldTitle['chequedate'], isDDFilter: true, dataList: this.modelSvc.chequedateDDList, labelField: 'chequeDate' },
      { field: "lastUpdate", header: this.fieldTitle['lastupdate'] },
      { field: "status", header: this.fieldTitle['status'], isDDFilter: true, dataList: this.modelSvc.statusDDList, labelField: 'status' },
      { header: this.fieldTitle['action'] }
    ]
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("company, company");
      ddlProperties.push("org, org");
      ddlProperties.push("project, project");
      ddlProperties.push("bankAccount, bankAccount");
      ddlProperties.push("leafNo, leafNo");
      ddlProperties.push("amount, amount");
      ddlProperties.push("chequeDate, chequeDate");
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
      this.modelSvc.bankAccountDDList = data[3];
      this.modelSvc.chequeLeafNoDDList = data[4];
      this.modelSvc.amountDDList = data[5];
      this.modelSvc.chequedateDDList = data[6];
      this.modelSvc.statusDDList = data[7];
      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  refresh() {
    try {
      this.getChequeLogList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onCheckHistory(entity: any) {
    try {
      const modalConfig = new ModalConfig();
      const obj = { entity: entity };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['checkhistory'];
      this.ref = this.dialogService.open(ChequeLogDetailComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {

      });

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

}
