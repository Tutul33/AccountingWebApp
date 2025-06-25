import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FixedIDs, GlobalConstants, GlobalMethods, GridOption, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { BaseComponent } from 'src/app/shared';
import { AccountingReportDataService, IncomeStatementModelService } from '../../index';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { forkJoin } from 'rxjs';
import { NgForm } from '@angular/forms';
import { incomestatementValidation } from '../../models/report/report.model';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-income-statement',
  templateUrl: './income-statement.component.html',
  providers:[IncomeStatementModelService,AccountingReportDataService],
  standalone:true,
  imports:[SharedModule]
})
export class IncomeStatementComponent extends BaseComponent implements OnInit,AfterViewInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("searchFilterForm", { static: true, read: NgForm }) searchFilterForm: NgForm;
  gridOptionIncome: GridOption;
  gridOptionExpense: GridOption;
  gridOptionProfitLoss: GridOption;
  spData: any = new QueryData();
  isRefresh:boolean=false;
  isExport:boolean=false;
  
  constructor(protected providerSvc: ProviderService,
      public modelSvc: IncomeStatementModelService,
      public dataSvc: AccountingReportDataService,
      private orgSvc: OrgService,
      private coreAccountingSvc: CoreAccountingService){
      super(providerSvc);
      this.validationMsgObj = incomestatementValidation();
  }
  ngOnInit(): void {
    this.setBranchProjectConfig();
    this.modelSvc.searchParam.companyID=GlobalConstants.userInfo.companyID;
    this.modelSvc.fieldTitle=this.fieldTitle;
    this.getDefaultData();  
    this.initGridOptionIncome();       
    this.initGridOptionExpense();       
    this.initGridOptionProfitLoss();       
  }

  ngAfterViewInit(): void {
    try {
      this.modelSvc.searchFilterForm=this.searchFilterForm.form;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  setBranchProjectConfig(){
    try {
      this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  initGridOptionIncome() {
    try {
      const gridObj = {
        dataSource: "modelSvc.incomeList",
        isDynamicHeader:false,
        paginator:false
      } as GridOption;
      this.gridOptionIncome = new GridOption(this, gridObj);
    } catch (e) {}
  }

  initGridOptionExpense() {
    try {
      const gridObj = {
        dataSource: "modelSvc.expenseList",
        isDynamicHeader:false,
        paginator:false
      } as GridOption;
      this.gridOptionExpense = new GridOption(this, gridObj);
    } catch (e) {}
  }

  initGridOptionProfitLoss() {
    try {
      const gridObj = {
        dataSource: "modelSvc.profitLossList",
        isDynamicHeader:false,
        paginator:false
      } as GridOption;
      this.gridOptionProfitLoss = new GridOption(this, gridObj);
    } catch (e) {}
  }
  
  

   getIncomeStatementReport() {
    try {
      this.populateGrid(this.isRefresh);
    } catch (error) {
      this.showMsg(error);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      const fromDate=this.modelSvc.searchParam.fromDate?new Date(this.modelSvc.searchParam.fromDate):null;
      const toDate=this.modelSvc.searchParam.toDate?new Date(this.modelSvc.searchParam.toDate):null;

      
      if(!fromDate && this.modelSvc.searchParam.dateCustomRange){
        this.showMsg('2266');
        return;
      }

      if(!fromDate && this.modelSvc.searchParam.dateFinYearRange){
        this.showMsg('2283');
        return;
      }

      this.spData.isRefresh = isRefresh;
      this.spData.pageNo = 0;
      
      this.dataSvc.GetIncomeStatementReport(        
        this.spData,
        this.modelSvc.searchParam.companyID,
        this.modelSvc.searchParam.orgID,
        this.modelSvc.searchParam.projectID,
        this.modelSvc.searchParam.dateCustomRange,
        fromDate,
        toDate
      ).subscribe({
        next: (res: any) => {        
          let data=res[res.length - 1] || [];
          this.modelSvc.tempIncomeStatement=GlobalMethods.deepClone(data); 
          this.modelSvc.prepareIncomeStatement(data);
          this.gridOptionIncome.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isRefresh = false;

          if(this.isExport!=null && this.isExport)
            {
              //Merge incomeList and expenseList
              let data=[...this.modelSvc.incomeList,...this.modelSvc.expenseList];
              data.push({
                accountNatureCd:0,
                ledgerName:this.fieldTitle['netprofit&loss'],
                amount:this.modelSvc.profitLossList[0].totalProfitLoss,
                isSubTotal:true
              });
              let reportData = this.prepareVoucherOption(data);
              this.coreAccountingSvc.printReport(reportData);
            }else if(this.isExport!=null && !this.isExport){
              //Merge incomeList and expenseList
              let data=[...this.modelSvc.incomeList,...this.modelSvc.expenseList];
              data.push({
                accountNatureCd:0,
                ledgerName:this.fieldTitle['netprofit&loss'],
                amount:this.modelSvc.profitLossList[0].totalProfitLoss,
                isSubTotal:true
              });
              let reportData = this.prepareVoucherOption(data);
              this.sendEmail(reportData);
            }else{
              
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

  onChangeLedger(){
    try {
      if(this.modelSvc.tempIncomeStatement)
         this.modelSvc.prepareIncomeStatement(this.modelSvc.tempIncomeStatement);
    
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  onChangeFinancialYear(){
    try {
      this.modelSvc.prepareDateRange();
    } catch (error) {
      this.showErrorMsg(error);
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
            //this.modelSvc.financialYearList = [res[1][0]];// || [];

            if(this.modelSvc.financialYearList.length==1){
              this.modelSvc.searchParam.financialYearID=this.modelSvc.financialYearList[0].id;
              this.modelSvc.searchParam.financialYear=this.modelSvc.financialYearList[0].name;
            }

            this.modelSvc.isSkippedControlLedger = res[2];
            this.modelSvc.setNewSearch();           
           
            this.onSelectToCompany();
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  
  onCheckDateAsOn(){
    try {
      this.modelSvc.searchParam.dateCustomRange=!this.modelSvc.searchParam.dateFinYearRange;
      this.modelSvc.searchParam.fromDate=null;
      this.modelSvc.searchParam.toDate=null;
      this.modelSvc.searchParam.financialMaxDate=null;
    } catch (e) {
      this.showErrorMsg(e); 
    }
  }

  onCheckDateRange(){
    try {
      this.modelSvc.searchParam.dateFinYearRange=!this.modelSvc.searchParam.dateCustomRange;
      this.modelSvc.searchParam.financialYearID=null;  
      this.modelSvc.searchParam.financialYear='';
      this.modelSvc.searchParam.financialMaxDate=null;
      this.modelSvc.searchParam.fromDate=new Date(GlobalConstants.serverDate);
      this.modelSvc.searchParam.toDate=new Date(GlobalConstants.serverDate);
    } catch (e) {
      this.showErrorMsg(e); 
    }
  }

  onSelectToCompany() {
      try {
         this.getOrgUnitProjectData();
      } catch (error) {
        this.showErrorMsg(error);
      }
    }

  getOrgUnitProjectData(){
      try {
        this.modelSvc.projectList = [];
        
        this.modelSvc.officeBrachUnitList = [];

        let elementCode='';
              elementCode= FixedIDs.orgType.Branch.toString();
              elementCode+= ','+FixedIDs.orgType.Office.toString();
              elementCode+= ','+FixedIDs.orgType.Unit.toString(); 
            const companyID=this.modelSvc.searchParam.companyID;
             
            forkJoin(
              [
                this.orgSvc.getOrgStructure(elementCode,companyID),
                this.coreAccountingSvc.getProject(companyID),
              ]
             ).subscribe({
                 next: (res: any) => {
                  this.modelSvc.officeBrachUnitRawList=res[0];
                  this.modelSvc.prepareOrgList(res[0]);     
                  this.modelSvc.projectList = res[1] || [];   
                 },
                 error: (res: any) => {
                   this.showErrorMsg(res);
                 },
               });
      } catch (error) {
        this.showErrorMsg(error);
      }
    }
  
  searchData(form: NgForm,isExport?:boolean){
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.searchFilterForm.form);
        return;
      }
      if(!this.modelSvc.searchParam.orgID)
        this.modelSvc.searchParam.orgName=null;

      if(!this.modelSvc.searchParam.projectID)
        this.modelSvc.searchParam.projectName=null;
      
     this.isRefresh=true;
     this.isExport=isExport;
     this.getIncomeStatementReport();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

   resetSearchParam(form: NgForm) {
     try {
      this.modelSvc.setNewSearch();      
      this.getOrgUnitProjectData();
      this.modelSvc.totalExpense=0;
      this.modelSvc.totalIncome=0;
     } catch (error) {
      this.showErrorMsg(error);
     }
    }
    onChangeOrg(searchParam){
      try {
        if(!searchParam.orgID){
          this.resetDataOnChange();
        }
      } catch (error) {
        this.showErrorMsg(error);
      }
    }
    onChangeProject(searchParam){
      try {
        if(!searchParam.projectID){
          this.resetDataOnChange();
        }
      } catch (error) {
        this.showErrorMsg(error);
      }
    }

    resetDataOnChange(){
          this.modelSvc.prepareIncomeReportsList([]);
          this.modelSvc.prepareExpenseReportsList([]);
          this.modelSvc.profitLossList=[];
          this.modelSvc.profitLossList.push({totalProfitLoss:0});
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
/*********************Print*************************/
private prepareVoucherOption(data: any[]) {
  try {
    const params=this.modelSvc.getRptParameter();
    return{
      reportName: this.modelSvc.searchParam.resultType==2?'IncomeStatementLShape':'IncomeStatementTShape',
      reportType: FixedIDs.reportRenderingType.PDF,
      userID: GlobalMethods.timeTick(),
      data: data,
      params: params,
      dataColumns: this.modelSvc.getColumnHeader(),
      dataSetName: "SpACM_RptIncomeStatement",
    };
  } catch (e) {
    throw e;
  }
}
}