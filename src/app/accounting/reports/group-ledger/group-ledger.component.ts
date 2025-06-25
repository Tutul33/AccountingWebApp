import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, FixedIDs, GlobalConstants, GlobalMethods, ProviderService, QueryData, ValidatorDirective } from 'src/app/app-shared';
import { GridOption } from 'src/app/shared/models/common.model';
import { CoreAccountingService } from 'src/app/app-shared/services/coreAccounting.service';
import { AccountingReportDataService } from '../../services/accounting-report/accounting-report-data.service';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { OrgService } from 'src/app/app-shared/services/org.service';
import { GroupLedgerModelService } from '../../services/accounting-report/group-ledger/group-ledger-model.service';
import { COADataService } from '../../services/coa/coa-data.service';
import { EmailSendComponent } from 'src/app/shared/components/email-send/email-send.component';
import { groupLedgerValidation } from '../../models/report/report.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-group-ledger',
  templateUrl: './group-ledger.component.html',
  providers: [AccountingReportDataService, GroupLedgerModelService, COADataService],
  standalone:true,
  imports:[SharedModule]
})
export class GroupLedgerRptComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("ledgerReportForm", { static: true, read: NgForm }) ledgerReportForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  isSPParamChange: boolean = false;
  spData: any = new QueryData();
  isControlLegerHide: boolean;
  node: any;
  isPlaceholderDisableCompany: boolean = false;

  constructor(
    public modelSvc: GroupLedgerModelService,
    protected providerSvc: ProviderService,
    private dataSvc: AccountingReportDataService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    private coaSvc: COADataService,

  ) {
    super(providerSvc);
    this.validationMsgObj = groupLedgerValidation();
  }

  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.keyValuePair = GlobalMethods.createKeyValuePair;
    this.initGridOption();
    this.getDefaultData();
   
  }
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.groupLedgerList",
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
          title: this.fieldTitle['groupledger']
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
      { field: "debitVal", header: this.fieldTitle["debitbalance(bdt)"], styleClass:'d-center' },
      { field: "creditVal", header: this.fieldTitle["creditbalance(bdt)"], styleClass:'d-center' },
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

    onExportData(event: any)
    {
      try {
        if (!this.ledgerReportForm.form.valid) {
          return;
        }
        else if(this.modelSvc.searchParam.groupLedgerID == null)
        {
          this.showMsg("Please select Group Ledger Name!");
          return;
        }
        //event.exportOption.title =this.fieldTitle['groupledger'] + "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en") + "_" + this.modelSvc.searchParam.companyName;
  
        event.exportOption.title =this.fieldTitle['groupledger'];
        let spData = GlobalMethods.jsonDeepCopy(this.spData);
        spData.pageNo = 0;
  
        return this.dataSvc.getGroupLedgerReport(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID,this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.groupLedgerID).pipe(
          map((response: any) => {
            let list = response[response.length - 1];
            list.forEach(element => {
              if (element.debitVal != null) {
                element.debitVal = Number(element.debitVal).toFixed(2);
              }
              if (element.creditVal != null) {
                element.creditVal = Number(element.creditVal).toFixed(2);
              }
            });
            return {values: list, columns: this.GridColumns()}
          })
        );
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
          this.onChangeCompany();
          this.getGroupLedgerRptList();
          this.getIsControlLedgerHide();

          if(this.modelSvc.companyList.length == 1) {
            this.isPlaceholderDisableCompany = true;
          }
          else
          {
            this.isPlaceholderDisableCompany = false;
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

  onChangeSPParameterData() {
    try {
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

  onChangeCompany() {
    try {
      this.onChangeSPParameterData();
 
      let elementCode = FixedIDs.orgType.Office.toString() + ',' + FixedIDs.orgType.Branch.toString() + ',' + FixedIDs.orgType.Unit.toString();
      forkJoin([
        this.orgSvc.getOrgStructure(elementCode, this.modelSvc.searchParam.companyID),
        this.coreAccountingSvc.getProject(this.modelSvc.searchParam.companyID)
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


  search(){
    try {
      if (!this.ledgerReportForm.form.valid) {
        return;
      }
      else if(this.modelSvc.searchParam.groupLedgerID == null)
      {
        this.showMsg("Please select Group Ledger Name!");
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
      this.dataSvc.getGroupLedgerReport(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.groupLedgerID).subscribe({
        next: (res: any) => {
          this.modelSvc.groupLedgerList = res[res.length - 1] || [];
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.isSPParamChange = false;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { 
          this.spData.isRefresh = false;
          this.isSPParamChange = false;
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset(){
    try {
      this.modelSvc.setNewSearchParam();
      this.onChangeSPParameterData();
      this.onChangeCompany();
      this.modelSvc.groupLedgerList = [];
      this.gridOption.totalRecords = 0;
      this.formResetByDefaultValue(this.ledgerReportForm.form, this.modelSvc.searchParam);
      this.ledgerReportForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  getGroupLedgerRptList() {
    try {
      this.spData = new QueryData({
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'groupLedgerRpt',
        pageNo: 1
      });
    } catch (error) {
      this.showMsg(error);
    }
  }

  getIsControlLedgerHide() {
    try {
      this.spData.pageNo = 0;
      this.coaSvc.getIsControlLedgerHide(this.spData).subscribe({
        next: (res: any) => {
          let result = res[res.length - 1] || [];

          if (result.length > 0) {
            this.getCOATreeList(1);
            this.isControlLegerHide = true;
          } else {
            this.getCOATreeList(0);
            this.isControlLegerHide = false;
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getCOATreeList(isHide: number) {
    try {
      this.spData.pageNo = 0;
      this.coaSvc.getCOATreeList(this.spData, isHide).subscribe({
        next: (res: any) => {

          let data = res[res.length - 1] || [];
          let dropdownData = data.filter(x => x.cOALevelCode != FixedIDs.AccountHeadLevel.Ledger);

          this.modelSvc.commonDropDownList = dropdownData;
         
          this.modelSvc.tempServerDataList = dropdownData;

          this.modelSvc.serverDataList = this.modelSvc.mapObjectProps(dropdownData);
          this.modelSvc.treeDataList = this.modelSvc.prepareTreeData(this.modelSvc.serverDataList, null);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onNodeClick(node: any) {
    try {
      this.modelSvc.prepareTreeNodeLevel(node);
      //this.ledgerReportForm.form.markAsDirty();
      this.modelSvc.searchParam.groupLedgerID = node.id;
      this.modelSvc.searchParam.groupLedgerName = node.label;
      this.onChangeSPParameterData();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  /*********************Print and mail*************************/
  onExport(isExport: boolean) {
    try {
      if (!this.ledgerReportForm.form.valid) {
        return;
      }
      else if(this.modelSvc.searchParam.groupLedgerID == null)
      {
        this.showMsg("Please select Group Ledger Name!");
        return;
      }

      let spData = GlobalMethods.jsonDeepCopy(this.spData);
      spData.pageNo = 0;
      this.dataSvc.getGroupLedgerReport(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.orgID, this.modelSvc.searchParam.projectID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.groupLedgerID).subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          let reportData = this.prepareReportOption(data);
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
        reportName: 'GroupLedger',
        reportType: FixedIDs.reportRenderingType.PDF,
        userID: GlobalMethods.timeTick(),
        data: data,
        params: this.modelSvc.getRptParameter(),
        dataColumns: this.modelSvc.getColumnHeader(),
        dataSetName: "SpACM_RptGroupLedger",
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
