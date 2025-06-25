import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountingReportDataService, BaseComponent, FixedIDs, GlobalConstants, GlobalMethods, GridOption, ProviderService, QueryData, TrialBalanceModelService, ValidatingObjectFormat, ValidatorDirective } from '../../index';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { forkJoin } from 'rxjs';
import { NgForm } from '@angular/forms';
import { trialBalanceValidation } from '../../models/report/report.model';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-trial-balance',
  templateUrl: './trial-balance.component.html',
  providers:[TrialBalanceModelService,AccountingReportDataService],
  standalone:true,
  imports:[SharedModule]
})
export class TrialBalanceComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("searchFilterForm", { static: true, read: NgForm }) searchFilterForm: NgForm;
  gridOption: GridOption;
  spData: any = new QueryData();
  isRefresh:boolean=false;
  isExport:boolean=false;
  isMail:boolean=false;
  
  constructor(protected providerSvc: ProviderService,
      public modelSvc: TrialBalanceModelService,
      public dataSvc: AccountingReportDataService,
      private orgSvc: OrgService,
      private coreAccountingSvc: CoreAccountingService){
    super(providerSvc);
    this.validationMsgObj = trialBalanceValidation();
  }
  ngOnInit(): void {
    this.setBranchProjectConfig();
    this.modelSvc.searchParam.companyID=GlobalConstants.userInfo.companyID;
    this.getOrgUnitProjectData();
    this.getDefaultData();
    this.setDefaultDateRange();    
    this.initGridOption();    
    this.modelSvc.setDefaultTrialBalance();   
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.trialBalanceList",
        isDynamicHeader:false,
        paginator:false
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {}
  }

  setBranchProjectConfig(){
    try {
      this.modelSvc.isProjectModuleActive= GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.modelSvc.isBranchModuleActive= GlobalConstants.bizConfigInfo.isBranchModuleActive;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  setDefaultDateRange() {
    try {  
    this.modelSvc.searchParam.fromDate=new Date(GlobalConstants.serverDate);
    this.modelSvc.searchParam.toDate=new Date(GlobalConstants.serverDate);     
    } catch (error) {
     this.showErrorMsg(error);
    }
   }

   getTrialBalanceReport() {
    try {
      this.populateGrid(this.isRefresh);
    } catch (error) {
      this.showMsg(error);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      const fromDate=this.modelSvc.searchParam.fromDate? new Date(this.modelSvc.searchParam.fromDate) : null;
      const toDate=this.modelSvc.searchParam.toDate? new Date(this.modelSvc.searchParam.toDate) : null;
      if(!fromDate){
        this.showMsg('2266');
        return;
      }
      this.spData.isRefresh = isRefresh;
      this.spData.pageNo = 0;
      
      this.dataSvc.GetTrialBalanceReport(        
        this.spData,
        this.modelSvc.searchParam.companyID,
        this.modelSvc.searchParam.orgID,
        this.modelSvc.searchParam.projectID,
        fromDate,
        toDate
      ).subscribe({
        next: (res: any) => {        
          let data=res[res.length - 1] || [];
          this.modelSvc.tempTrialBalance=GlobalMethods.deepClone(data); 
          this.modelSvc.prepareTrialBalanceReportsList(data);
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isRefresh = false;

          if(this.isExport!=null && this.isExport)
            {
              let reportData = this.prepareVoucherOption(this.modelSvc.trialBalanceList);
              this.coreAccountingSvc.printReport(reportData);
            }
           else if(this.isExport!=null && !this.isExport){
            let reportData = this.prepareVoucherOption(this.modelSvc.trialBalanceList);
            this.sendEmail(reportData);
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
    } catch (error) {
      this.showErrorMsg(error);
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

      if(this.modelSvc.tempTrialBalance)
         this.modelSvc.prepareTrialBalanceReportsList(this.modelSvc.tempTrialBalance);
    
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getDefaultData() {
      try {
        
        forkJoin([
          this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
          this.coreAccountingSvc.getIsSkippedControlLedger()
        ]).subscribe({
            next: (res: any) => {
              this.modelSvc.companyList = res[0] || [];
              this.modelSvc.isSkippedControlLedger = res[1];
              this.modelSvc.setNewSearch();            
              this.setDefaultDateRange();  
              this.onSelectToCompany();
            },
            error: (res: any) => {
              this.showErrorMsg(res);
            },
          });
        this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString(), '').subscribe({
          next: (res: any) => {
            this.modelSvc.companyList = res || [];  
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
            this.modelSvc.searchParam.company=this.modelSvc.companyList.find(x=>x.id==companyID)?.name;
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
     this.isExport=isExport;
     this.isRefresh=true;
     this.getTrialBalanceReport();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

   resetSearchParam() {
     try {
      this.modelSvc.setNewSearch();
      this.setDefaultDateRange();
      this.getOrgUnitProjectData();
      this.modelSvc.trialBalanceList=[];
      this.modelSvc.setDefaultTrialBalance();
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

    /*********************Print*************************/
  private prepareVoucherOption(data: any[]) {
    try {
      return{
        reportName: 'TrialBalance',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "SpACM_RptTrialBalance",
      };
    } catch (e) {
      throw e;
    }
  }
}
