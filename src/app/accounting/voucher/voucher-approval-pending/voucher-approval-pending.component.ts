import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { OrgService } from "src/app/app-shared/services/org.service";
import { VoucherModelService } from "../../services/voucher/voucher-model.service";
import { forkJoin, map, of } from "rxjs";
import { NgForm, UntypedFormGroup } from "@angular/forms";
import { formatDate } from "@angular/common";
import {
  ProviderService,
  BaseComponent,
  QueryData,
  FixedIDs,
  GridOption,
  ModalConfig,
  NiMultipleFileViewComponent,
  GlobalMethods,
  GlobalConstants,
  ValidatingObjectFormat,
  ValidatorDirective,
  ChequePrintModalComponent
} from '../../index';
import { MenuService } from "src/app/shared/services/menu.service";
import { EmailSendComponent } from "src/app/shared/components/email-send/email-send.component";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-voucher-approval-pending',
  templateUrl: './voucher-approval-pending.component.html',
  providers: [VoucherModelService],
  standalone: true,
  imports: [SharedModule]
})
export class VoucherApprovalPendingComponent extends BaseComponent implements OnInit {
  @ViewChild("filterForm", { static: true, read: NgForm }) filterForm: NgForm;
  public validationMsgObj: any;
  @ViewChild(ValidatorDirective) directive;

