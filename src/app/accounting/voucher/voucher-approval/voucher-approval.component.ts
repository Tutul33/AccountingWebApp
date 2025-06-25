import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CoreAccountingService } from "src/app/app-shared/services/coreAccounting.service";
import { OrgService } from "src/app/app-shared/services/org.service";
import { VoucherModelService } from "../../services/voucher/voucher-model.service";
import { forkJoin, map } from "rxjs";
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
  ValidatorDirective,
  ValidatingObjectFormat,
  ChequePrintModalComponent
} from '../../index';
import { EmailSendComponent } from "src/app/shared/components/email-send/email-send.component";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-voucher-approval',
  templateUrl: './voucher-approval.component.html',
  providers: [VoucherModelService],
  standalone:true,
  imports:[SharedModule]
})
export class VoucherApprovalComponent extends BaseComponent implements OnInit {
  @ViewChild("commentsEntryForm", { static: true, read: NgForm }) commentsEntryForm: NgForm;
  @ViewChild("filterForm", { static: true, read: NgForm }) filterForm: NgForm;
  public validationMsgObj: any;
  @ViewChild(ValidatorDirective) directive;
  gridOption: GridOption;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  approvalStatus:any = null;
  isShowAuditorcommentsEntry:boolean = false;
  isShowAuditorcommentsView:boolean = false;
  isShowRemarks:boolean = false;
  voucherID:number = 0;
  voucherNo:string = null;
  comments:string = null;
  remarks:string = null;
  tempComments:string = null;
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: VoucherModelService,
    public dialogService: DialogService,
    private orgSvc: OrgService,
    private coreAccountingSvc: CoreAccountingService,
  ) {
    super(providerSvc);
    this.validationMsgObj = this.filterValidation();
  }
  private filterValidation(): any {
      return {
        filterValidationObj: {
              companyID: {
                  required: GlobalConstants.validationMsg.company,
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

  getDefaultData(){
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


            if(this.modelSvc.companyList.length == 1)
              {
                this.modelSvc.searchParam.companyID = this.modelSvc.companyList[0].id;
                this.modelSvc.searchParam.company = this.modelSvc.companyList[0].name;
              }

            this.modelSvc.prepareLedgerList();
            this.onChangeCompany();
            this.getVourcherListForApproval();
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
        hasFrozenColumn:true,
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

  getVourcherListForApproval() {
    try {
      let ddlProperties = this.modelSvc.prepareDDLProperties();
      this.spData = new QueryData({
        ddlProperties: ddlProperties,
        searchParams: this.modelSvc.prepareSearchParams(),
        userID: GlobalConstants.userInfo.userPKID,
        queryEvent: 'voucherApproval',
        pageNo: 0
      });

     this.populateGrid(this.modelSvc.isRefresh);
    } catch (error) {
      this.showMsg(error);
    }
  }

  populateGrid(isRefresh: boolean) {
    try {
      if(this.spData.ddlProperties.length == 0)
      {
        this.getVourcherListForApproval();
      }

      this.spData.isRefresh = isRefresh;
      this.coreAccountingSvc.getVoucherListForApproval(this.spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate).subscribe({
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

  bindData(data:any) {
    try {
      this.modelSvc.prepareGridDDLList(data);
      this.gridOption.columns = this.modelSvc.gridColumns();
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

          // let list = res[0];
          // if(list.length == 1 && this.modelSvc.isBranchModuleActive)
          // {
          //   this.modelSvc.searchParam.orgID = list[0].id.toString();
          // }
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

    printCheque(entity: any) {
       try {debugger
         const modalConfig = new ModalConfig();
         const obj = { entity: entity };
         modalConfig.data = obj;
         modalConfig.header = this.fieldTitle['printcheque'];
         this.ref = this.dialogService.open(ChequePrintModalComponent, modalConfig);
         this.ref.onClose.subscribe((data: any) => {debugger
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

      if (filters.chequeDate[0].value != null || filters.chequeNo[0].value != null ||
        filters.clearedOnDate[0].value != null ||
        filters.createdBy[0].value != null ||
        filters.creditVal[0].value != null ||
        filters.debitVal[0].value != null ||
        filters.editedBy[0].value != null ||
        filters.invoiceBillRefNo[0].value != null ||
        filters.lastUpdate[0].value != null ||
        filters.toLedger[0].value != null ||
        filters.toSubLedgerDetail[0].value != null ||
        filters.toSubLedgerType[0].value != null ||
        filters.voucherNo[0].value != null ||
        filters.fromLedger[0].value != null ||
        filters.fromSubLedgerType[0].value != null ||
        filters.fromSubLedgerDetail[0].value != null ||
        filters.voucherStatus[0].value != null
      ) 
      {
        this.modelSvc.isFilterData = true;
      }
      else
      {
        this.modelSvc.isFilterData = false;
      }

      // this.modelSvc.prepareFilterValue(filters);
      // this.spData.searchParams = this.modelSvc.prepareSearchParams();
      // this.spData.pageNo = 1;
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

  onExport(event: any)
  {
    try {
      event.exportOption.title =this.fieldTitle['voucherapproval'] + "_" + formatDate(this.modelSvc.searchParam.fromDate, "yyyy", "en") + "_" + this.modelSvc.searchParam.company;

      let spData = GlobalMethods.jsonDeepCopy(this.spData);
      spData.pageNo = 0;

      return this.coreAccountingSvc.getVoucherListForApproval(spData, this.modelSvc.searchParam.companyID, this.modelSvc.searchParam.fromDate, this.modelSvc.searchParam.toDate).pipe(
        map((response: any) => {
          return {values: this.modelSvc.isFilterData ? this.modelSvc.filterDataList : response[response.length - 1], columns: this.modelSvc.prepareReportHeaderList()}
        })
      );
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  viewDoc(entity:any) {
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
  viewRemarks(entity:any){
    try {
      this.voucherNo = entity.voucherNo;
      this.remarks = entity.remarks;
      this.isShowRemarks = true;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  printVoucher(entity:any){
    try {
      this.coreAccountingSvc.printVoucher(entity.voucherTypeCd, entity.id);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveVoucherApproval(entity:any, approvalStatus:number){
    try {
      this.coreAccountingSvc.saveApprovalStatus(entity.id, approvalStatus).subscribe({
        next: (res: any) => {
          this.showMsg(this.messageCode.editCode);
          entity.approvalStatus = approvalStatus;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveApprovalComments(id:number, comments:string){
    try {
      this.coreAccountingSvc.saveApprovalComments(id, comments).subscribe({
        next: (res: any) => {
          this.showMsg(this.messageCode.saveCode);
          this.modelSvc.updateComments(id, comments);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  okCommentsEntry(){
    try {
      this.isShowAuditorcommentsEntry = false;
      this.saveApprovalComments(this.voucherID, this.comments);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  resetCommentsEntry(){
    try {
      this.comments = this.tempComments;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  showAuditorCommentsModal(entity:any, isEntry:boolean){
    try {
      this.voucherID = entity.id;
      this.voucherNo = entity.voucherNo;
      this.comments = entity.comments;
      this.tempComments = entity.comments;
      if(isEntry)
      {
        this.isShowAuditorcommentsEntry = true;
      }
      else{
        this.isShowAuditorcommentsView = true;
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  search(formGroup: NgForm){
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }


      // Checking voucher date start -- This code is added temporary purpose!
      if ((this.modelSvc.searchParam.fromDate != null && this.modelSvc.searchParam.toDate == null) || 
      (this.modelSvc.searchParam.toDate != null && this.modelSvc.searchParam.fromDate == null)) {
        if(this.modelSvc.searchParam.fromDate == null)
        {
          this.showMsg("Please select voucher date from!");
        }
        else if(this.modelSvc.searchParam.toDate == null)
        {
          this.showMsg("Please select voucher date to!");
        }
        return;
      }
      // Checking voucher date End !

      if(this.modelSvc.searchParam.voucherNo != null)
      {
        let voucherNo = this.modelSvc.searchParam.voucherNo.trim();
        this.modelSvc.searchParam.voucherNo = voucherNo;
      }


      this.spData.searchParams = this.modelSvc.prepareSearchParams();
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

  reset(formGroup: NgForm){
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

  sendEmail(entity: any){
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
  
    showEmailModal(reportName:string){
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
          closable:true
        });
      } catch (e) {
        this.showErrorMsg(e);
      }
    }


    onSelectAllIsApproved() {
      try {
        if (this.modelSvc.isSelectAll) {
          this.modelSvc.voucherList.forEach(x => x.isApproved = true);
          for (let index = 0; index < this.modelSvc.voucherList.length; index++) {
            const element = this.modelSvc.voucherList[index];
            element.isApproved = true;
            this.onSelectIsApproved(element, index);
          }
        } else {
          for (let index = 0; index < this.modelSvc.voucherList.length; index++) {
            const element = this.modelSvc.voucherList[index];
            element.isApproved = false;
            this.onSelectIsApproved(element, index);
          }
        }
  
      } catch (error) {
        this.showErrorMsg(error);
      }
    }

    onSelectIsApproved(entity, rowIndex) {
      try {
        const obj = this.modelSvc.voucherList.find(x => x.isApproved == false);
        this.modelSvc.isSelectAll = obj ? false : true;
      } catch (error) {
        this.showErrorMsg(error);
      }
    }

    approvedNonApprovedVoucerList: any;
    approve() {
      try {
        this.approvedNonApprovedVoucerList = [];

        if (this.modelSvc.isFilterData) {
          this.modelSvc.filterDataList.forEach(element => {
            if (element.isShowActionBtn && element.isApproved) {
              let obj = {
                id: element.id,
                approvalStatus: FixedIDs.ApprovalStatus.Approved,
                createdByID: element.createdByID,
                isApproved: true,
              };
              this.approvedNonApprovedVoucerList.push(obj);
            }
          });
        } else {
          this.modelSvc.voucherList.forEach(element => {
            if (element.isShowActionBtn && element.isApproved) {
              let obj = {
                id: element.id,
                approvalStatus: FixedIDs.ApprovalStatus.Approved,
                createdByID: element.createdByID,
                isApproved: true,
              };
              this.approvedNonApprovedVoucerList.push(obj);
            }
          });
        }

        if(this.approvedNonApprovedVoucerList.length > 0)
        {
          this.approveNoApproveVoucherByIds();
        }
      } catch (error) {
        this.showErrorMsg(error);
      }
    }

    nonApprove() {
      try {
        this.approvedNonApprovedVoucerList = [];

        if (this.modelSvc.isFilterData){
          this.modelSvc.filterDataList.forEach(element => {
            if (element.isShowActionBtn && element.isApproved) {
              let obj = {
                id: element.id,
                approvalStatus: FixedIDs.ApprovalStatus.Pending,
                createdByID: element.createdByID,
                isApproved: false,
              };
              this.approvedNonApprovedVoucerList.push(obj);
            }
          });
        }
        else
        {
          this.modelSvc.voucherList.forEach(element => {
            if (element.isShowActionBtn && element.isApproved) {
              let obj = {
                id: element.id,
                approvalStatus: FixedIDs.ApprovalStatus.Pending,
                createdByID: element.createdByID,
                isApproved: false,
              };
              this.approvedNonApprovedVoucerList.push(obj);
            }
          });
        }


        if(this.approvedNonApprovedVoucerList.length > 0)
        {
          this.approveNoApproveVoucherByIds();
        }
      } catch (error) {
        this.showErrorMsg(error);
      }
    }

    approveNoApproveVoucherByIds() {
      try {
        this.coreAccountingSvc.approveNoApproveVoucherByIds(this.approvedNonApprovedVoucerList).subscribe({
          next: (res: any) => {
            this.showMsg(this.messageCode.editCode);
            this.populateGrid(true);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          }
        });
      } catch (error) {
        this.showErrorMsg(error);
      }
    }
}

