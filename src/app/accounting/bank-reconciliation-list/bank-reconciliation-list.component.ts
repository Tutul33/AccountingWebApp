import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { GlobalConstants, ValidatorDirective } from '../../shared';

import {
  ProviderService,
  BaseComponent,
  BankReconciliationDataService,
  BankReconciliationModelService,
  QueryData
} from '../index';
import { SharedModule } from "src/app/shared/shared.module";
import { MenuService } from 'src/app/shared/services/menu.service';

@Component({
  selector: 'app-bank-reconciliation-list',
  templateUrl: './bank-reconciliation-list.component.html',
  providers: [BankReconciliationDataService, BankReconciliationModelService],
  standalone:true,
  imports:[SharedModule]
})
export class BankReconciliationListComponent extends BaseComponent implements OnInit {
  gridOption: GridOption;
  spData: any = new QueryData();
  isPlaceholderDisableCompany: boolean = false;
  fileName: string = "";
  isInValidBranch: boolean = false;
  pageHeader: string;

  @ViewChild(ValidatorDirective) directive;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BankReconciliationModelService,
    private dataSvc: BankReconciliationDataService,
    public dialogService: DialogService,
    private menuService: MenuService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.getDefaultData();
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.pageHeader = this.fieldTitle["bankreconciliation"];
    this.initGridOption();

  }

  getDefaultData() {
    try {
      this.getBankReconciliationList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: this.pageHeader,
        dataSource: "modelSvc.bankReconciliationList",
        columns: this.gridColumns(),
        refreshEvent: this.refresh,
        isClear: true,
        isGlobalSearch: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: this.fieldTitle["bankreconciliation"]
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  gridColumns(): ColumnType[] {
    return [
      { field: "fromDate", header: this.fieldTitle['fromdate'], isDDFilter: true, dataList: this.modelSvc.fromDateDDList, labelField: 'FromDate'  },
      { field: "toDate", header: this.fieldTitle['todate'], isDDFilter: true, dataList: this.modelSvc.toDateDDList, labelField: 'ToDate'  },
      { field: "companyName", header: this.fieldTitle['company'], isDDFilter: true, dataList: this.modelSvc.companyDDList, labelField: 'CompanyName'  },
      // { field: "orgName", header: this.fieldTitle['branch'], isDDFilter: true, dataList: this.modelSvc.orgDDList, labelField: 'OrgName'  },
      // { field: "projectName", header: this.fieldTitle['project'], isDDFilter: true, dataList: this.modelSvc.projectDDList, labelField: 'ProjectName'  },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "orgName", header: this.fieldTitle['branch'], isDDFilter: true, dataList: this.modelSvc.orgDDList, labelField: 'OrgName' }] : []),
      ...(this.modelSvc.isProjectModuleActive ? [{ field: "projectName", header: this.fieldTitle['project'], isDDFilter: true, dataList: this.modelSvc.projectDDList, labelField: 'ProjectName' }] : []),
      { field: "bankAccount", header: this.fieldTitle['bankaccount'], isDDFilter: true, dataList: this.modelSvc.bankAccountDDList, labelField: 'BankAccount'  },
      { field: "statementBalance", header: this.fieldTitle['statementbalance'] },
      { field: "discrepancy", header: this.fieldTitle['discrepancy'] },
      { field: "status", header: this.fieldTitle['status'], isDDFilter: true, dataList: this.modelSvc.statusDDList, labelField: 'Status'  }
    ]
  }


  refresh(){
    try {
      this.getBankReconciliationList(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  getBankReconciliationList(isRefresh: boolean) {
    try {
      let _ddlProperties = this.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getBankReconciliationList(this.spData).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          let data = res[res.length - 1] || [];
          this.modelSvc.bankReconciliationList = data;
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

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("FromDate, FromDate");
      ddlProperties.push("ToDate, ToDate");
      ddlProperties.push("CompanyID, CompanyName");
      ddlProperties.push("OrgID, OrgName");
      ddlProperties.push("ProjectID, ProjectName");
      ddlProperties.push("BankAccount, BankAccount");
      ddlProperties.push("Status, Status");
    return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.fromDateDDList = data[0];
      this.modelSvc.toDateDDList = data[1];
      this.modelSvc.companyDDList = data[2];
      this.modelSvc.orgDDList = data[3];
      this.modelSvc.projectDDList = data[4];
      this.modelSvc.bankAccountDDList = data[5];
      this.modelSvc.statusDDList = data[6];
      
      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  create() {
    try {
      let navigateUrl = '/ACC-PAGE/bank-reconciliation';
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onClickDiscrepancy(entity: any) {
    try {
      let navigateUrl = '/ACC-PAGE/bank-reconciliation-transactions';
      this.dataTransferSvc.broadcast('entity', entity);
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

}
