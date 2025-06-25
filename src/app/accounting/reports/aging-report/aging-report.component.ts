import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatorDirective } from 'src/app/app-shared';
import { GridOption } from 'src/app/shared/models/common.model';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { AccountingReportDataService } from '../../services/accounting-report/accounting-report-data.service';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { AgingReportModelService } from '../..';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-aging-report',
  templateUrl: './aging-report.component.html',
  providers: [AccountingReportDataService, AgingReportModelService],
  standalone: true,
  imports: [SharedModule]
})
export class AgingReportComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive;
  @ViewChild("agingreportForm", { static: true, read: NgForm }) agingreportForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  spData: any = new QueryData();
  isRefresh: boolean = true;
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  subTypeID: any;

  constructor(
    protected providerSvc: ProviderService,
    public dataSvc: AccountingReportDataService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    public modelSvc: AgingReportModelService

  ) {
    super(providerSvc);
    this.validationMsgObj = this.modelSvc.formValidation();
  }

  ngOnInit(): void {
    this.modelSvc.keyValuePair = this.keyValuePair;
    this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.getDefaultData();
    this.initGridOption();

  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.agingList",
        getServerData: this.onPage,
        refreshEvent: this.refreshEventHandler,
        filterFromServer: this.filterFromServer,
        lazy: true,
        columns: this.GridColumns(),
        isClear: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          exportDataEvent: this.onExportData,
          title: this.fieldTitle['agingreport']
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  GridColumns(): ColumnType[] {
    return [
      { field: "subLedgerName", header: this.fieldTitle["name"],isDDFilter:true,dataList:this.modelSvc.subLedgerList,labelField:'subLedgerName' },
      { field: "contactNo", header: this.fieldTitle["contactno"] ,isDDFilter:true,dataList:this.modelSvc.contactList,labelField:'contactNo'},
      { field: "currentBalance", header: this.fieldTitle["totaldues"], styleClass: 'd-center' },
      { field: "daysBalance30", header: this.fieldTitle["1-30days"], styleClass: 'd-center' },
      { field: "daysBalance60", header: this.fieldTitle["31-60days"], styleClass: 'd-center' },
      { field: "daysBalance90", header: this.fieldTitle["61-90days"], styleClass: 'd-center' },
      { field: "daysBalance120", header: this.fieldTitle["90+days"], styleClass: 'd-center' },
    ];
  }

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("subLedgerName, subLedgerName");
      ddlProperties.push("contactNo, contactNo");

      return ddlProperties;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.subLedgerList = data[0];
      this.modelSvc.contactList = data[1];

      this.gridOption.columns = this.GridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  onPage(event: any, isRefresh: boolean = false) {
    try {
      if (!this.agingreportForm.form.valid) {
        this.directive.validateAllFormFields(this.agingreportForm.form as UntypedFormGroup);
        return;
      }
      this.spData.pageNo = this.gridOption.serverPageNumber(event);
      this.spData.pageDataCount = event.rows;
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  refreshEventHandler(isRefresh: boolean = true) {
    try {
      if (!this.agingreportForm.form.valid) {
        this.directive.validateAllFormFields(this.agingreportForm.form as UntypedFormGroup);
        return;
      }
      this.spData.pageNo = this.gridOption.resetPageNumber(this.gridOption.first);
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterFromServer(event: any, filters: any[]) {
    try {
      if (!this.agingreportForm.form.valid) {
        this.directive.validateAllFormFields(this.agingreportForm.form as UntypedFormGroup);
        return;
      }
      this.spData.pageNo = 1;debugger
      this.modelSvc.prepareFilterValue(filters);
       this.spData.searchParams = this.modelSvc.prepareSearchParams();
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

  getDefaultData() {
    try {
      this.isRefresh = true;
      this.modelSvc.searchParam.companyID = GlobalConstants.userInfo.companyID;
      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      forkJoin([
        this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
        this.orgSvc.getOrgStructure(elementCode, this.modelSvc.searchParam.companyID),
        this.coreAccountingSvc.getProject(this.modelSvc.searchParam.companyID),
        this.coreAccountingSvc.getCOAStructure(this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID),
        this.coreAccountingSvc.getSubLedgerType(true)
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res[0] || [];
          this.modelSvc.branchList = res[1] || [];
          this.modelSvc.prepareOfficeBranchUnitList(res[1] || []);
          this.modelSvc.projectList = res[2] || [];
          let results = res[3] || [];
          let ledgers = results.filter(x => x.subLedgerTypeID != null);
          const uniqueledgers = Array.from(new Map(ledgers.map(item => [item.id, item])).values());
          this.modelSvc.ledgerList = uniqueledgers;
          this.modelSvc.templedgerList = uniqueledgers;
          this.modelSvc.setNewSearchParam();
          if (this.modelSvc.companyList.length == 1) {
            this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
          }
          this.modelSvc.subLedgerTypeList = res[4] || [];

          setTimeout(() => {
            this.getLedgerList();
            this.agingreportForm.form.markAsPristine();
          }, 20)

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

  getLedgerList() {
    try {
      this.coreAccountingSvc.getCOAStructure(this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID).subscribe({
        next: (res: any) => {
          let results = res || [];
          let ledgers = results.filter(x => x.subLedgerTypeID != null);
          const uniqueledgers = Array.from(new Map(ledgers.map(item => [item.id, item])).values());
          this.modelSvc.ledgerList = uniqueledgers;

          if (this.modelSvc.ledgerList.length == 1) {
            this.modelSvc.searchParam.ledgerID = this.modelSvc.ledgerList[0].id;
            this.modelSvc.ledgerId = this.modelSvc.ledgerList[0].id;
            this.formResetByDefaultValue(this.agingreportForm.form, this.modelSvc.searchParam);
            this.agingreportForm.form.markAsDirty();

          }

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeOrg() {
    try {
      if (this.modelSvc.searchParam.orgID == null) {
        this.modelSvc.searchParam.unitBranch = null;
      }
      this.modelSvc.ledgerList = [];
      this.getLedgerList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeProject() {
    try {
      this.modelSvc.searchParam.ledgerID = null;
      if (this.modelSvc.searchParam.projectID == null) {
        this.modelSvc.searchParam.project = null;
      }
      this.modelSvc.ledgerList = [];
      this.getLedgerList();

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeLedgerType() {
    try {
      this.modelSvc.ledgerList = this.modelSvc.templedgerList.filter(x => x.subLedgerTypeID == this.modelSvc.searchParam.subLedgerTypeID)
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany() {
    try {
      this.isRefresh = true;
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

  search(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      if (this.isRefresh == false) {
        this.spData.pageNo = 1;
        this.pageReset(0);
      }
      this.getagingList();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      this.setParam();
     
      this.modelSvc.agingList = [];
      this.spData.isRefresh = isRefresh;
      this.dataSvc.getAgingReport(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.asOnDate, this.modelSvc.searchParam.ledgerID, this.modelSvc.searchParam.subLedgerTypeID).subscribe({
        next: (res: any) => {
          debugger
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          this.modelSvc.agingList = res[res.length - 1] || [];
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isRefresh = false;
          this.modelSvc.totalAmountData(res[res.length - 1] || []);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => {
          this.spData.isRefresh = false;
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset(formGroup: NgForm) {
    try {
      this.isRefresh = true;
      this.formResetByDefaultValue(formGroup.form, this.modelSvc.searchParam);
      this.modelSvc.setNewSearchParam();
      this.modelSvc.agingList = [];
      this.modelSvc.searchParam.ledgerID = null;
      this.modelSvc.searchParam.subLedgerTypeID = null;
      this.modelSvc.totalCurrentBalance = 0;
      this.modelSvc.total30DaysBalance = 0;
      this.modelSvc.total60DaysBalance = 0;
      this.modelSvc.total90DaysBalance = 0;
      this.modelSvc.total120DaysBalance = 0;

      this.gridOption.totalRecords = 0;
      formGroup.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getagingList() {
    try {
      if (!this.agingreportForm.form.valid) {
        return;
      }
       let _ddlProperties = this.prepareDDLProperties();

      this.spData = new QueryData({
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'agingreport',
        pageNo: 1,
         ddlProperties: _ddlProperties,
      });

      // this.spData = new QueryData({
      //   ddlProperties: _ddlProperties,
      //   pageNo: 1,
      //   isRefresh: isRefresh
      // });
      this.populateGrid(true);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onExportData(event: any) {
    try {
      if (!this.agingreportForm.form.valid) {
        this.directive.validateAllFormFields(this.agingreportForm.form as UntypedFormGroup);
        return;
      }
      event.exportOption.title = this.fieldTitle['agingreport']

      let spData = new QueryData();
      spData.pageNo = 0;

      return this.dataSvc.getAgingReport(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.asOnDate, this.modelSvc.searchParam.ledgerID, this.modelSvc.searchParam.subLedgerTypeID).pipe(
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
      this.modelSvc.totalAmountData(list);
      list.push(
        {
          contactNo: this.fieldTitle['total'], currentBalance: this.modelSvc.totalCurrentBalance != null ? this.modelSvc.totalCurrentBalance.toFixed(2) : 0.00,
          daysBalance30: this.modelSvc.total30DaysBalance != null ? this.modelSvc.total30DaysBalance.toFixed(2) : 0.00,
          daysBalance60: this.modelSvc.total60DaysBalance != null ? this.modelSvc.total60DaysBalance.toFixed(2) : 0.00,
          daysBalance90: this.modelSvc.total90DaysBalance != null ? this.modelSvc.total90DaysBalance.toFixed(2) : 0.00,
          daysBalance120: this.modelSvc.total120DaysBalance != null ? this.modelSvc.total120DaysBalance.toFixed(2) : 0.00,
        },
      )

      return list;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setParam() {
    try {
      this.modelSvc.searchParam.unitBranch = this.modelSvc.branchList.find(x => x.id == this.modelSvc.searchParam.orgID)?.name;
      this.modelSvc.searchParam.project = this.modelSvc.projectList.find(x => x.id == this.modelSvc.searchParam.projectID)?.name;
      this.modelSvc.searchParam.subLedgerName = this.modelSvc.subLedgerTypeList.find(x => x.id == this.modelSvc.searchParam.subLedgerTypeID)?.name;
      this.modelSvc.searchParam.ledgerName = this.modelSvc.ledgerList.find(x => x.id == this.modelSvc.searchParam.ledgerID)?.ledger;

    } catch (error) {

    }
  }


  /*********************Print*************************/

  onExport(isExport: boolean) {
    try {
      if (!this.agingreportForm.form.valid) {
        this.directive.validateAllFormFields(this.agingreportForm.form as UntypedFormGroup);
        return;
      }
      this.setParam();

      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getAgingReport(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.asOnDate, this.modelSvc.searchParam.ledgerID, this.modelSvc.searchParam.subLedgerTypeID).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          let reportData = this.prepareSubLedgerDetailOption(data);

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
        width: '40%',
        closable: true
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private prepareSubLedgerDetailOption(data: any[]) {
    try {
      return {
        reportName: 'AgingReport',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "spACM_RptAgingList",
      };
    } catch (e) {
      throw e;
    }
  }

}

