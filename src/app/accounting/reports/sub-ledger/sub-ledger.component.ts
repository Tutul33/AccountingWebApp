import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatorDirective } from 'src/app/app-shared';
import { GridOption } from 'src/app/shared/models/common.model';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { AccountingReportDataService } from '../../services/accounting-report/accounting-report-data.service';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { formatDate } from '@angular/common';
import { SubLedgerModelService } from '../../services/accounting-report/sub-ledger/sub-ledger-model.service'
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { subGroupLedgerValidation } from '../../models/report/report.model';
import { SharedModule } from 'src/app/shared/shared.module';
@Component({
  selector: 'app-sub-ledger',
  templateUrl: './sub-ledger.component.html',
  providers: [AccountingReportDataService, SubLedgerModelService],
  standalone:true,
  imports:[SharedModule]
})
export class SubLedgerRptComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("ledgerReportForm", { static: true, read: NgForm }) ledgerReportForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  spData: any = new QueryData();
  isSPParamChange: boolean = false;
  isPlaceholderDisableCompany: boolean = false;
  isPlaceholderDisableSubLedgerType: boolean = false;
  isPlaceholderDisableLedger: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public dataSvc: AccountingReportDataService,
    public modelSvc: SubLedgerModelService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
  ) {
    super(providerSvc);
    this.validationMsgObj = subGroupLedgerValidation();
  }

  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.keyValuePair = GlobalMethods.createKeyValuePair;
    this.getDefaultData();
    this.initGridOption();
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.subLedgerList",
        getServerData: this.onPage,
        refreshEvent: this.refreshEventHandler,
        filterFromServer:this.filterFromServer,
        lazy: true,
        columns: this.GridColumns(),
        isClear: false,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          exportDataEvent: this.onExportData,
          title: this.fieldTitle['subledger']
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  GridColumns(): ColumnType[] {
    return [
      { field: "sL", header: this.fieldTitle["sl"] },
      { field: "particulars", header: this.fieldTitle["particulars"] },
      { field: "payableVal", header: this.fieldTitle["payable(bdt)"], styleClass:"d-center" },
      { field: "receivableVal", header: this.fieldTitle["receivable(bdt)"], styleClass:"d-center" },
    ];
  }

  onPage(event: any, isRefresh: boolean = false) {
    try {
      this.spData.pageNo = this.gridOption.serverPageNumber(event);
      this.spData.pageDataCount = event.rows;
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  refreshEventHandler(isRefresh: boolean = true) {
    try {
      this.spData.pageNo = this.gridOption.resetPageNumber(this.gridOption.first);
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterFromServer(event: any, filters: any[]) {
    try {
      this.spData.searchParams = this.modelSvc.prepareSearchParams();
      this.spData.pageNo = 1;
      this.populateGrid(false);
      this.pageReset(0);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  pageReset(pageNumber: number) {
    try {
      this.gridOption.first = pageNumber;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

    onExportData(event: any) {
      try {
        if (!this.ledgerReportForm.form.valid) {
          this.directive.validateAllFormFields(this.ledgerReportForm.form as UntypedFormGroup);
          return;
        }
        //event.exportOption.title =this.fieldTitle['subledger'] + "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en") + "_" + this.modelSvc.searchParam.companyName;
        event.exportOption.title =this.fieldTitle['subledger'];

        let spData = GlobalMethods.jsonDeepCopy(this.spData);
        spData.pageNo = 0;
  
        return this.dataSvc.getSubLedgerReport(spData, this.modelSvc.searchParam.companyID,this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID,this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.ledgerID, this.modelSvc.searchParam.subLedgerTypeID).pipe(
          map((response: any) => {
            return { values: this.prepareDataToExport(response[response.length - 1]), columns: this.GridColumns() }
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
        let fromLedger = null;
        fromLedger = this.modelSvc.searchParam.ledgerName;
        let showDate = formatDate(this.modelSvc.searchParam.toDate, "dd-MM-yyyy", "en")

        let sl = 0;

        let tempList = [];

        list.forEach(element => {
          // sl++;
          // element.sl = sl;
          // if(element.payableVal < 0)
          // {
          //   element.receivableVal -= element.payableVal;
          //   element.payableVal = 0;
          // }
          // if(element.receivableVal < 0)
          // {
          //   element.payableVal -= element.receivableVal;
          //   element.receivableVal = 0;
          // }

          // totalDebit += Number(element.payableVal);
          // totalCredit += Number(element.receivableVal);

          
          if (element.payableVal != null || element.payableVal > 0) {
            element.payableVal = Number(element.payableVal).toFixed(2);
          }
          if (element.receivableVal != null || element.receivableVal > 0) {
            element.receivableVal = Number(element.receivableVal).toFixed(2);
          }

          if(element.payableVal == 0)
          {
            element.payableVal = "";
          } 
          else if(element.receivableVal == 0)
          {
            element.receivableVal = "";
          }
          //tempList.push(element);
        });

        // list = tempList;

        // list.push(
        //   { sl: this.fieldTitle['transactionalbalance'], payableVal: totalDebit.toFixed(2), receivableVal: totalCredit.toFixed(2) },
        // )

        // list.forEach(element => {
        //   if (element.debitVal != null) {
        //     element.debitVal = Number(element.debitVal).toFixed(2);
        //   }
        //   if (element.creditVal != null) {
        //     element.creditVal = Number(element.creditVal).toFixed(2);
        //   }
        // });

        totalDebit = Number(list[0].totalDebit);
        totalCredit = Number(list[0].totalCredit);

        list.push(
          { sl:'', particulars: this.fieldTitle['transactionalbalance'], payableVal: totalDebit.toFixed(2), receivableVal: totalCredit.toFixed(2) },
        )
        return list;
      } catch (e) {
        this.showErrorMsg(e);
      }
    }


  getDefaultData() {
    try {
      forkJoin([
        this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
        this.coreAccountingSvc.getSubLedgerType(),
        this.coreAccountingSvc.getSubLedgerTypeWiseLedger(),
      ]).subscribe({ 
        next: (res: any) => {
          this.modelSvc.companyList = res[0] || [];
          this.modelSvc.subLedgerTypeList = res[1] || [];
          this.modelSvc.ledgerList = res[2] || [];
          this.modelSvc.tempLedgerList = res[2] || [];

         
          this.modelSvc.setNewSearchParam();
          this.onChangeSubLedgerType();
          this.onChangeCompany();
          this.getLedgerRptList();
          this.preparePlaceholderData();
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

  preparePlaceholderData() {
    try {
      if(this.modelSvc.companyList.length == 1) {
        this.isPlaceholderDisableCompany = true;
      }
      else
      {
        this.isPlaceholderDisableCompany = false;
      }
      if(this.modelSvc.subLedgerTypeList.length == 1) {
        this.isPlaceholderDisableSubLedgerType = true;
      }
      else
      {
        this.isPlaceholderDisableSubLedgerType = false;
      }
      if(this.modelSvc.ledgerList.length == 1 && this.modelSvc.searchParam.subLedgerTypeID != null) {
        this.isPlaceholderDisableLedger = true;
      }
      else
      {
        this.isPlaceholderDisableLedger = false;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany() {
    try {
      this.onChangeSPParameterData();

      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      forkJoin([
        this.orgSvc.getOrgStructure(elementCode, this.modelSvc.searchParam.companyID),
        this.coreAccountingSvc.getProject(this.modelSvc.searchParam.companyID),
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.prepareOfficeBranchUnitList(res[0] || []);
          this.modelSvc.projectList = res[1] || [];
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

  onChangeFromDate() {
    try {
      this.onChangeSPParameterData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeToDate() {
    try {
      this.onChangeSPParameterData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeGroupLedger() {
    try {
      this.onChangeSPParameterData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeSubLedgerType() {
    try {
      this.modelSvc.ledgerList = [];
      let list = this.modelSvc.tempLedgerList.filter(x=> x.subLedgerTypeID == this.modelSvc.searchParam.subLedgerTypeID);
      this.modelSvc.ledgerList = GlobalMethods.jsonDeepCopy(list);
      if(this.modelSvc.ledgerList.length == 1)
      {
        this.modelSvc.searchParam.ledgerID = this.modelSvc.ledgerList[0].id;
        this.modelSvc.searchParam.ledgerName = this.modelSvc.ledgerList[0].name;
      }
      else
      {
        this.modelSvc.searchParam.ledgerID = null;
        this.modelSvc.searchParam.ledgerName = null;
      }
      setTimeout(() => {
        this.onChangeSPParameterData();
      }, 20);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeSPParameterData() {
    try {
      this.preparePlaceholderData();
      if(this.modelSvc.searchParam.orgID == null)
      {
        this.modelSvc.searchParam.unitBranch = null;
      }
      if(this.modelSvc.searchParam.projectID == null)
      {
        this.modelSvc.searchParam.project = null;
      }
      this.isSPParamChange = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  search(form: NgForm){
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.ledgerReportForm.form);
        return;
      }

      this.spData.searchParams = this.modelSvc.prepareSearchParams();
      this.spData.pageNo = 1;
      this.pageReset(0);

      if(this.isSPParamChange) { 
        this.populateGrid(true);
      }
      else {
        this.populateGrid(false);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  populateGrid(isRefresh: boolean) {
    try { 
      this.spData.isRefresh = isRefresh;
      this.dataSvc.getSubLedgerReport(this.spData, this.modelSvc.searchParam.companyID,this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.ledgerID, this.modelSvc.searchParam.subLedgerTypeID).subscribe({
        next: (res: any) => {
          this.modelSvc.subLedgerList = res[res.length - 1] || [];
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isSPParamChange = false;
          if (this.modelSvc.subLedgerList.length > 0) {
            this.modelSvc.prepareGridData();
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { 
          this.spData.isRefresh = false;
          this.isSPParamChange = false;
          if (this.modelSvc.subLedgerList.length == 0) {
            this.modelSvc.totalDebit = 0;
            this.modelSvc.totalCredit = 0;
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset(){
    try {
      this.preparePlaceholderData();
      this.modelSvc.searchParam.ledgerID = null;
      this.modelSvc.searchParam.ledgerName = null;
      this.modelSvc.setNewSearchParam();
      this.onChangeSPParameterData();
      this.onChangeCompany();

      this.modelSvc.subLedgerList = [];
  
      this.modelSvc.totalCredit = 0;
      this.modelSvc.totalDebit = 0;
      this.gridOption.totalRecords = 0;
      this.onChangeSubLedgerType();
      this.formResetByDefaultValue(this.ledgerReportForm.form, this.modelSvc.searchParam);
      this.ledgerReportForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  getLedgerRptList() {
    try {
      this.spData = new QueryData({
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'subledgerRpt',
        pageNo: 1
      });
    } catch (error) {
      this.showMsg(error);
    }
  }

   /*********************Print and mail*************************/
    onExport(form: NgForm, isExport: boolean) {
      try {
        if (form.invalid) {
          this.directive.validateAllFormFields(this.ledgerReportForm.form);
          return;
        }

        let spData = GlobalMethods.jsonDeepCopy(this.spData);
        spData.pageNo = 0;
        this.dataSvc.getSubLedgerReport(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.ledgerID, this.modelSvc.searchParam.subLedgerTypeID).subscribe({
          next: (res: any) => {
            this.modelSvc.searchParam.ledgerName = this.modelSvc.ledgerList.find(x=>x.id == this.modelSvc.searchParam.ledgerID)?.name;
            this.modelSvc.searchParam.subLedgerTypeName = this.modelSvc.subLedgerTypeList.find(x=>x.id == this.modelSvc.searchParam.subLedgerTypeID)?.name;
            let subLedgerList = res[res.length - 1] || [];
            if (subLedgerList.length > 0) {
              this.modelSvc.prepareGridDataForReport(subLedgerList);
            }
            let reportData = this.prepareReportOption(subLedgerList);
            if (isExport) {
              this.coreAccountingSvc.printReport(reportData);
            } else {
              this.sendEmail(reportData);
            }
          },
          error: (res: any) => { },
        });
      } catch (e) {
        throw e;
      }
    }
  
    private prepareReportOption(data: any[]) {
      try {
        return {
          reportName: 'SubLedger',
          reportType: FixedIDs.reportRenderingType.PDF,
          userID: GlobalMethods.timeTick(),
          data: data,
          params: this.modelSvc.getRptParameter(),
          dataColumns: this.modelSvc.getColumnHeader(),
          dataSetName: "SpACM_RptSubLedger",
        };
      } catch (e) {
        throw e;
      }
    }
  
    sendEmail(reportData: any) {
      try {
        this.coreAccountingSvc.getReport(reportData).subscribe({
          next: (res: any) => {
            this.showEmailModal(res.body.message);
          },
          error: (e: any) => {
            this.showErrorMsg(e);
          }
        });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }
  
    showEmailModal(reportName: string) {
      try {
        let obj = {
          attachmentName: [],
          moduleName: GlobalConstants.ERP_MODULES.ACM.name,
        };
        obj.attachmentName.push(reportName);
  
        this.dialogSvc.open(EmailSendComponent, {
          data: obj,
          header: this.fieldTitle['mailsendingoption'],
          width: '40%'
        });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }

}


