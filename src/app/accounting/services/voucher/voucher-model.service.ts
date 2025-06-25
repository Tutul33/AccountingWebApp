import { Injectable } from "@angular/core";
import { 
  ColumnType,
  Config,
  FileUploadOption,
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
  UtilityService
 } from "../..";
@Injectable()
export class VoucherModelService {
  fieldTitle:any;
  searchParam:any = {};
  keyValuePair:any;
  gridInvRefNoFilterValue:string = null;
  fileUploadOption:FileUploadOption;
  voucherEntryEditPeriodList:any[] = []; 
  maxDate:any = null;
  voucherList:any[] = [];
  companyList:any[] = [];
  officeBranchList:any[] = [];
  projectList:any[] = [];
  financialYearList:any[] = [];
  stockValuationMethodList:any[] = [];
  tempLedgerList:any[] = [];
  ledgerList:any[] = [];
  subLedgerTypeList:any[] = [];
  subLedgerList:any[] = [];
  tempSubLedgerList: any = [];
  transactionModeList:any[] = [];
  voucherTitleList:any[] = [];
  gridLedgerList:any[] = [];
  gridSubLedgerTypeList:any[] = [];
  gridSubledgerDetailList:any[] = [];
  gridDebitList:any[] = [];
  gridCreidList:any[] = [];
  gridInvBillList:any[] = [];
  gridChecqueNoList:any[] = [];
  gridChequeDateList:any[] = [];
  gridClearedOnDateList:any[] = [];
  gridLastModifiedList:any[] = [];
  gridDraftStatusLlist:any[] = [];
  gridCreatedByList:any[] = [];
  gridModifiedByList:any[] = [];
  gridVoucherStatusList: any[] = [];
  isRefresh:boolean = true;
  isBranchModuleActive:boolean = false;
  isProjectModuleActive:boolean = false;
  isCodeActive:boolean = false;
  isSelectAll:boolean = false;
  filterDataList:any[] = [];
  isFilter:boolean = false;
  isFilterData: boolean = false;
  gridVoucherNoList:any[] = [];
  gridFromLedgerList:any[] = [];
  gridFromSubLedgerTypeList:any[] = [];
  gridFromSubledgerDetailList:any[] = [];

  constructor(private utilitySvc: UtilityService) {}

  updateComments(id:number, comments:string){
    try {
      if(comments == '') comments = null;
      this.voucherList.find(x => x.id == id).comments = comments;
    } catch (e) {
      throw e;
    }
  }

  setFileViewOption() {
      try {
        this.fileUploadOption = new FileUploadOption();
        this.fileUploadOption.isMultipleUpload = true;
        this.fileUploadOption.folderName = Config.imageFolders.voucher;
        this.fileUploadOption.fileTick = GlobalMethods.timeTick();
      } catch (e) {
        throw e;
      }
    }

