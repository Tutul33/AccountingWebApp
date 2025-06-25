import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, UntypedFormGroup, Validators } from '@angular/forms';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { forkJoin } from 'rxjs';
import { formatDate } from '@angular/common';
import { balanceSheetValidation } from '../../models/report/report.model';
import { BalanceSheetModelService } from '../../services/accounting-report/balance-sheet/balance-sheet-model.service';

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
  GridOption
} from '../../index';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  providers: [AccountingReportDataService, BalanceSheetModelService],
  standalone:true,
  imports:[SharedModule]
})
export class BalanceSheetComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("searchFilterForm", { static: true, read: NgForm }) searchFilterForm: NgForm;
  isExport:boolean = false;
  spData: any = new QueryData({pageNo:0});
  gridOption: GridOption;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;
  maxDate = null;
  isFinancialYearRequired:true;
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: BalanceSheetModelService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    private rptService: AccountingReportDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = balanceSheetValidation();
  }
  ngOnInit(): void {
    try {
      this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
      this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.modelSvc.fieldTitle = this.fieldTitle;
      this.modelSvc.prepareFinancialHeadName();
      this.initGridOption();
      this.getDefaultData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
      try {
        const gridObj = {
          dataSource: "modelSvc.balanceSheetList",
          isDynamicHeader:false,
          isGlobalSearch: false,
          paginator:false
        } as GridOption;
        this.gridOption = new GridOption(this, gridObj);
      } catch (e) {
        this.showErrorMsg(e);
      }
  }

   getDefaultData(){
      try {
        forkJoin([
          this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
          this.coreAccountingSvc.getFinancialYear(),
          this.coreAccountingSvc.getIsSkippedControlLedger()
        ]).subscribe({
            next: (res: any) => {
              this.modelSvc.companyList = res[0] || [];
              this.modelSvc.financialYearList = res[1] || [];
              this.modelSvc.isSkippedControlLedger = res[2] || false;
              this.modelSvc.setNewSearch();
              this.addRequiredInFinancial();

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
        this.modelSvc.isRefresh = true;
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
      this.modelSvc.searchParam.financialYearTodate = null;
      if(this.modelSvc.searchParam.financialYearID > 0)
      {
        let financialYearToDate = this.modelSvc.financialYearList.find(f => f.id == this.modelSvc.searchParam.financialYearID)?.toDate;
        this.modelSvc.searchParam.financialYearTodate = formatDate(financialYearToDate, "dd-MMM-yyyy", "en");
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  onSubmit(form: NgForm, isExport?:boolean) {
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.searchFilterForm.form);
        return;
      }
      this.isExport = isExport;
      this.getBalanceSheet();
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }
  
  getBalanceSheet() {
    try {
      this.rptService.getBalanceSheet(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.financialYearID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.stockValuationMethodCd, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate).subscribe({
        next: (data: any) => {
          this.modelSvc.tempBalanceSheetList = data || [];
          this.modelSvc.balanceSheetList = this.modelSvc.prepareData(data);
          this.modelSvc.prepareGrandTotal();
          this.modelSvc.prepareFinancialHeadName();
          let reportData = this.preparePrintOption(this.modelSvc.balanceSheetList);
          if(this.isExport)
          {
            this.coreAccountingSvc.printReport(reportData);
          }
          else if(this.isExport == false){
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

  sendEmail(reportData: any){
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
        
    showEmailModal(reportName:string){
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


  reset() {
    try {
      this.modelSvc.setNewSearch();
      this.modelSvc.tempBalanceSheetList = [];
      this.modelSvc.balanceSheetList = [];
      this.modelSvc.prepareGrandTotal();
      this.modelSvc.prepareFinancialHeadName();
      this.formResetByDefaultValue(this.searchFilterForm.form, this.modelSvc.searchParam);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onChangeLedgerSelection(){
    try {
      this.modelSvc.balanceSheetList = this.modelSvc.prepareData(this.modelSvc.tempBalanceSheetList);
      this.modelSvc.prepareGrandTotal();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  onChangeReportType(){
    try {
      if(this.modelSvc.searchParam.reportType == '1')
      {
        this.modelSvc.searchParam.fromDate = null;
        this.modelSvc.searchParam.toDate = null;
        this.addRequiredInFinancial();
      }
      else{
        this.modelSvc.searchParam.financialYearID = null;
        this.modelSvc.searchParam.financialYear = null;
        this.modelSvc.searchParam.financialYearTodate = null;

        let currentDate = new Date(GlobalConstants.serverDate);

        this.modelSvc.searchParam.fromDate = currentDate;
        this.modelSvc.searchParam.toDate = currentDate;

        this.addRequiredInFromToDate();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  addRequiredInFinancial(){
    try {
      setTimeout(() => {
        let financialYearCtrl = this.searchFilterForm.form.controls['financialYearID'] as UntypedFormGroup;
        financialYearCtrl.setValidators(Validators.required);
        financialYearCtrl.updateValueAndValidity();
      }, 50);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  addRequiredInFromToDate(){
    try {
      setTimeout(() => {
        let fromDateCtrl = this.searchFilterForm.form.controls['fromDate'] as UntypedFormGroup;
        fromDateCtrl.setValidators(Validators.required);
        fromDateCtrl.updateValueAndValidity();

        let toDateCtrl = this.searchFilterForm.form.controls['toDate'] as UntypedFormGroup;
        toDateCtrl.setValidators(Validators.required);
        toDateCtrl.updateValueAndValidity();
      }, 50);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  /*********************Print*************************/
  private preparePrintOption(data: any[]) {
    try {
      let printData = GlobalMethods.jsonDeepCopy(data);
      //prepare asset total
      printData.push({
        accountNatureCd: FixedIDs.accountingNature.Assets,
        particular: this.fieldTitle['total'],
        firstFinancialYearBalance: this.modelSvc.assetTotal.firstFinancialYearBalance,
        secondFinancialYearBalance: this.modelSvc.assetTotal.secondFinancialYearBalance,
        thirdFinancialYearBalance: this.modelSvc.assetTotal.thirdFinancialYearBalance,
        fourthFinancialYearBalance: this.modelSvc.assetTotal.fourthFinancialYearBalance
      });

       //prepare liabilites total
       printData.push({
        accountNatureCd: FixedIDs.accountingNature.Liabilities,
        particular: this.fieldTitle['total'],
        firstFinancialYearBalance: this.modelSvc.liabilitiesTotal.firstFinancialYearBalance,
        secondFinancialYearBalance: this.modelSvc.liabilitiesTotal.secondFinancialYearBalance,
        thirdFinancialYearBalance: this.modelSvc.liabilitiesTotal.thirdFinancialYearBalance,
        fourthFinancialYearBalance: this.modelSvc.liabilitiesTotal.fourthFinancialYearBalance
      });

      return{
        reportName: this.modelSvc.searchParam.resultType == '1' ? 'BalanceSheetTShape' : 'BalanceSheetLShape',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: printData,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "SpACM_RptBalanceSheet",
      };
    } catch (e) {
      throw e;
    }
  }








}