  gridOption: GridOption;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  approvalStatus: any = null;
  isShowAuditorcommentsEntry: boolean = false;
  isShowAuditorcommentsView: boolean = false;
  isShowRemarks: boolean = false;
  voucherID: number = 0;
  voucherNo: string = null;
  remarks: string = null;
  financialYearStatus: any = FixedIDs.FinancialYearStatus;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: VoucherModelService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
    private menuService: MenuService,
  ) {
    super(providerSvc);
    this.validationMsgObj = this.filterValidation();
  }

  private filterValidation(): any {
    return {
      filterValidationObj: {
        companyID: {
          required: GlobalConstants.validationMsg.company,
        },
        orgID: {
          required: GlobalConstants.validationMsg.org,
        }
      } as ValidatingObjectFormat,
    }
  }


  ngOnInit(): void {
    this.modelSvc.isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;
    this.modelSvc.isProjectModuleActive = GlobalConstants.bizConfigInfo.isProjectModuleActive;
    this.modelSvc.isCodeActive = GlobalConstants.bizConfigInfo.isCodeActive;
    this.modelSvc.fieldTitle = this.fieldTitle;
    this.modelSvc.keyValuePair = GlobalMethods.createKeyValuePair;
    this.approvalStatus = FixedIDs.approvalStatus;
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
        this.coreAccountingSvc.getVoucherTitle()
      ]).subscribe({
        next: (res: any) => {
          this.modelSvc.companyList = res[0] || [];
          this.modelSvc.tempLedgerList = res[1] || [];
          this.modelSvc.subLedgerTypeList = res[2] || [];
          //this.modelSvc.subLedgerList = res[3] || [];
          this.modelSvc.tempSubLedgerList = res[3] || [];
          this.modelSvc.transactionModeList = res[4] || [];
          this.modelSvc.voucherTitleList = res[5] || [];

          this.modelSvc.setNewSearchParam();

          if (this.modelSvc.companyList.length == 1) {
            this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
            this.modelSvc.searchParam.company = this.modelSvc.companyList[0].name;
          }

          this.modelSvc.prepareLedgerList();
          this.onChangeCompany();
          this.getVourcherList();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.voucherList",
        refreshEvent: this.refreshEventHandler,
        //getServerData: this.onPage,
        //filterFromServer:this.filterFromServer,
        //lazy: true,
        filterFromServer: this.filterFromServer,
        columns: this.modelSvc.gridColumns(),
        paginator: true,
        isGlobalSearch: false,
        isDynamicHeader: false,
        isClear: true,
        exportOption: {
          exportInXL: true,
          exportDataEvent: this.onExport,
          title: ''
        }
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
    }
  }


  getVourcherList() {
    try {
      let ddlProperties = this.modelSvc.prepareDDLPropertiesForPending();
      this.spData = new QueryData({
        ddlProperties: ddlProperties,
        searchParams: this.modelSvc.prepareSearchParamsForPending(),
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'voucherApprovalPending',
        pageNo: 0
      });

      this.populateGrid(this.modelSvc.isRefresh);
    } catch (error) {
      this.showMsg(error);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      if (this.spData.ddlProperties.length == 0) this.getVourcherList();
      this.spData.isRefresh = isRefresh;
      this.coreAccountingSvc.getVoucherList(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, null, FixedIDs.approvalStatus.Pending, false).subscribe({
        next: (res: any) => {
          if (isRefresh == true) this.bindData(res);
          this.modelSvc.voucherList = this.modelSvc.prepareVoucherList(res[res.length - 1] || []);
          this.gridOption.totalRecords = res[res.length - 4].totalData;
          this.spData.isRefresh = false;
          this.modelSvc.isRefresh = false;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindData(data: any) {
    try {
      this.modelSvc.prepareGridDDLListForPending(data);
      this.gridOption.columns = this.modelSvc.gridColumnsForVoucherApprovalPending();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  onChangeCompany() {
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
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  printCheque(entity: any) {
    try {
      debugger
      const modalConfig = new ModalConfig();
      const obj = { entity: entity };
      modalConfig.data = obj;
      modalConfig.header = this.fieldTitle['printcheque'];
      this.ref = this.dialogService.open(ChequePrintModalComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        debugger
        if (data != undefined) {
          this.coreAccountingSvc.printCheque(entity.voucherItemID, data); //for print cheque
          this.coreAccountingSvc.saveSoftCheque(entity.voucherItemID, data); // for save data and soft copy
        }

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
      //this.spData.pageNo = this.gridOption.resetPageNumber(this.gridOption.first);
      this.populateGrid(isRefresh);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  filterFromServer(event: any, filters: any) {
    try {

      this.modelSvc.filterDataList = [];
      this.modelSvc.filterDataList = event.filteredValue;
      this.modelSvc.isFilter = true;

      if (
        filters.chequeDate[0].value != null ||
        filters.chequeNo[0].value != null ||
        filters.clearedOnDate[0].value != null ||
        filters.creditVal[0].value != null ||
        filters.debitVal[0].value != null ||
        filters.invoiceBillRefNo[0].value != null ||
        filters.toLedger[0].value != null ||
        filters.toSubLedgerDetail[0].value != null ||
        filters.toSubLedgerType[0].value != null
      ) {
        this.modelSvc.isFilterData = true;
      }
      else {
        this.modelSvc.isFilterData = false;
      }

      // this.modelSvc.prepareFilterValueForPending(filters);
      // this.spData.searchParams = this.modelSvc.prepareSearchParamsForPending();
      // this.spData.pageNo = 0;
      // this.populateGrid(false);
      // this.pageReset(0);
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

  onExport(event: any) {
    try {
      event.exportOption.title = this.fieldTitle['voucherapprovalpending'] + "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en") + "_" + this.modelSvc.searchParam.company;

      let spData = GlobalMethods.jsonDeepCopy(this.spData);
      spData.pageNo = 0;

      return this.coreAccountingSvc.getVoucherList(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate, null, FixedIDs.approvalStatus.Pending).pipe(
        map((response: any) => {
          return { values: this.modelSvc.isFilterData ? this.modelSvc.filterDataList : response[response.length - 1], columns: this.modelSvc.prepareReportHeaderListForPending() }
        })
      );
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
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  viewRemarks(entity: any) {
    try {
      this.voucherNo = entity.voucherNo;
      this.remarks = entity.remarks;
      this.isShowRemarks = true;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  printVoucher(entity: any) {
    try {
      this.coreAccountingSvc.printVoucher(entity.voucherTypeCd, entity.id);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  search(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      if (this.modelSvc.searchParam.voucherNo != null) {
        let voucherNo = this.modelSvc.searchParam.voucherNo.trim();
        this.modelSvc.searchParam.voucherNo = voucherNo;
      }

      this.spData.searchParams = this.modelSvc.prepareSearchParamsForPending();
      // if(this.modelSvc.isRefresh == false)
      // {
      //   this.spData.pageNo = 0;
      //   this.pageReset(0);
      // }
      this.populateGrid(true);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset(formGroup: NgForm) {
    try {
      this.modelSvc.subLedgerList = [];
      this.modelSvc.setNewSearchParam();
      this.modelSvc.isRefresh = true;
      this.formResetByDefaultValue(formGroup.form, this.modelSvc.searchParam);
      this.search(formGroup);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  sendEmail(entity: any) {
    try {
      this.coreAccountingSvc.getVoucherReportFileName(entity.voucherTypeCd, entity.id).subscribe({
        next: (res: any) => {
          this.showEmailModal(res);
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

      this.dialogService.open(EmailSendComponent, {
        data: obj,
        header: this.fieldTitle['mailsendingoption'],
        width: '40%',
        closable: true
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(entity: any) {
    try {
      this.coreAccountingSvc.getVoucherEntryEditPeriod(entity.companyID, entity.orgID).subscribe({
        next: (res: any) => {
          this.modelSvc.voucherEntryEditPeriodList = res || [];
          let msgCode = this.modelSvc.checkVoucherEditPeriod(entity);
          if (msgCode) {
            this.showMsg(msgCode);
            return;
          }

          let navigateUrl = this.modelSvc.prepareNavigateUrl(entity.voucherTypeCd);
          this.dataTransferSvc.broadcast('voucherID', entity.id);
          this.menuService.setpageInfoByUrl(navigateUrl);
          this.router.navigateByUrl(navigateUrl);
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

  delete(entity: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.coreAccountingSvc.delete(entity.id, entity.voucherItemID).subscribe({
              next: (res: any) => {
                this.showMsg(this.messageCode.deleteCode);
                this.spData.pageNo = 0;
                this.pageReset(0);
                this.populateGrid(true);
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
          }
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

}