  prepareOrgList(res) {
    try {
      let orgList = [
        {
          label: "-- Office --",
          value: "office",
          items: [],
        },
        {
          label: "-- Branch --",
          value: "branch",
          items: [],
        },
        {
          label: "-- Unit --",
          value: "unit",
          items: [],
        },
      ];
      res.forEach((item) => {
        if (item.value == "Office") {
          //3 Office
          let objOffice = orgList.find((x) => x.value == "office");
          if (objOffice) {
            objOffice.items.push(item);
          }
        } else if (item.value == "Branch") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "branch");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
        else if (item.value == "Unit") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "unit");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
      });
      return orgList;
    } catch (error) {
      throw error;
    }
  }

  prepareLedgerList(){
    try {
      this.searchParam.orgID = this.searchParam.orgID == "" ? null : this.searchParam.orgID;
      this.searchParam.projectID = this.searchParam.projectID == "" ? null : this.searchParam.projectID;
      if(this.searchParam.orgID == null && this.searchParam.projectID  == null)
      {
        this.ledgerList = this.tempLedgerList.filter(f => f.orgID == null && f.projectID == null);
      }
      else
      {
        if(this.searchParam.orgID != null)
        {
          const orgIDArray = this.searchParam.orgID.split(',').map(id => id.trim());
          this.ledgerList = this.tempLedgerList.filter(item => orgIDArray.includes(String(item.orgID)));
        }

        if(this.searchParam.projectID != null)
        {
          const projectIDArray = this.searchParam.projectID.split(',').map(id => id.trim());
          this.ledgerList = this.tempLedgerList.filter(item => projectIDArray.includes(String(item.projectID)));
        }
      }
    } catch (error) {
      throw error;
    }
   }

  prepareVoucherList(data:any)
  {
    try {
      this.isSelectAll = false;
      let id = 0;
      data.forEach(item => {
        item.isShowActionBtn = false;
        if(item.id != id)
        {
          item.isShowActionBtn = true;
          id = item.id;
          item.isApproved = false;
          // if(item.approvalStatus == FixedIDs.ApprovalStatus.Pending)
          // {
          //   item.isApproved = false;
          // }
          // if(item.approvalStatus == FixedIDs.ApprovalStatus.Approved)
          // {
          //   item.isApproved = true;
          // }
        }
      });
      return data;
    } catch (e) {
      throw e;
    }
  }

  checkVoucherEditPeriod(entity: any) {
      try {
        if(this.voucherEntryEditPeriodList.length > 0)
        {
          let voucherEntryEdit = this.voucherEntryEditPeriodList.find(x => x.companyID == entity.companyID && x.orgID == entity.orgID);
          if(voucherEntryEdit)
            {
              let lockEditTillDate = voucherEntryEdit.lockEditTillDate;
              if(lockEditTillDate)
              {
                let voucherDate = new Date(entity.voucherDate);
                lockEditTillDate = new Date(lockEditTillDate);
        
                if (voucherDate <= lockEditTillDate) {
                  return '2260';
                } 
              }
            }
        }
        return null;
      } catch (e) {
        throw e;
      }
  }

  prepareNavigateUrl(voucherTypeCd:number)
  {
    try {
      let navigateUrl = null;
      switch (voucherTypeCd) {
        case FixedIDs.voucherType.JournalVoucher.code:
          navigateUrl = '/ACC-PAGE/journal-voucher-entry';
          break;
        case FixedIDs.voucherType.DebitVoucher.code:
          navigateUrl = '/ACC-PAGE/debit-payment-voucher-entry';
          break;
        case FixedIDs.voucherType.CreditVoucher.code:
          navigateUrl = '/ACC-PAGE/credit-receipt-voucher-entry';
          break;
        case FixedIDs.voucherType.ContraVoucher.code:
          navigateUrl = '/ACC-PAGE/contra-voucher-entry';
          break;
        default:
          break;
      }
      return navigateUrl;
    } catch (e) {
      throw e;
    }
  }

  prepareGridDDLList(data:any){
    try {
      this.gridLedgerList = data[0];
      this.gridSubLedgerTypeList = data[1];
      this.gridSubledgerDetailList = data[2];
      this.gridDebitList = data[3].filter(f => f.DebitVal != 0);
      this.gridCreidList = data[4].filter(f => f.CreditVal != 0);
      this.gridInvBillList = data[5];
      this.gridLastModifiedList = data[6];
      this.gridCreatedByList = data[7];
      this.gridModifiedByList = data[8];
      this.gridChecqueNoList = data[9];
      this.gridChequeDateList = data[10];
      this.gridClearedOnDateList = data[11];
      this.gridVoucherStatusList = data[12];
      this.gridVoucherNoList = data[13];
      this.gridFromLedgerList = data[14];
      this.gridFromSubLedgerTypeList = data[15];
      this.gridFromSubledgerDetailList = data[16];
    } catch (e) {
      throw e;
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
      ddlProperties.push("InvoiceBillRefNo, InvoiceBillRefNo");
      ddlProperties.push("LastUpdate, LastUpdate");
      ddlProperties.push("CreatedByID, CreatedBy");
      ddlProperties.push("EditUserID, EditedBy");
      ddlProperties.push("ChequeNo, ChequeNo");
      ddlProperties.push("ChequeDate, ChequeDate");
      ddlProperties.push("ClearedOnDate, ClearedOnDate");
      ddlProperties.push("VoucherStatus, VoucherStatus");
      ddlProperties.push("VoucherNo, VoucherNo");
      ddlProperties.push("FromCOAStructID, FromLedger");
      ddlProperties.push("FromSubLedgerTypeID, FromSubLedgerType");
      ddlProperties.push("FromSubLedgerDetailID, FromSubLedgerDetail");
      
    return ddlProperties;
    } catch (e) {
      throw e;
    }
  }

   gridColumns(): ColumnType[] {
      let list = [];
      list.push({ field: "company", header: this.fieldTitle['company'] });

      if(this.isBranchModuleActive)
      {
        list.push( { field: "officeBranch", header: this.fieldTitle['unit/branch'] });
      }
      if(this.isProjectModuleActive)
      {
        list.push( { field: "projectName", header: this.fieldTitle['project'] });
      }

      list.push(
        { field: "voucherNo", header: this.fieldTitle['vouchernumber'], isDDFilter:true, dataList: this.gridVoucherNoList, labelField: 'VoucherNo' },
        { field: "voucherDate", header: this.fieldTitle['date'] },
        { field: "fromLedger", header: this.fieldTitle['fromaccountname'], isDDFilter:true, dataList: this.gridFromLedgerList, labelField: 'FromLedger' },
        { field: "fromSubLedgerType", header: this.fieldTitle['subledgertype'], isDDFilter:true, dataList: this.gridFromSubLedgerTypeList, labelField: 'FromSubLedgerType' },
        { field: "fromSubLedgerDetail", header: this.fieldTitle['subledgername'], isDDFilter:true, dataList: this.gridFromSubledgerDetailList, labelField: 'FromSubLedgerDetail' },
        { field: "toLedger", header: this.fieldTitle['toaccountname'], isDDFilter:true, dataList: this.gridLedgerList, labelField: 'ToLedger' },
        { field: "toSubLedgerType", header: this.fieldTitle['subledgertype'], isDDFilter:true, dataList: this.gridSubLedgerTypeList, labelField: 'ToSubLedgerType' },
        { field: "toSubLedgerDetail", header: this.fieldTitle['subledgername'], isMultiselectFilter:true, dataList: this.gridSubledgerDetailList, labelField: 'ToSubLedgerDetail' },
        { field: "transactionMode", header: this.fieldTitle['transactionmode'] },
        { field: "chequeNo", header: this.fieldTitle['chequeno'], isDDFilter:true, dataList: this.gridChecqueNoList, labelField: 'ChequeNo' },
        { field: "chequeDate", header: this.fieldTitle['chequeissuedate'], isDDFilter:true, dataList: this.gridChequeDateList, labelField: 'ChequeDate' },
        { field: "clearedOnDate", header: this.fieldTitle['clearedondate'], isDDFilter:true, dataList: this.gridClearedOnDateList, labelField: 'ClearedOnDate' },
        { field: "description", header: this.fieldTitle['description'] },
        { field: "debitVal", header: this.fieldTitle['debitamount'] + '(' + GlobalConstants.companyInfo.currency + ')', isNumberFilter:true, dataList: this.gridDebitList, labelField: 'DebitVal' },
        { field: "creditVal", header: this.fieldTitle['creditamount'] + '(' + GlobalConstants.companyInfo.currency + ')', isNumberFilter:true, dataList: this.gridCreidList, labelField: 'CreditVal' },
        { field: "invoiceBillRefNo", header: this.fieldTitle['invoicebillrefno'], isDDFilter:true, dataList: this.gridInvBillList, labelField: 'InvoiceBillRefNo' },
        { field: "createdDate", header: this.fieldTitle['createddate&time'] },
        { field: "createdBy", header: this.fieldTitle['createdby'], isMultiselectFilter:true, dataList: this.gridCreatedByList, labelField: 'CreatedBy' },
        { field: "lastUpdate", header: this.fieldTitle['lastmodified'], isMultiselectFilter:true, dataList: this.gridLastModifiedList, labelField: 'LastUpdate' },
        { field: "editedBy", header: this.fieldTitle['modifiedby'], isMultiselectFilter:true, dataList: this.gridModifiedByList, labelField: 'EditedBy' },
        { header: this.fieldTitle['email'], styleClass:'d-center' },
        { header: this.fieldTitle['ref.doc'], styleClass:'d-center' },
        { header: this.fieldTitle['action'], styleClass:'d-center' },
        { header: this.fieldTitle['auditorscomments'], styleClass:'d-center' }
      );
      return list;
    }

    prepareFilterValue(filters:any){
      try {
        this.searchParam.toLedger = filters['toLedger'][0].value;
        this.searchParam.toSubLedgerType = filters['toSubLedgerType'][0].value;
        this.searchParam.toSubLedgerDetail = filters['toSubLedgerDetail'][0].value;
        this.searchParam.debitVal = filters['debitVal'][0].value;
        this.searchParam.creditVal = filters['creditVal'][0].value;
        this.searchParam.lastUpdate = filters['lastUpdate'][0].value;
        this.searchParam.createdBy = filters['createdBy'][0].value;
        this.searchParam.editedBy = filters['editedBy'][0].value;
        this.gridInvRefNoFilterValue = filters['invoiceBillRefNo'][0].value;
        this.searchParam.voucherNo = filters['voucherNo'][0].value;
        this.searchParam.fromLedger = filters['fromLedger'][0].value;
        this.searchParam.fromSubLedgerType = filters['fromSubLedgerType'][0].value;
        this.searchParam.fromSubLedgerDetail = filters['fromSubLedgerDetail'][0].value;
      } catch (e) {
        throw e;
      }
    }

    prepareSearchParams(){
      try {
        let searchParams = [];
        if(this.searchParam.orgID) searchParams.push(this.keyValuePair('orgID', this.searchParam.orgID || null));
        if(this.searchParam.projectID) searchParams.push(this.keyValuePair('projectID', this.searchParam.projectID || null));
        if(this.searchParam.toCOAStructID) searchParams.push(this.keyValuePair('toCOAStructID', this.searchParam.toCOAStructID || null));
        if(this.searchParam.toSubLedgerTypeID) searchParams.push(this.keyValuePair('toSubLedgerTypeID', this.searchParam.toSubLedgerTypeID || null));
        if(this.searchParam.toSubLedgerDetailID) searchParams.push(this.keyValuePair('toSubLedgerDetailID', this.searchParam.toSubLedgerDetailID || null));
        if(this.searchParam.toLedger) searchParams.push(this.keyValuePair('toLedger', this.searchParam.toLedger || null));
        if(this.searchParam.toSubLedgerType) searchParams.push(this.keyValuePair('toSubLedgerType', this.searchParam.toSubLedgerType || null));
        if(this.searchParam.toSubLedgerDetail) searchParams.push(this.keyValuePair('toSubLedgerDetail', this.searchParam.toSubLedgerDetail || null));
        if(this.searchParam.voucherNo) searchParams.push(this.keyValuePair('voucherNo', this.searchParam.voucherNo || null));
        if(this.searchParam.tranModeCd) searchParams.push(this.keyValuePair('tranModeCd', this.searchParam.tranModeCd || null));
        if(this.searchParam.debitVal) searchParams.push(this.keyValuePair('debitVal', this.searchParam.debitVal || null));
        if(this.searchParam.creditVal) searchParams.push(this.keyValuePair('creditVal', this.searchParam.creditVal || null));
        if(this.searchParam.createdBy) searchParams.push(this.keyValuePair('createdBy', this.searchParam.createdBy || null));
        if(this.searchParam.editedBy) searchParams.push(this.keyValuePair('editedBy', this.searchParam.editedBy || null));
        if(this.searchParam.lastUpdate) searchParams.push(this.keyValuePair('lastUpdate', this.searchParam.lastUpdate || null));
        if(this.searchParam.voucherTypeCd) searchParams.push(this.keyValuePair('voucherTypeCd', this.searchParam.voucherTypeCd || null));
        if(this.searchParam.voucherTitleCd) searchParams.push(this.keyValuePair('voucherTitleCd', this.searchParam.voucherTitleCd || null));
        if(this.searchParam.fromLedger) searchParams.push(this.keyValuePair('fromLedger', this.searchParam.fromLedger || null));
        if(this.searchParam.fromSubLedgerType) searchParams.push(this.keyValuePair('fromSubLedgerType', this.searchParam.fromSubLedgerType || null));
        if(this.searchParam.fromSubLedgerDetail) searchParams.push(this.keyValuePair('fromSubLedgerDetail', this.searchParam.fromSubLedgerDetail || null));

        let invRefNo = null;
        if(this.searchParam.invoiceBillRefNo)
        {
          invRefNo = this.searchParam.invoiceBillRefNo;
        }
        else if(this.gridInvRefNoFilterValue)
        {
          invRefNo = this.gridInvRefNoFilterValue
        }
        if(invRefNo) searchParams.push(this.keyValuePair('invoiceBillRefNo', invRefNo || null));
  
        return searchParams;
      } catch (e) {
        throw e;
      }
    }
    setNewSearchParam(){ 
      try {
        let currentDate = new Date(GlobalConstants.serverDate);
        this.searchParam = {
          company:GlobalConstants.userInfo.company, 
          companyID: GlobalConstants.userInfo.companyID, 
          // fromDate : currentDate, 
          // toDate : currentDate, 
          fromDate : null, 
          toDate : null,
          orgID: null, 
          projectID: null, 
          toCOAStructID:null, 
          toSubLedgerTypeID:null, 
          toSubLedgerDetailID:null, 
          voucherNo:null, 
          tranModeCd:null, 
          fromLedger:null, 
          fromSubLedgerType:null, 
          fromSubLedgerDetail:null, 
          debitVal:null, 
          creditVal:null, 
          invoiceBillRefNo:null, 
          createdBy:null, 
          lastUpdate:null, 
          editedBy:null, 
          draftStatus:null,
          voucherTypeCd:null,
          voucherTitleCd:null
         };
      } catch (e) {
        throw e;
      }
    }

    prepareReportHeaderList() {
      let list = [];
      list.push({ field: "company", header: this.fieldTitle['company'] });
      if(this.isBranchModuleActive)
      {
        list.push({ field: "officeBranch", header: this.fieldTitle['unit/branch'] });
      }
      if(this.isProjectModuleActive)
      {
        list.push({ field: "projectName", header: this.fieldTitle['project'] });
      }

      list.push(
          { field: "company", header: this.fieldTitle['company'] },
          { field: "officeBranch", header: this.fieldTitle['unit/branch'] },
          { field: "projectName", header: this.fieldTitle['project'] },
          { field: "voucherNo", header: this.fieldTitle['vouchernumber'] },
          { field: "voucherDate", header: this.fieldTitle['date'] },
          { field: "fromLedger", header: this.fieldTitle['fromaccountname']},
          { field: "fromSubLedgerType", header: this.fieldTitle['subledgertype'] },
          { field: "fromSubLedgerDetail", header: this.fieldTitle['subledgername'] },
          { field: "toLedger", header: this.fieldTitle['toaccountname'] },
          { field: "toSubLedgerType", header: this.fieldTitle['subledgertype'] },
          { field: "toSubLedgerDetail", header: this.fieldTitle['subledgername'] },
          { field: "transactionMode", header: this.fieldTitle['transactionmode'] },
          { field: "chequeNo", header: this.fieldTitle['chequeno'] },
          { field: "chequeDate", header: this.fieldTitle['chequeissuedate'] },
          { field: "clearedOnDate", header: this.fieldTitle['clearedondate'] },
          { field: "description", header: this.fieldTitle['description'] },
          { field: "debitVal", header: this.fieldTitle['debitamount'] + '(' + GlobalConstants.companyInfo.currency + ')' },
          { field: "creditVal", header: this.fieldTitle['creditamount'] + '(' + GlobalConstants.companyInfo.currency + ')' },
          { field: "invoiceBillRefNo", header: this.fieldTitle['invoicebillrefno'] },
          { field: "createdDate", header: this.fieldTitle['createddate&time'] },
          { field: "createdBy", header: this.fieldTitle['createdby'] },
          { field: "lastUpdate", header: this.fieldTitle['lastmodified'] },
          { field: "editedBy", header: this.fieldTitle['modifiedby'] },
          { field: "voucherStatus", header: this.fieldTitle['status'] }
        );

        return list;
      }

    onChangeFromDate(){
      try {
        this.isRefresh = true;
        // this.searchParam.toDate = this.searchParam.fromDate;
        // this.maxDate = null;
        // if(this.searchParam.fromDate)
        // {
        //    // Add 1 year to the current date
        //   let date = new Date(this.searchParam.fromDate);
        //   date.setFullYear(date.getFullYear() + 1);
        //   this.maxDate = date;
        // }
      } catch (e) {
        throw e;
      }
    }

    prepareDDLPropertiesForPending() {
      try {
        var ddlProperties = [];
        ddlProperties.push("ToCOAStructID, ToLedger");
        ddlProperties.push("ToSubLedgerTypeID, ToSubLedgerType");
        ddlProperties.push("ToSubLedgerDetailID, ToSubLedgerDetail");
        ddlProperties.push("DebitVal, DebitVal");
        ddlProperties.push("CreditVal, CreditVal");
        ddlProperties.push("InvoiceBillRefNo, InvoiceBillRefNo");
        ddlProperties.push("ChequeNo, ChequeNo");
        ddlProperties.push("ChequeDate, ChequeDate");
        ddlProperties.push("ClearedOnDate, ClearedOnDate");
      return ddlProperties;
      } catch (e) {
        throw e;
      }
    }

    prepareGridDDLListForPending(data:any){
      try {
        this.gridLedgerList = data[0];
        this.gridSubLedgerTypeList = data[1];
        this.gridSubledgerDetailList = data[2];
        this.gridDebitList = data[3].filter(f => f.DebitVal != 0);
        this.gridCreidList = data[4].filter(f => f.CreditVal != 0);
        this.gridInvBillList = data[5];
        this.gridChecqueNoList = data[6];
        this.gridChequeDateList = data[7];
        this.gridClearedOnDateList = data[8];
      } catch (e) {
        throw e;
      }
    }

    
    prepareFilterValueForPending(filters:any){
      try {
        this.searchParam.toLedger = filters['toLedger'][0].value;
        this.searchParam.toSubLedgerType = filters['toSubLedgerType'][0].value;
        this.searchParam.toSubLedgerDetail = filters['toSubLedgerDetail'][0].value;
        this.searchParam.debitVal = filters['debitVal'][0].value;
        this.searchParam.creditVal = filters['creditVal'][0].value;
        this.gridInvRefNoFilterValue = filters['invoiceBillRefNo'][0].value;
      } catch (e) {
        throw e;
      }
    }


    gridColumnsForVoucherApprovalPending(): ColumnType[] {
      let list = [];
      list.push({ field: "company", header: this.fieldTitle['company'] });

      if(this.isBranchModuleActive)
      {
        list.push( { field: "officeBranch", header: this.fieldTitle['unit/branch'] });
      }
      if(this.isProjectModuleActive)
      {
        list.push( { field: "projectName", header: this.fieldTitle['project'] });
      }

      list.push(
        { field: "voucherNo", header: this.fieldTitle['vouchernumber'] },
        { field: "voucherDate", header: this.fieldTitle['date'] },
        { field: "fromLedger", header: this.fieldTitle['fromaccountname'] },
        { field: "fromSubLedgerType", header: this.fieldTitle['subledgertype'] },
        { field: "fromSubLedgerDetail", header: this.fieldTitle['subledgername'] },
        { field: "toLedger", header: this.fieldTitle['toaccountname'], isDDFilter:true, dataList: this.gridLedgerList, labelField: 'ToLedger' },
        { field: "toSubLedgerType", header: this.fieldTitle['subledgertype'], isDDFilter:true, dataList: this.gridSubLedgerTypeList, labelField: 'ToSubLedgerType' },
        { field: "toSubLedgerDetail", header: this.fieldTitle['subledgername'], isMultiselectFilter:true, dataList: this.gridSubledgerDetailList, labelField: 'ToSubLedgerDetail' },
        { field: "chequeNo", header: this.fieldTitle['chequeno'], isDDFilter:true, dataList: this.gridChecqueNoList, labelField: 'ChequeNo' },
        { field: "chequeDate", header: this.fieldTitle['chequeissuedate'], isDateFilter:true, dataList: this.gridChequeDateList, labelField: 'ChequeDate' },
        { field: "clearedOnDate", header: this.fieldTitle['clearedondate'], isDateFilter:true, dataList: this.gridClearedOnDateList, labelField: 'ClearedOnDate' },
        { field: "description", header: this.fieldTitle['description'] },
        { field: "debitVal", header: this.fieldTitle['debitamount'] + '(' + GlobalConstants.companyInfo.currency + ')', isNumberFilter:true, dataList: this.gridDebitList, labelField: 'DebitVal' },
        { field: "creditVal", header: this.fieldTitle['creditamount'] + '(' + GlobalConstants.companyInfo.currency + ')', isNumberFilter:true, dataList: this.gridCreidList, labelField: 'CreditVal' },
        { field: "invoiceBillRefNo", header: this.fieldTitle['invoicebillrefno'], isDDFilter:true, dataList: this.gridInvBillList, labelField: 'InvoiceBillRefNo' },
        { header: this.fieldTitle['email'] },
        { header: this.fieldTitle['ref.doc'] },
        { header: this.fieldTitle['action'] }
      );
      return list;
    }

    prepareSearchParamsForPending(){
      try {
        let searchParams = [];
        if(this.searchParam.orgID) searchParams.push(this.keyValuePair('orgID', this.searchParam.orgID || null));
        if(this.searchParam.projectID) searchParams.push(this.keyValuePair('projectID', this.searchParam.projectID || null));
        if(this.searchParam.toCOAStructID) searchParams.push(this.keyValuePair('toCOAStructID', this.searchParam.toCOAStructID || null));
        if(this.searchParam.toSubLedgerTypeID) searchParams.push(this.keyValuePair('toSubLedgerTypeID', this.searchParam.toSubLedgerTypeID || null));
        if(this.searchParam.toSubLedgerDetailID) searchParams.push(this.keyValuePair('toSubLedgerDetailID', this.searchParam.toSubLedgerDetailID || null));
        if(this.searchParam.toLedger) searchParams.push(this.keyValuePair('toLedger', this.searchParam.toLedger || null));
        if(this.searchParam.toSubLedgerType) searchParams.push(this.keyValuePair('toSubLedgerType', this.searchParam.toSubLedgerType || null));
        if(this.searchParam.toSubLedgerDetail) searchParams.push(this.keyValuePair('toSubLedgerDetail', this.searchParam.toSubLedgerDetail || null));
        if(this.searchParam.voucherNo) searchParams.push(this.keyValuePair('voucherNo', this.searchParam.voucherNo || null));
        if(this.searchParam.tranModeCd) searchParams.push(this.keyValuePair('tranModeCd', this.searchParam.tranModeCd || null));
        if(this.searchParam.debitVal) searchParams.push(this.keyValuePair('debitVal', this.searchParam.debitVal || null));
        if(this.searchParam.creditVal) searchParams.push(this.keyValuePair('creditVal', this.searchParam.creditVal || null));
        if(this.searchParam.voucherTypeCd) searchParams.push(this.keyValuePair('voucherTypeCd', this.searchParam.voucherTypeCd || null));
        if(this.searchParam.voucherTitleCd) searchParams.push(this.keyValuePair('voucherTitleCd', this.searchParam.voucherTitleCd || null));


        let invRefNo = null;
        if(this.searchParam.invoiceBillRefNo)
        {
          invRefNo = this.searchParam.invoiceBillRefNo;
        }
        else if(this.gridInvRefNoFilterValue)
        {
          invRefNo = this.gridInvRefNoFilterValue
        }
        if(invRefNo) searchParams.push(this.keyValuePair('invoiceBillRefNo', invRefNo || null));
  
        return searchParams;
      } catch (e) {
        throw e;
      }
    }

    prepareReportHeaderListForPending() {
      let list = [];
      list.push({ field: "company", header: this.fieldTitle['company'] });
      if(this.isBranchModuleActive)
      {
        list.push({ field: "officeBranch", header: this.fieldTitle['unit/branch'] });
      }
      if(this.isProjectModuleActive)
      {
        list.push({ field: "projectName", header: this.fieldTitle['project'] });
      }

      list.push(
        { field: "voucherNo", header: this.fieldTitle['vouchernumber'] },
        { field: "voucherDate", header: this.fieldTitle['date'] },
        { field: "fromLedger", header: this.fieldTitle['fromaccountname']},
        { field: "fromSubLedgerType", header: this.fieldTitle['subledgertype'] },
        { field: "fromSubLedgerDetail", header: this.fieldTitle['subledgername'] },
        { field: "toLedger", header: this.fieldTitle['toaccountname'] },
        { field: "toSubLedgerType", header: this.fieldTitle['subledgertype'] },
        { field: "toSubLedgerDetail", header: this.fieldTitle['subledgername'] },
        { field: "chequeNo", header: this.fieldTitle['chequeno'] },
        { field: "chequeDate", header: this.fieldTitle['chequeissuedate'] },
        { field: "clearedOnDate", header: this.fieldTitle['clearedondate'] },
        { field: "description", header: this.fieldTitle['description'] },
        { field: "debitVal", header: this.fieldTitle['debitamount'] + '(' + GlobalConstants.companyInfo.currency + ')' },
        { field: "creditVal", header: this.fieldTitle['creditamount'] + '(' + GlobalConstants.companyInfo.currency + ')' },
        { field: "invoiceBillRefNo", header: this.fieldTitle['invoicebillrefno'] },
      );
      return list;
    }
}
