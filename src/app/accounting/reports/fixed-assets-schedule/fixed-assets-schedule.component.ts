import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { forkJoin } from 'rxjs';
import { fixedAssetsScheduleValidation } from '../../models/report/report.model';
import {
  ProviderService,
  BaseComponent,
  QueryData,
  FixedIDs,
  GlobalMethods,
  GlobalConstants,
  ValidatingObjectFormat,
  AccountingReportDataService,
  ValidatorDirective,
  GridOption,
  ColumnType
} from '../../index';
import { FixedAssetsScheduleModelService } from '../../services/accounting-report/fixed-assets-schedule/fixed-assets-schedule-model.service';
import { SharedModule } from 'src/app/shared/shared.module';


@Component({
  selector: 'app-fixed-assets-schedule',
  templateUrl: './fixed-assets-schedule.component.html',
  providers: [AccountingReportDataService, FixedAssetsScheduleModelService],
  standalone:true,
  imports:[SharedModule]
})
export class FixedAssetsScheduleComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("searchFilterForm", { static: true, read: NgForm }) searchFilterForm: NgForm;
  spData: any = new QueryData({pageNo:0});
  gridOption: GridOption;
  maxDate:Date = null;
  minDate:Date = null;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;
  isExport:boolean = false;
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: FixedAssetsScheduleModelService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    private rptService: AccountingReportDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = fixedAssetsScheduleValidation();
  }
  ngOnInit(): void {
    try {
      this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
      this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.modelSvc.fieldTitle = this.fieldTitle;
      this.initGridOption();
      this.getDefaultData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
      try {
        const gridObj = {
          dataSource: "modelSvc.fixedAssetsScheduleList",
          refreshEvent:this.refreshEventHandler,
          isDynamicHeader:false
        } as GridOption;
        this.gridOption = new GridOption(this, gridObj);
      } catch (e) {
        this.showErrorMsg(e);
      }
  }
  refreshEventHandler(isRefresh: boolean = true) {
    try {
      this.spData.isRefresh = isRefresh;
      this.onSubmit(this.searchFilterForm, false);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
   getDefaultData(){
      try {
        forkJoin([
          this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
          this.coreAccountingSvc.getFinancialYear()
        ]).subscribe({
            next: (res: any) => {
              this.modelSvc.companyList = res[0] || [];
              this.modelSvc.financialYearList = res[1] || [];
              this.modelSvc.setNewSearch();

              if(this.modelSvc.companyList.length == 1)
              {
                this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
                this.modelSvc.searchParam.company = this.modelSvc.companyList[0].name;
              }

              this.onChangeCompany();

              if(this.modelSvc.financialYearList.length == 1)
              {
                this.modelSvc.searchParam.financialYearID = this.modelSvc.financialYearList[0].id;
                this.modelSvc.searchParam.financialYear = this.modelSvc.financialYearList[0].name;
                this.onChangeFinancialYear();
              }
            },
            error: (res: any) => {
              this.showErrorMsg(res);
            },
          });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }
  onChangeCompany(){
    try {
        let orgType = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
        forkJoin([
          this.orgSvc.getOrgStructure(orgType, this.modelSvc.searchParam.companyID),
          this.coreAccountingSvc.getProject(this.modelSvc.searchParam.companyID),
        ]).subscribe({
          next: (res: any) => { 
            this.modelSvc.officeBranchList = this.modelSvc.prepareOrgList(res[0] || []);
            this.modelSvc.projectList = res[1] || [];  
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
          complete: () => {},
        });
      } catch (error) {
        this.showErrorMsg(error);
      }
    }
  onChangeFinancialYear(){
    try {
      this.maxDate = null;
      this.minDate = null;
      this.modelSvc.searchParam.fromDate = null;
      this.modelSvc.searchParam.toDate = null;
      if(this.modelSvc.searchParam.financialYearID > 0)
      {
        let financialYear = this.modelSvc.financialYearList.find(f => f.id == this.modelSvc.searchParam.financialYearID);
        this.minDate = new Date(financialYear.fromDate);
        this.modelSvc.searchParam.fromDate = this.minDate;
        this.maxDate = new Date(financialYear.toDate);
        let currentDate = new Date(GlobalConstants.serverDate);
        if(this.maxDate > currentDate)
        {
          this.modelSvc.searchParam.toDate = currentDate;
        }
        else{
          this.modelSvc.searchParam.toDate = this.maxDate;
        }
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  onSubmit(formGroup: NgForm, isExport?:boolean) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.isExport = isExport;
      this.getFixedAssetsSchedule();
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      this.modelSvc.setNewSearch();
      this.modelSvc.fixedAssetsScheduleList = [];
      this.modelSvc.total = {};
      this.formResetByDefaultValue(this.searchFilterForm.form, this.modelSvc.searchParam);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getFixedAssetsSchedule(){
    try {
      this.rptService.getFixedAssetsSchedule(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID).subscribe({
        next: (data: any) => {
          this.modelSvc.fixedAssetsScheduleList = data || [];
          this.modelSvc.prepareTotalBalance();
          if(this.isExport)
          {
            let reportData = this.preparePrintOption(this.modelSvc.fixedAssetsScheduleList);
            this.coreAccountingSvc.printReport(reportData);
            this.isExport = false;
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

  /*********************Print*************************/
  private preparePrintOption(data: any[]) {
    try {
      return{
        reportName: 'FixedAsstesSchedule',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "SpACM_RptFixedAssetsSchedule",
      };
    } catch (e) {
      throw e;
    }
  }








}

