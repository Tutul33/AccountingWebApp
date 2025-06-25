import { Component, OnInit, ViewChild } from "@angular/core";
import { formatDate } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColumnType, GridOption } from 'src/app/shared/models/common.model';
import { FixedIDs, GlobalConstants, GlobalMethods, ValidatorDirective } from '../../../../shared';
import { map, forkJoin } from 'rxjs';
import { NgForm } from "@angular/forms";
import { ModalConfig } from 'src/app/app-shared';

import {
  ProviderService,
  BaseComponent,
  QueryData,
  NiMultipleFileViewComponent,
  CreditReceiptVoucherModelService
} from '../../../index';
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { OrgService } from "src/app/app-shared/services/org.service";
import { VoucherRemarksComponent } from "../../voucher-remarks/voucher-remarks.component";
import { MenuService } from 'src/app/shared/services/menu.service';
import { EmailSendComponent } from "src/app/shared/components/email-send/email-send.component";
import { VoucherNotificationLogDTO } from "src/app/accounting/models/voucher-notification-log/voucher-notification-log";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-credit-receipt-voucher-list',
  templateUrl: './credit-receipt-voucher-list.component.html',
  providers: [CreditReceiptVoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class CreditReceiptVoucherListComponent extends BaseComponent implements OnInit {
  
  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("voucherListForm", { static: true, read: NgForm }) voucherListForm: NgForm;
  public validationMsgObj: any;
  gridOption: GridOption;
  ref: DynamicDialogRef;
  spData: any = new QueryData();
  financialYearStatus: any = FixedIDs.FinancialYearStatus;
  approvalStatus: any = FixedIDs.ApprovalStatus;
  
  minDate: Date = null;
  maxDate = null;
  globalSearchParams = [];
  gridSearchParams = [];
  formSearchParams = [];
  isSPParamChange: boolean = false;
  userId: any;

  isPlaceholderDisableCompany: boolean = false;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CreditReceiptVoucherModelService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    private commonSvc: CoreAccountingService,
    private coreAccountingSvc: CoreAccountingService,
    private menuService: MenuService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.userId = GlobalConstants.userInfo.userPKID;
    this.modelSvc.keyValuePair = GlobalMethods.createKeyValuePair;
    this.modelSvc.setFileViewOption();
    this.initGridOption();
    this.getDefaultData();
  }

  getDefaultData() {
    try {
      forkJoin([
        this.orgSvc.getOrgStructure(FixedIDs.orgType.Company.toString()),
        this.coreAccountingSvc.getCOAStructure(),
        this.coreAccountingSvc.getSubLedgerType(),
        this.coreAccountingSvc.getSubLedgerDetail(),
        this.coreAccountingSvc.getTransactionMode(),
      ]).subscribe({
          next: (res: any) => {
            this.modelSvc.companyList = res[0] || [];
            this.modelSvc.tempLedgerList = res[1] || [];
            this.modelSvc.subLedgerTypeList = res[2] || [];
             //this.modelSvc.subLedgerList = res[3] || [];
             this.modelSvc.tempSubLedgerList = res[3] || [];
            this.modelSvc.transactionModeList = res[4] || [];

            this.modelSvc.setNewSearchParam();
            this.modelSvc.prepareLedgerList();
            this.onChangeCompany();
            this.getcreditPaymentVourcherList();

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
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeCompany(){
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
        complete: () => {},
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
   }

   onChangeSubLedgerType() {
    try {
      let modifiedSubLedgerList = [];
      this.modelSvc.subLedgerList = [];

      const toSubLedgerTypeList = this.modelSvc.searchParam.toSubLedgerTypeID.split(',');

      toSubLedgerTypeList.forEach(toSubLedgerTypeID => {
        const filteredData = this.modelSvc.tempSubLedgerList.filter(row => 
          row.subLedgerTypeID.toString() === toSubLedgerTypeID
        );
        modifiedSubLedgerList.push(...filteredData);
      });

      
      this.modelSvc.subLedgerList = GlobalMethods.jsonDeepCopy(modifiedSubLedgerList);

    } catch (error) {
        this.showErrorMsg(error);
    }
  }


  getcreditPaymentVourcherList() {
    try {
      let _ddlProperties = this.prepareDDLProperties();

      this.spData = new QueryData({
        ddlProperties: _ddlProperties,
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'creditPaymentVoucherListComponent',
        pageNo: 1,
    });

    this.populateGrid(true);
    } catch (error) {
      this.showMsg(error);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      this.spData.isRefresh = isRefresh;
      this.commonSvc.getVoucherList(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate,  this.modelSvc.searchParam.voucherTypeCD, null, null, this.userId).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindDataDDLPropertiesData(res);
          this.modelSvc.creditPaymentVourcherList = this.modelSvc.prepareVoucherList(res[res.length - 1] || []);
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

  prepareDDLProperties() {
    try {
      var ddlProperties = [];
      ddlProperties.push("ToCOAStructID, ToLedger");
      ddlProperties.push("ToSubLedgerTypeID, ToSubLedgerType");
      ddlProperties.push("ToSubLedgerDetailID, ToSubLedgerDetail");
      ddlProperties.push("DebitVal, DebitVal");
      ddlProperties.push("CreditVal, CreditVal");
      ddlProperties.push("CreatedByID, CreatedBy");
      ddlProperties.push("EditUserID, EditedBy");
      ddlProperties.push("InvoiceBillRefNo, InvoiceBillRefNo");
      ddlProperties.push("DraftStatus, DraftStatus");
      ddlProperties.push("ChequeNo, ChequeNo");
      ddlProperties.push("ChequeDate, ChequeDate");
    return ddlProperties;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  bindDataDDLPropertiesData(data: any) {
    try {
      this.modelSvc.gridLedgerList = data[0];
      this.modelSvc.gridSubLedgerTypeList = data[1];
      this.modelSvc.gridSubledgerDetailList = data[2];
      this.modelSvc.gridDebitList = data[3].filter(f => f.DebitVal != 0);
      this.modelSvc.gridCreidList = data[4].filter(f => f.CreditVal != 0);
      this.modelSvc.gridCreatedByList = data[5];
      this.modelSvc.gridModifiedByList = data[6];
      this.modelSvc.gridInvBillList = data[7];
      this.modelSvc.gridDraftStatusLlist = data[8];
      this.modelSvc.gridChequeNoList = data[9];
      this.modelSvc.gridChequeIssueDateList = data[10];

      this.gridOption.columns = this.gridColumns();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  setDateRange(){
    try {
      this.modelSvc.searchParam.toDate = this.modelSvc.searchParam.fromDate;
      this.maxDate = null;
      if(this.modelSvc.searchParam.fromDate)
      {
        let date = new Date(this.modelSvc.searchParam.fromDate);
        date.setDate(date.getDate()+365);
        this.maxDate = date;
      }
    } catch (e) {
      throw e;
    }
  }

  onChangeFromDate() {
    try {
      //this.setDateRange();
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

  onChangeSPParameterData() {
    try {
      this.isSPParamChange = true;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.creditPaymentVourcherList",
        columns: this.gridColumns(),
        getServerData: this.onPage,
        refreshEvent: this.refreshEventHandler,
        filterFromServer: this.filterFromServer,
        lazy: true,
        isGlobalSearch: false,
        isClear: true,
        exportOption: {
          exportInXL: true,
          exportDataEvent: this.getDataToExport,
          title: ''
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "company", header: this.fieldTitle['company'] },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "officeBranch", header: this.fieldTitle['unit/branch'] }] : []),
      ...(this.modelSvc.isProjectModuleActive ? [{ field: "projectName", header: this.fieldTitle['project'] }] : []),
      // { field: "officeBranch", header: this.fieldTitle['unit/branch'] },
      // { field: "projectName", header: this.fieldTitle['project'] },
      { field: "voucherNo", header: this.fieldTitle['vouchernumber'] },
      { field: "voucherDate", header: this.fieldTitle['date'] },
      { field: "fromLedger", header: this.fieldTitle['fromaccountname'] },
      { field: "fromSubLedgerType", header: this.fieldTitle['subledgertype'] },
      { field: "fromSubLedgerDetail", header: this.fieldTitle['subledgername'] },
      { field: "toLedger", header: this.fieldTitle['toaccountname'], isDDFilter: true, dataList: this.modelSvc.gridLedgerList, labelField: 'ToLedger' },
      { field: "toSubLedgerType", header: this.fieldTitle['subledgertype'], isDDFilter: true, dataList: this.modelSvc.gridSubLedgerTypeList, labelField: 'ToSubLedgerType' },
      { field: "toSubLedgerDetail", header: this.fieldTitle['subledgername'], isMultiselectFilter:true, dataList: this.modelSvc.gridSubledgerDetailList, labelField: 'ToSubLedgerDetail' },
      // { field: "chequeNo", header: this.fieldTitle['chequeno'] },
      // { field: "chequeDate", header: this.fieldTitle['chequedate'] },
      { field: "chequeNo", header: this.fieldTitle['chequeno'], isDDFilter: true, dataList: this.modelSvc.gridChequeNoList, labelField: 'ChequeNo' },
      { field: "chequeDate", header: this.fieldTitle['chequedate'], isDDFilter: true, dataList: this.modelSvc.gridChequeIssueDateList, labelField: 'ChequeDate' },
      { field: "description", header: this.fieldTitle['description'] },
      { field: "debitVal", header: this.fieldTitle['debitamount(bdt)'], isDDFilter: true, dataList: this.modelSvc.gridDebitList, labelField: 'DebitVal' },
      { field: "creditVal", header: this.fieldTitle['creditamount(bdt)'], isDDFilter: true, dataList: this.modelSvc.gridCreidList, labelField: 'CreditVal' },
      { field: "invoiceBillRefNo", header: this.fieldTitle['invoicebillrefno'], isDDFilter:true, dataList: this.modelSvc.gridInvBillList, labelField: 'InvoiceBillRefNo' },
      { field: "createdDate", header: this.fieldTitle['createddate&time'] },
      { field: "createdBy", header: this.fieldTitle['createdby'], isDDFilter: true, dataList: this.modelSvc.gridCreatedByList, labelField: 'CreatedBy' },
      { field: "lastUpdate", header: this.fieldTitle['lastmodified'] },
      { field: "editedBy", header: this.fieldTitle['modifiedby'], isDDFilter: true, dataList: this.modelSvc.gridModifiedByList, labelField: 'EditedBy' },
      { field: "draftStatus", header: this.fieldTitle['status'], isDDFilter: true, dataList: this.modelSvc.gridDraftStatusLlist, labelField: 'DraftStatus' },
      { header: this.fieldTitle['email'], styleClass:'d-center' },
      { header: this.fieldTitle['ref.doc'], styleClass:'d-center' },
      { header: this.fieldTitle['action'] }
    ]
  }
  
  getDataToExport(event: any)
  {
    try {
      event.exportOption.title =this.fieldTitle['credit/receivedvoucherlist'] + "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en") + "_" + this.modelSvc.searchParam.companyName;

      let spData = GlobalMethods.jsonDeepCopy(this.spData);
      spData.pageNo = 0;

      return this.commonSvc.getVoucherList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, this.modelSvc.searchParam.voucherTypeCD, null, null, this.userId).pipe(
        map((response: any) => {
          return {values: response[response.length - 1], columns: this.prepareReportHeaderList()}
        })
      );
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  prepareReportHeaderList() {
    let gridColumnsList = [
      { field: "company", header: this.fieldTitle['company'] },
      ...(this.modelSvc.isBranchModuleActive ? [{ field: "officeBranch", header: this.fieldTitle['unit/branch'] }] : []),
      ...(this.modelSvc.isProjectModuleActive ? [{ field: "projectName", header: this.fieldTitle['project'] }] : []),
      // { field: "officeBranch", header: this.fieldTitle['unit/branch'] },
      // { field: "projectName", header: this.fieldTitle['project'] },
      { field: "voucherNo", header: this.fieldTitle['vouchernumber'] },
      { field: "voucherDate", header: this.fieldTitle['date'] },
      { field: "fromLedger", header: this.fieldTitle['fromaccountname'] },
      { field: "fromSubLedgerType", header: this.fieldTitle['subledgertype'] },
      { field: "fromSubLedgerDetail", header: this.fieldTitle['subledgername'] },
      { field: "toLedger", header: this.fieldTitle['toaccountname'] },
      { field: "toSubLedgerType", header: this.fieldTitle['subledgertype'] },
      { field: "toSubLedgerDetail", header: this.fieldTitle['subledgername'] },
      { field: "chequeNo", header: this.fieldTitle['chequeno'] },
      { field: "chequeDate", header: this.fieldTitle['chequedate'] },
      { field: "description", header: this.fieldTitle['description'] },
      { field: "debitVal", header: this.fieldTitle['debitamount(bdt)'] },
      { field: "creditVal", header: this.fieldTitle['creditamount(bdt)'] },
      { field: "invoiceBillRefNo", header: this.fieldTitle['invoicebillrefno'] },
      { field: "createdDate", header: this.fieldTitle['createddate&time'] },
      { field: "createdBy", header: this.fieldTitle['createdby'] },
      { field: "lastUpdate", header: this.fieldTitle['lastmodified'] },
      { field: "editedBy", header: this.fieldTitle['modifiedby'] },
      { field: "draftStatus", header: this.fieldTitle['status'] },
    ];
    return gridColumnsList;
  }



  onPage(event: any, isRefresh: boolean = false) {
    try {
      this.spData.pageNo = this.gridOption.serverPageNumber(event);
      this.spData.pageDataCount = event.rows;
      this.populateGrid(isRefresh);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  refreshEventHandler(isRefresh: boolean = true) {
    try {
      this.spData.pageNo = this.gridOption.resetPageNumber(this.gridOption.first);
      this.populateGrid(isRefresh);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  filterFromServer(event: any, filters: any[]) {
    try {
      this.modelSvc.prepareFilterValue(filters);
      this.spData.searchParams = this.modelSvc.prepareSearchParams();
      this.spData.pageNo = 1;
      this.populateGrid(false);
      this.pageReset(0);
  
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  pageReset(pageNumber: number) {
    try {
      this.gridOption.first = pageNumber;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  edit(entity: any) {
    try {
      let companyID = entity.companyID;
      let orgID = entity.orgID;
      this.coreAccountingSvc.getVoucherEntryEditPeriod(companyID, orgID).subscribe({
        next: (res: any) => {
          this.modelSvc.lockVoucherEditList = res[res.length - 1] || [];

          this.prepareDataForEdit(entity, companyID);
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

  prepareDataForEdit(entity: any, companyID: any) {
    try {
      let lockEditTillDate;
      if(this.modelSvc.lockVoucherEditList.length == 1)
      {
        lockEditTillDate = this.modelSvc.lockVoucherEditList[0].lockEditTillDate;

      }
      else if(this.modelSvc.lockVoucherEditList.length > 1)
      {
        let data = this.modelSvc.lockVoucherEditList.find(x => x.orgID == null);
        if(data != null)
        {
          lockEditTillDate = this.modelSvc.lockVoucherEditList.find(x => x.companyID = companyID && x.orgID == null).lockEditTillDate;
        }
        else
        {
          lockEditTillDate = null;
        }
      }
      else 
      {
        lockEditTillDate = null;
      }

      if(lockEditTillDate != null)
      {
        let voucherDate = new Date(entity.voucherDate);
        lockEditTillDate = new Date(lockEditTillDate);

        if (voucherDate <= lockEditTillDate) {
          this.showMsg("2260");

          return;
        } 
      }


      // Send data to entry page for edit
      this.dataTransferSvc.broadcast('voucherID', entity.id);
      let navigateUrl = '/ACC-PAGE/credit-receipt-voucher-entry';
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  delete(entity: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.commonSvc.delete(entity.id,entity.voucherItemID).subscribe({
              next: (res: any) => { 
                this.showMsg(this.messageCode.deleteCode);
                this.populateGrid(true);
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
          }
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  search(){
    try {
      if(this.modelSvc.searchParam.voucherNo != null)
      {
        let voucherNo = this.modelSvc.searchParam.voucherNo.trim();
        this.modelSvc.searchParam.voucherNo = voucherNo;
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

  reset(formGroup: NgForm){
    try {
      this.modelSvc.subLedgerList = [];
      this.onChangeSPParameterData();
      this.modelSvc.setNewSearchParam();
      formGroup.form.markAsPristine();
      this.search();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  viewDoc(entity: any) {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = this.fieldTitle['documents'];
      modalConfig.width = '';
      modalConfig.contentStyle = {};
      modalConfig.data = {
        fileOption: this.modelSvc.fileUploadOption,
        fileIDs: entity.voucherItemAttachmentIDs
      };

      this.ref = this.dialogSvc.open(NiMultipleFileViewComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  viewRemarks(remarksMessage: any, voucherNo: any) {
    try {
      const modalConfig = new ModalConfig();
      const obj = {
        remarksMessage: remarksMessage,
        voucherNo: voucherNo
      };

      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['remarks'];
      this.ref = this.dialogService.open(VoucherRemarksComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        if (data) {

        }
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  printVoucher(entity: any) {
    try {
      this.coreAccountingSvc.printVoucher(entity.voucherTypeCd, entity.id);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  sendEmail(entity: any){
    try {
      this.coreAccountingSvc.getVoucherReportFileName(entity.voucherTypeCd, entity.id).subscribe({
        next: (res: any) => {
          this.showEmailModal(entity, res);
        },
        error: (e: any) => {
          this.showErrorMsg(e);
         }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  showEmailModal(entity:any, reportName:string){
    try {
      let obj = {
        attachmentName: [],
        moduleName: GlobalConstants.ERP_MODULES.ACM.name,
      };
      obj.attachmentName.push(reportName);


      const ref = this.dialogService.open(EmailSendComponent, {
        data: obj,
        header: this.fieldTitle['mailsendingoption'],
        width: '40%',
        closable:true
      });
  
      ref.onClose.subscribe((obj: any) => {
        if (obj) { 
          this.saveNotification(obj);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveNotification(data: any)
  {
    let list = [];

    const obj ={
      email: data.email,
      emailBody: data.body,
      templateName:'EmailTemplate',
    }
    
    //Send the above object to the service
    list.push(obj);

    if(list.length){
      this.coreAccountingSvc.saveNotification(list).subscribe({
        next: (res: any) => {
          
        },
        error: (res: any) => {
          
        },
        complete: () => {},
      });
    }
  }

}




