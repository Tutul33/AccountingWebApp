import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { forkJoin } from 'rxjs';
import { formatDate } from '@angular/common';

import {
  ProviderService,
  BaseComponent,
  QueryData,
  FixedIDs,
  GlobalMethods,
  GlobalConstants,
  ValidatingObjectFormat,
  AccountingReportDataService,
  ModalService,
  ValidatorDirective,
  DynamicDialogRef,
  GridOption,
  CashFlowStatmentModelService
} from '../../index';
import { cashFlowStatementValidation } from '../../models/report/report.model';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-cash-flow-statment',
  templateUrl: './cash-flow-statment.component.html',
  providers: [AccountingReportDataService, CashFlowStatmentModelService, ModalService],
  standalone: true,
  imports: [SharedModule]
})
export class CashFlowStatmentComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("searchFilterForm", { static: true, read: NgForm }) searchFilterForm: NgForm;
  isExport: boolean = false;
  spData: any = new QueryData({ pageNo: 0 });
  searchParam: any = {};
  ref: DynamicDialogRef;
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;
  gridOption: GridOption;
  cashFlowDataList: any = [];
  sln = { total: 4, open: 5, close: 6,lossAndProfit:0 };

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CashFlowStatmentModelService,
    public modalService: ModalService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    private rptService: AccountingReportDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = cashFlowStatementValidation();
  }
  ngOnInit(): void {
    try {
      this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
      this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.initGridOption();
      this.getDefaultData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "cashFlowDataList",
        isDynamicHeader: false,
        isClear: false,
        paginator: false,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  getDefaultData() {
    try {
      forkJoin([
        this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString())
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res[0] || [];
          this.setNewSearch();
          if (this.modelSvc.companyList.length == 1) {
            this.searchParam.companyID = this.modelSvc.companyList[0].id;
            this.searchParam.company = this.modelSvc.companyList[0].name;
          }
          this.onChangeCompany();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  onChangeCompany() {
    try {
      this.modelSvc.isRefresh = true;
      let orgType = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      forkJoin([
        this.orgSvc.getOrgStructure(orgType, this.searchParam.companyID),
        this.coreAccountingSvc.getProject(this.searchParam.companyID),
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.officeBranchList = this.modelSvc.prepareOrgList(res[0] || []);
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

  onSubmit(form: NgForm, isExport: boolean) {
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.searchFilterForm.form);
        return;
      }
      this.isExport = isExport;
      this.getCashFlowStatments();
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  search(form: NgForm) {
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.searchFilterForm.form);
        return;
      }

      this.rptService.getCashFlowStatments(this.spData, this.searchParam.companyID, this.searchParam.fromDate, this.searchParam.toDate, this.searchParam.orgID, this.searchParam.projectID).subscribe({
        next: (data: any) => {
          let ledgerData = data.filter(x => ![this.sln.total, this.sln.open, this.sln.close].includes(x.sln));
          // let loss = data.filter(x => x.sln == this.sln.lossAndProfit);
          //this.cashFlowDataList.push({ particular: loss[0].groupName, amount: loss[0].amount });
          this.cashFlowDataList = this.modelSvc.prepareData(ledgerData);
          let total = data.filter(x => x.sln == this.sln.total);
          let open = data.filter(x => x.sln == this.sln.open);
          let close = data.filter(x => x.sln == this.sln.close);
       
          if (ledgerData.length > 0) {
            this.cashFlowDataList.push({ particular: total[0].groupName, amount: total[0].amount });
            this.cashFlowDataList.push({ particular: open[0].groupName, amount: open[0].amount });
            this.cashFlowDataList.push({ particular: close[0].groupName, amount: close[0].amount });
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getCashFlowStatments() {
    try {
      this.rptService.getCashFlowStatments(this.spData, this.searchParam.companyID, this.searchParam.fromDate, this.searchParam.toDate, this.searchParam.orgID, this.searchParam.projectID).subscribe({
        next: (data: any) => {
          this.searchParam.companyShortAddress = null;
          if (data.length > 0) {
            this.searchParam.companyShortAddress = data[0].companyShortAddress;
          }
          //let ledgerData = data.filter(x => ![this.sln.total, this.sln.open, this.sln.close,this.sln.lossAndProfit].includes(x.sln));
          let ledgerData = data.filter(x => ![this.sln.total, this.sln.open, this.sln.close].includes(x.sln));
          let prepareDataList = this.modelSvc.prepareData(ledgerData);
          let total = data.filter(x => x.sln == this.sln.total);
          let open = data.filter(x => x.sln == this.sln.open);
          let close = data.filter(x => x.sln == this.sln.close);

          if (prepareDataList.length > 0) { //for total balance and opeing and closing 
            prepareDataList.push({ particular: total[0].groupName, amount: GlobalMethods.convertToDecimal(total[0].amount, 2) });
            prepareDataList.push({ particular: open[0].groupName, amount: GlobalMethods.convertToDecimal(open[0].amount, 2) });
            prepareDataList.push({ particular: close[0].groupName, amount: GlobalMethods.convertToDecimal(close[0].amount, 2) });
          }

          let reportData = this.prepareCashFlowOption(prepareDataList);
          if (this.isExport) {
            this.coreAccountingSvc.printReport(reportData);
          }
          else {
            this.sendEmail(reportData);
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
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

  reset() {
    try {
      this.setNewSearch();
      this.cashFlowDataList = [];
      setTimeout(() => {
        this.formResetByDefaultValue(this.searchFilterForm.form, this.searchParam);
      }, 0);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNewSearch() {
    let currentDate = new Date(GlobalConstants.serverDate);
    this.searchParam = {
      companyID: GlobalConstants.userInfo.companyID,
      company: GlobalConstants.userInfo.company,
      orgID: null,
      unitBranch: null,
      projectID: null,
      project: null,
      dateRange: null,
      fromDate: currentDate,
      toDate: currentDate
    }
  }

  /*********************Print*************************/
  private prepareCashFlowOption(data: any[]) {
    try {
      return {
        reportName: 'CashFlowStatement',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.getRptParameter(),
        dataColumns: this.getCashFlowColumnHeader(),
        dataSetName: "SpACM_GetCashFlowStatments",
      };
    } catch (e) {
      throw e;
    }
  }

  getRptParameter() {
    try {
      let dateRange = formatDate(this.searchParam.fromDate, 'dd-MMM-yy', "en") + ' - ' + formatDate(this.searchParam.toDate, 'dd-MMM-yy', "en")
      var params = [
        {
          key: "CompanyLogoUrl",
          value: GlobalConstants.companyInfo.companyLogoUrl,
        },
        {
          key: "Currency",
          value: GlobalConstants.companyInfo.currency
        },
        {
          key: "Company",
          value: this.searchParam.company || null
        },
        {
          key: "UnitBranch",
          value: this.searchParam.orgID > 0 ? this.searchParam.unitBranch : null
        },
        {
          key: "Project",
          value: this.searchParam.projectID > 0 ? this.searchParam.project : null
        },
        {
          key: "DateRange",
          value: dateRange
        },
        {
          key: "CompanyShortAddress",
          value: this.searchParam.companyShortAddress || null
        },
        {
          key: "PrintedBy",
          value: GlobalConstants.userInfo.userName
        },
        {
          key: "ReportName",
          value: this.fieldTitle['cashflowstatment']
        }
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }

  private getCashFlowColumnHeader() {
    try {
      var columns = [
        { key: 'Particular', value: 'Particular' },
        { key: 'Amount', value: 'Amount' }
      ];
      return columns;
    } catch (e) {
      throw e;
    }
  }

}
