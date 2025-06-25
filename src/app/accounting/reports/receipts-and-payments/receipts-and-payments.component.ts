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
  ColumnType
} from '../../index';
import { receiptsAndPaymentsValidation } from '../../models/report/report.model';
import { ReceiptsAndPaymentsModelService } from '../../services/accounting-report/receipts-and-payment/receipts-and-payment-model.service';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-receipts-and-payments',
  templateUrl: './receipts-and-payments.component.html',
  providers: [AccountingReportDataService, ReceiptsAndPaymentsModelService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class ReceiptsAndPaymentsComponent extends BaseComponent implements OnInit {
  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("searchFilterForm", { static: true, read: NgForm }) searchFilterForm: NgForm;
  isExport:boolean = false;
  spData: any = new QueryData({pageNo:0});
  searchParam:any = {};
  ref: DynamicDialogRef;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;

  gridOptionOpeing: GridOption;
  gridOptionRecceipt: GridOption;
  gridOptionPayment: GridOption;
  gridOptionClosing: GridOption;

  openingDataList:any = [];
  receiptDataList:any = [];
  paymentDataList:any = [];
  closingDataList:any = [];

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ReceiptsAndPaymentsModelService,
    public modalService: ModalService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    private rptService: AccountingReportDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = receiptsAndPaymentsValidation();
  }
  ngOnInit(): void {
    try {
      this.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
      this.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
      this.initGridOptionOpening();
      this.initGridOptionRecceipt();
      this.initGridOptionPayment();
      this.initGridOptionClosing();
      this.getDefaultData();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOptionOpening() {
    try {
      const gridObj = {
        dataSource: "openingDataList",
        isDynamicHeader:false,
        isClear: false,
        paginator:false,
      } as GridOption;
      this.gridOptionOpeing = new GridOption(this, gridObj);
    } catch (e) {
    }
  }
  initGridOptionRecceipt() {
    try {
      const gridObj = {
        dataSource: "receiptDataList",
        isDynamicHeader:false,
        isClear: false,
        paginator:false,
      } as GridOption;
      this.gridOptionRecceipt = new GridOption(this, gridObj);
    } catch (e) {
    }
  }
  
  initGridOptionPayment() {
    try {
      const gridObj = {
        dataSource: "paymentDataList",
        isDynamicHeader:false,
        isClear: false,
        paginator:false,
      } as GridOption;
      this.gridOptionPayment = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

  initGridOptionClosing() {
    try {
      const gridObj = {
        dataSource: "closingDataList",
        isDynamicHeader:false,
        isClear: false,
        paginator:false,
      } as GridOption;
      this.gridOptionClosing = new GridOption(this, gridObj);
    } catch (e) {
    }
  }

   getDefaultData(){
      try {
        forkJoin([
          this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString())
        ]).subscribe({
            next: (res: any) => {
              this.modelSvc.companyList = res[0] || [];
              //this.modelSvc.companyList = [this.modelSvc.companyList[0]];
              this.setNewSearch();
              if(this.modelSvc.companyList.length == 1)
              {
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
  onChangeCompany(){
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
          complete: () => {},
        });
      } catch (error) {
        this.showErrorMsg(error);
      }
    }
  onSubmit(form: NgForm, isExport:boolean) {
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.searchFilterForm.form);
        return;
      }
      this.isExport = isExport;
      this.getReceiptsAndPayments();
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }
  
  search(form: NgForm){
    try {
      if (form.invalid) {
        this.directive.validateAllFormFields(this.searchFilterForm.form);
        return;
      }
      let isAcrualBasis = false;
      if( this.searchParam.resultType == '1')
      {
        isAcrualBasis = true;
      }

      this.rptService.getReceiptsAndPayments(this.spData, this.searchParam.companyID, this.searchParam.fromDate, this.searchParam.toDate, isAcrualBasis, this.searchParam.orgID, this.searchParam.projectID).subscribe({
        next: (data: any) => {
          this.searchParam.companyShortAddress = null;
          if(data.length > 0)
          {
            this.searchParam.companyShortAddress = data[0].companyShortAddress;
          }
          let prepareDataList = this.modelSvc.prepareData(data);
          this.openingDataList = prepareDataList.filter(x=>x.particularType == 1);
          this.receiptDataList = prepareDataList.filter(x=>x.particularType == 2);
          this.paymentDataList = prepareDataList.filter(x=>x.particularType == 3);
          this.closingDataList = prepareDataList.filter(x=>x.particularType == 4);

        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getReceiptsAndPayments() {
    try {

      let isAcrualBasis = false;
      if( this.searchParam.resultType == '1')
      {
        isAcrualBasis = true;
      }

      this.rptService.getReceiptsAndPayments(this.spData, this.searchParam.companyID, this.searchParam.fromDate, this.searchParam.toDate, isAcrualBasis, this.searchParam.orgID, this.searchParam.projectID).subscribe({
        next: (data: any) => {
          this.searchParam.companyShortAddress = null;
          if(data.length > 0)
          {
            this.searchParam.companyShortAddress = data[0].companyShortAddress;
          }
          let prepareDataList = this.modelSvc.prepareData(data);
          let reportData = this.prepareVoucherOption(prepareDataList);
          if(this.isExport)
          {
            this.coreAccountingSvc.printReport(reportData);
          }
          else{
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
      this.setNewSearch();
      this.openingDataList = [];
      this.receiptDataList = [];
      this.paymentDataList = [];
      this.closingDataList = [];
      setTimeout(() => {
        this.formResetByDefaultValue(this.searchFilterForm.form, this.searchParam);
      }, 0);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNewSearch(){

    let currentDate = new Date(GlobalConstants.serverDate);

    this.searchParam = {
      companyID : GlobalConstants.userInfo.companyID,
      company: GlobalConstants.userInfo.company,
      orgID:null,
      unitBranch: null,
      projectID:null,
      project:null,
      dateRange:null,
      resultType:"1",
      fromDate:currentDate,
      toDate:currentDate
    }
  }

  /*********************Print*************************/
  private prepareVoucherOption(data: any[]) {
    try {
      return{
        reportName: 'ReceiptsAndPayments',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.getRptParameter(),
        dataColumns: this.getVoucherColumnHeader(),
        dataSetName: "SpACM_GetReceiptsAndPayments",
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
          value: this.fieldTitle['receipts&payments']
        }
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }
  private getVoucherColumnHeader() {
    try {
      var columns = [
        { key: 'Ledger', value: 'Ledger' },
        { key: 'Balance', value: 'Balance' }
      ];
      return columns;
    } catch (e) {
      throw e;
    }
  }


}
