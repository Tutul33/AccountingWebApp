import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatorDirective } from 'src/app/app-shared';
import { GridOption } from 'src/app/shared/models/common.model';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { AccountingReportDataService } from '../../services/accounting-report/accounting-report-data.service';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { DayBookModelService } from '../..';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { dayBookValidation } from '../../models/report/report.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-day-book',
  templateUrl: './day-book.component.html',
  providers: [AccountingReportDataService, DayBookModelService],
  standalone:true,
  imports:[SharedModule]
})
export class DayBookComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive;
  @ViewChild("dayBookListForm", { static: true, read: NgForm }) dayBookListForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  spData: any = new QueryData();
  isRefresh: boolean = true;
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public dataSvc: AccountingReportDataService,
    public modelSvc: DayBookModelService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,

  ) {
    super(providerSvc);
    this.validationMsgObj = dayBookValidation();
  }

  ngOnInit(): void {
    this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.initGridOption();
    this.getDefaultData();

  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.dayBookList",
        getServerData: this.onPage,
        refreshEvent: this.refreshEventHandler,
        filterFromServer: this.filterFromServer,
        lazy: true,
        columns: this.GridColumns(),
        isClear: false,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          exportDataEvent: this.exportData,
          title: this.fieldTitle['daybook']
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  GridColumns(): ColumnType[] {
    return [
      { field: "date", header: this.fieldTitle["date"] },
      { field: "voucherNo", header: this.fieldTitle["vouchernumber"] },
      { field: "fromAccount", header: this.fieldTitle["fromaccount"] },
      { field: "fromSubLedger", header: this.fieldTitle["sub-ledger"] },
      { field: "description", header: this.fieldTitle["particulars"] },
      { field: "chequeNo", header: this.fieldTitle["chequeno"] },
      { field: "chequeDate", header: this.fieldTitle["chequedate"] },
      { field: "toAccount", header: this.fieldTitle["toaccount"] },
      { field: "toSubLedger", header: this.fieldTitle["sub-ledger"] },
      { field: "invoiceBillRefNo", header: this.fieldTitle["inv/billref.no"] },
      { field: "debitVal", header: this.fieldTitle["debit(bdt)"], styleClass: "d-center" },
      { field: "creditVal", header: this.fieldTitle["credit(bdt)"], styleClass: "d-center" },
      { field: "insertDateTime", header: this.fieldTitle["createddatetime"] },
      { field: "lastUpdate", header: this.fieldTitle["lastupdateddate"] },

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
      if (!this.dayBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.dayBookListForm.form as UntypedFormGroup);
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
      if (!this.dayBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.dayBookListForm.form as UntypedFormGroup);
        return;
      }
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

  getDefaultData() {
    try {
      this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res || [];
          this.modelSvc.setNewSearchParam();
          if (this.modelSvc.companyList.length == 1) {
            this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
          }
          this.onChangeCompany();
          this.getDayBookList();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeFromDate() {
    try {
      this.isRefresh = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeToDate() {
    try {
      this.isRefresh = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeOrg() {
    try {
      if (this.modelSvc.searchParam.orgID == null) {
        this.modelSvc.searchParam.unitBranch = null;
      }

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeProject() {
    try {
      if (this.modelSvc.searchParam.projectID == null) {
        this.modelSvc.searchParam.project = null;
      }
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
      this.getDayBookList();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      this.spData.isRefresh = isRefresh;
      this.dataSvc.getDayBookList(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate).subscribe({
        next: (res: any) => {
          this.modelSvc.dayBookList = res[res.length - 1] || [];
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isRefresh = false;
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
      this.modelSvc.setNewSearchParam();
      
      this.gridOption.totalRecords = 0;
      this.modelSvc.dayBookList = [];
      setTimeout(() => {
        this.formResetByDefaultValue(formGroup.form, this.modelSvc.searchParam);
      }, 5);
      this.populateGrid(true);

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getDayBookList() {
    try {

      this.spData = new QueryData({
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'dayBook',
        pageNo: 1
      });

      this.populateGrid(true);
    } catch (error) {
      this.showMsg(error);
    }
  }

  exportData(event: any) {
    try {
      if (!this.dayBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.dayBookListForm.form as UntypedFormGroup);
        return;
      }
      event.exportOption.title = this.fieldTitle['daybook'] //+ "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en");

      let spData = GlobalMethods.jsonDeepCopy(this.spData);
      spData.pageNo = 0;

      return this.dataSvc.getDayBookList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate).pipe(
        map((response: any) => {
          return { values: response[response.length - 1], columns: this.GridColumns() }
        })
      );
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  onExport(isExport: boolean) {
    try {debugger
      if (!this.dayBookListForm.form.valid) {
        this.directive.validateAllFormFields(this.dayBookListForm.form as UntypedFormGroup);
        return;
      }
      let spData = new QueryData();
      spData.pageNo = 0;
      this.dataSvc.getDayBookList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          let reportData = this.prepareDayBookOption(data);

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
        closable:true
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }



  /*********************Print*************************/
  private prepareDayBookOption(data: any[]) {
    try {
      return {
        reportName: 'DayBook',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "spACM_RptDayBook",
      };
    } catch (e) {
      throw e;
    }
  }


}

