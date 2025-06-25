import { Component, OnInit } from '@angular/core';
import { BaseComponent, ColumnType, GlobalConstants, GlobalMethods, ProviderService, QueryData } from 'src/app/app-shared';
import { OpeningBalanceDataService } from '../services/opening-balance/opening-balance-data.service';
import { OpeningBalanceModelService } from '../services/opening-balance/opening-balance-model.service';
import { FileOption, GridOption, ModalConfig } from 'src/app/shared/models/common.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalService } from 'src/app/shared';
import { BulkUploadComponent } from '../bulk-upload/bulk-upload.component';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { map } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-opening-balance-list',
  templateUrl: './opening-balance-list.component.html',
  providers: [OpeningBalanceModelService, OpeningBalanceDataService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class OpeningBalanceListComponent extends BaseComponent implements OnInit {

  gridOption: GridOption;
  companyList: any;
  unitBranchList: any;
  projectList: any;
  yearList: any;
  openDateList: any;
  accountNameList: any;
  subLedgerList: any;
  debitList: any;
  creditList: any;
  ref: DynamicDialogRef;
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  colspan: number;
  isFilterData: boolean = false;


  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: OpeningBalanceModelService,
    public dataSvc: OpeningBalanceDataService,
    public dialogService: DialogService,
    public modalService: ModalService,
    public coreAccService: CoreAccountingService,

  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.initGridOption();
    this.getOpeningBalanceList();
    this.getFinancialYearDate();
    this.setColspan();

  }

  setColspan() {
    try {
      if (this.isBranchModuleActive && this.isProjectModuleActive) {
        this.colspan = 7;
      } else if (!this.isBranchModuleActive && !this.isProjectModuleActive) {
        this.colspan = 5;
      }
      else if (this.isBranchModuleActive || this.isProjectModuleActive) {
        this.colspan = 6;
      }
    } catch (error) {

    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: this.fieldTitle['openingbalancelist'],
        dataSource: "modelSvc.openingBalanceList",
        // columns: this.GridColumns(),
        refreshEvent: this.getOpeningBalanceList,
        filterFromServer: this.filterFromServer,
        paginator: true,
        isGlobalSearch: false,
        isDynamicHeader: false,
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          exportDataEvent: this.onExportData,
          title: this.fieldTitle['openingbalancelist'],
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterFromServer(event: any, filters: any) {
    try {
      this.filterDataList = [];
      this.filterDataList = event.filteredValue;
      this.isFilter = true;
      this.totalCrdit = 0;
      this.totalDebit = 0;
      event.filteredValue.forEach(element => {
        this.totalCrdit += element.creditVal;
        this.totalDebit += element.debitVal;
      });

      if (this.isBranchModuleActive && this.isProjectModuleActive) {
        if (filters.company[0].value != null || filters.debitVal[0].value != null ||
          filters.creditVal[0].value != null || filters.project[0].value != null ||
          filters.ledger[0].value != null || filters.org[0].value != null ||
          filters.subLedger[0].value != null) {
          this.isFilterData = true;
        }
      } else if (this.isBranchModuleActive && !this.isProjectModuleActive) {
        if (filters.company[0].value != null || filters.debitVal[0].value != null ||
          filters.creditVal[0].value != null ||
          filters.ledger[0].value != null || filters.org[0].value != null ||
          filters.subLedger[0].value != null) {
          this.isFilterData = true;
        }
      } else if (!this.isBranchModuleActive && this.isProjectModuleActive) {
        if (filters.company[0].value != null || filters.debitVal[0].value != null ||
          filters.creditVal[0].value != null ||
          filters.ledger[0].value != null || filters.project[0].value != null ||
          filters.subLedger[0].value != null) {
          this.isFilterData = true;
        }
      }
      else if (!this.isBranchModuleActive && !this.isProjectModuleActive) {
        if (filters.company[0].value != null || filters.debitVal[0].value != null ||
          filters.creditVal[0].value != null ||
          filters.ledger[0].value != null ||
          filters.subLedger[0].value != null) {
          this.isFilterData = true;
        }
      }

    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  GridColumns(): ColumnType[] {
    let list = [
      { field: "company", header: this.fieldTitle["company"] }
    ];
    if (this.isBranchModuleActive) {
      list.push({ field: "org", header: this.fieldTitle["unit/branch"] });
    }
    if (this.isProjectModuleActive) {
      list.push({ field: "project", header: this.fieldTitle["project"] });
    }
    list.push(
      { field: "financialYear", header: this.fieldTitle["year"] },
      { field: "openDate", header: this.fieldTitle["opendate"] },
      { field: "ledger", header: this.fieldTitle["accountname"] },
      { field: "subLedger", header: this.fieldTitle["subledgername"] },
      { field: "debitVal", header: this.fieldTitle["debit(bdt)"] },
      { field: "creditVal", header: this.fieldTitle["credit(bdt)"] },
    );
    return list;
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("company, company");
      ddlProperties.push("org, org");
      ddlProperties.push("project, project");
      ddlProperties.push("ledger, ledger");
      ddlProperties.push("subLedger, subLedger");
      ddlProperties.push("debitVal, debitVal");
      ddlProperties.push("creditVal, creditVal");
      return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  bindData(data: any) {
    try {
      this.companyList = data[0];
      this.unitBranchList = data[1];
      this.projectList = data[2];
      this.accountNameList = data[3];
      this.subLedgerList = data[4];
      this.debitList = data[5];
      this.creditList = data[6];
      this.gridOption.columns = this.GridColumns();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  totalDebit: number = 0;
  totalCrdit: number = 0;

  getOpeningBalanceList() {
    try {
      this.modelSvc.isSelectAll = false;
      this.totalDebit = 0;
      this.totalCrdit = 0;
      let ddlProperties = this.prepareDDLProperties();
      let spData = new QueryData({
        ddlProperties: ddlProperties,
        pageNo: 0,
      });
      this.dataSvc.getOpeningBalanceList(spData).subscribe({
        next: (res: any) => {
          this.modelSvc.openingBalanceList = res[res.length - 1];
          this.modelSvc.openingBalanceList.forEach(element => {
            this.totalCrdit += element.creditVal;
            this.totalDebit += element.debitVal;
          });
          this.bindData(res);
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

  deleteitems: any;
  remove() {
    try {

      this.deleteitems = [];
      if (this.isFilter) {
        this.filterDataList.forEach(element => {
          if (element.isCheck) {
            this.deleteitems.push(element);
          }
        });
      } else {
        this.modelSvc.openingBalanceList.forEach(element => {
          if (element.isCheck) {
            this.deleteitems.push(element);
          }
        });
      }
      let spData = new QueryData({
        pageNo: 0,
      });
      this.dataSvc.deleteItemByIds(spData, this.deleteitems).subscribe({
        next: (res: any) => {
          this.getOpeningBalanceList();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });

    } catch (e) {
      console.log(e);
      this.showErrorMsg(e);
    }
  }


  //check is close year
  isClose: boolean = false;
  getFinancialYearDate() {
    try {
      this.coreAccService.getFinancialYear().subscribe({
        next: (res: any) => {
          let results = res || [];
          if (results.length > 0) {
            let countCloseStatus = 0;
            results.forEach(element => {
              if (element.status == 12) {
                countCloseStatus++;
                if (countCloseStatus == 2) {
                  this.isClose = true;
                }
              }
            });
            this.modelSvc.ledgerSummaryDTO.name = results[0].name;
            this.modelSvc.ledgerSummaryDTO.financialYearID = results[0].id;
            if (this.modelSvc.ledgerSummaryDTO.name == null) {
              this.isClose = true;
              this.showMsg('2263');
            }
          }
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


  bulkUploadModal() {
    try {
      if (!this.isClose) {
        const modalConfig = new ModalConfig();
        const obj = {};
        modalConfig.data = obj;
        modalConfig.header = this.fieldTitle['bulkimport'];
        this.ref = this.dialogService.open(BulkUploadComponent, modalConfig);
        this.ref.onClose.subscribe((data: any) => {
          if (data) {
            this.getOpeningBalanceList();
          }

        });
      } else {

        this.showMsg('2264');
      }


    } catch (error) {

    }
  }

  onExportData(event: any) {
    try {
      event.exportOption.title = this.fieldTitle['openingbalancelist'] //+ "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en");

      let spData = new QueryData({
        pageNo: 0,
      });

      return this.dataSvc.getOpeningBalanceList(spData).pipe(
        map((response: any) => {
          return { values: this.prepareDataToExport(this.isFilterData ? this.filterDataList : response[response.length - 1]), columns: this.GridColumns() }
        })
      );
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  prepareDataToExport(data: any) {
    try {
      let list = GlobalMethods.jsonDeepCopy(data);
      let totalDebit = 0;
      let totalCredit = 0;

      list.forEach(element => {
        totalDebit += Number(element.debitVal);
        totalCredit += Number(element.creditVal);
      });


      list.push(
        { subLedger: this.fieldTitle['total'], debitVal: totalDebit.toFixed(2), creditVal: totalCredit.toFixed(2) },
      )

      list.forEach(element => {
        if (element.debitVal != null) {
          element.debitVal = Number(element.debitVal).toFixed(2);
        }
        if (element.creditVal != null) {
          element.creditVal = Number(element.creditVal).toFixed(2);
        }
        if (element.balance != null) {
          element.balance = Number(element.balance).toFixed(2);
        }
      });
      return list;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterDataList: any = [];
  isFilter: boolean = false;
  onSelectAllItemcode() {
    try {
      if (this.modelSvc.isSelectAll) {
        this.modelSvc.openingBalanceList.forEach(x => x.isCheck = true);
        for (let index = 0; index < this.modelSvc.openingBalanceList.length; index++) {
          const element = this.modelSvc.openingBalanceList[index];
          element.isCheck = true;
          this.onSelectItemcode(element, index);
        }
      } else {
        for (let index = 0; index < this.modelSvc.openingBalanceList.length; index++) {
          const element = this.modelSvc.openingBalanceList[index];
          element.isCheck = false;
          this.onSelectItemcode(element, index);
        }

      }

    } catch (error) {
      throw error;
    }
  }

  onSelectItemcode(entity: any, rowIndex: number) {
    try {
      const obj = this.modelSvc.openingBalanceList.filter(x => x.isCheck == false)[0];
      this.modelSvc.isSelectAll = obj ? false : true;

    } catch (error) {
      throw error;
    }
  }


}

