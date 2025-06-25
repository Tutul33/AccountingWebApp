import { Injectable } from "@angular/core";
import {
  VoucherAttachment,
  VoucherModel,
} from "../../models/voucher/voucher.model";
import {
  imageFileUploadOption,
  VoucherItemModel,
} from "../../models/voucher/voucher-item.model";
import {
  Config,
  FileUploadOption,
  FixedIDs,
  GlobalConstants,
  GlobalMethods,
  UtilityService,
} from "src/app/admin";
import { UntypedFormGroup } from "@angular/forms";

@Injectable()
export class ContraVoucherModelService {
  multiContraVoucherForm: UntypedFormGroup;
  contraVoucherModel: VoucherModel = new VoucherModel();
  tempVoucherModel: any;
  validityVoucherEntryEdit: any[]=[];
  allSubLedgerDetailList: any[] = [];
  orgList: any[] = [];
  coaStructureList: any[] = [];
  toCoaStructureList: any[] = [];
  subLedgerDetailList: any[] = [];
  projectList: any[] = [];
  financialYearAll: any[] = [];
  financialYear: any[] = [];
  minDate: Date = null;
  maxDate: Date = null;
  userInfo:any;
  decimalPlace:number=2;
  financialYearMinDate: Date = null;
  financialYearMaxDate: Date = null;
  lockEditTillMinDate: Date = null;
  lockEntryTillMinDate: Date = null;
  transactionModeList: any = [];
  isBranchModuleActive: boolean = false;
  isProjectModuleActive: boolean = false;

  // Contra Voucher List //
        
  fieldTitle: any;
  searchParam: any = {};
  keyValuePair: any;
  gridInvRefNoFilterValue: string = null;
  fileUploadOption: FileUploadOption; 

  contraVourcherList: any = [];
  companyList: any = [];
  officeBranchUnitList: any = [];
  projectsList: any = [];

  gridLedgerList:any[] = [];
  gridDebitList:any[] = [];
  gridCreidList:any[] = [];
  gridCreatedByList:any[] = [];
  gridModifiedByList:any[] = [];
  gridDraftStatusLlist:any[] = [];

  lockVoucherEditList: any = [];
  chequeLeafNoList: any[] = [];
  tempChequeLeafNoList: any[] = [];

  constructor(private utilitySvc: UtilityService) {}

  initiate() {
    this.contraVoucherModel = new VoucherModel();
    this.contraVoucherModel.companyID = this.userInfo.companyID;
    this.contraVoucherModel.company = this.userInfo.company;
    this.contraVoucherModel.voucherDate = new Date();
  }

  addNewItem() {
    try {
      let objJournalVoucherItem = new VoucherItemModel();

      this.filterCOAStructure(objJournalVoucherItem,this.contraVoucherModel.orgID,this.contraVoucherModel.projectID);

      this.contraVoucherModel.voucherItemList.entityPush(
        objJournalVoucherItem
      );
    } catch (error) {
      throw error;
    }
  }

  setMinDateMaxDate() {
    try {
      this.financialYear = this.financialYearAll.filter((x) => x.status != 12);
      if (this.financialYear.length) {
        const minDate = new Date(
          Math.min(
            ...this.financialYear.map((item) =>
              new Date(item.fromDate).getTime()
            )
          )
        );
        const maxDate = new Date(
          Math.max(
            ...this.financialYear.map((item) => new Date(item.toDate).getTime())
          )
        );
        this.financialYearMinDate = minDate;
        this.financialYearMaxDate = maxDate;
      }
      if (this.validityVoucherEntryEdit.length) {
        const minDateLockEdit = new Date(
          Math.min(
            ...this.validityVoucherEntryEdit.map((item) =>
              new Date(item.lockEditTillDate).getTime()
            )
          )
        );
        const minDateLockEntry = new Date(
          Math.max(
            ...this.validityVoucherEntryEdit.map((item) =>
              new Date(item.lockEntryTillDate).getTime()
            )
          )
        );
        this.lockEditTillMinDate = minDateLockEdit;
        this.lockEntryTillMinDate = minDateLockEntry;
      }
    } catch (error) {
      throw error;
    }
  }

  setMinMaxDateBasedOnComapnyProjectOrg() {
    try {
      if (this.contraVoucherModel.id) {
        const lockEditTillDate = this.lockEditTillMinDate;
        if (lockEditTillDate && this.financialYearMinDate) {
          this.minDate =
            this.financialYearMinDate < lockEditTillDate
              ? this.financialYearMinDate
              : lockEditTillDate;
        } else if (!lockEditTillDate && this.financialYearMinDate) {
          this.minDate = this.financialYearMinDate;
        }

        if (lockEditTillDate && this.financialYearMaxDate) {
          this.maxDate =
            this.financialYearMaxDate > lockEditTillDate
              ? this.financialYearMaxDate
              : lockEditTillDate;
        } else if (!lockEditTillDate && this.financialYearMaxDate) {
          this.maxDate = this.financialYearMaxDate;
        }
      } else {
        const lockEntryTillDate = this.lockEntryTillMinDate;
        if (lockEntryTillDate && this.financialYearMinDate) {
          this.minDate =
            this.financialYearMinDate < lockEntryTillDate
              ? this.financialYearMinDate
              : lockEntryTillDate;
        } else if (!lockEntryTillDate && this.financialYearMinDate) {
          this.minDate = this.financialYearMinDate;
        }

        if (lockEntryTillDate && this.financialYearMaxDate) {
          this.maxDate =
            this.financialYearMaxDate > lockEntryTillDate
              ? this.financialYearMaxDate
              : lockEntryTillDate;
        } else if (!lockEntryTillDate && this.financialYearMaxDate) {
          this.maxDate = this.financialYearMaxDate;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  removeItem(item) {
    try {
      item.setDeleteTag();
      item.voucherItemAttachmentList.forEach((file) => {
        file.deletedFileName = file.fileName;
        file.setDeleteTag();
      });
      this.multiContraVoucherForm.markAsDirty();
      
    } catch (error) {
      throw error;
    }
  }

  resetFormMultiple() {
    try {
      this.initiate();
      this.contraVoucherModel.isMultiEntry = true;
      this.multiContraVoucherForm.markAsPristine();
      
    } catch (error) {
      throw error;
    }
  }

 
  setCodeGenProperty() {
    try {
      const condeGenPropertyVal = GlobalMethods.codeGenProperty();
      condeGenPropertyVal.voucherTypeShortName =
        FixedIDs.voucherType.ContraVoucher.shortName;
      this.contraVoucherModel.codeGenPropertyVal = JSON.stringify(
        condeGenPropertyVal
      ).toString();
    } catch (error) {
      throw error;
    }
  }
  
  prepareDataForMultiEntry() {
    try {
      if (!this.contraVoucherModel.id) {
        this.contraVoucherModel.voucherTypeCd = FixedIDs.voucherType.ContraVoucher.code;
        this.contraVoucherModel.voucherTitleCd = FixedIDs.voucherTitleCd.contraVoucher.code;
        this.contraVoucherModel.createdByID = this.userInfo.userPKID;
        this.contraVoucherModel.insertUserID = this.userInfo.userPKID;
        this.contraVoucherModel.approvalStatus = FixedIDs.approvalStatus.Pending;
        this.contraVoucherModel.dateID = 0;
        this.contraVoucherModel.isMultiEntry = true;
        this.contraVoucherModel.isDraft = this.contraVoucherModel.isDraft || false;
        this.contraVoucherModel.voucherItemList.forEach((item) => {
          item.transactionID = 0;
          item.fromCoaStructBalance=item.fromCoaStructBalance||0;
        });
        this.setCodeGenProperty();
      } else {
        this.contraVoucherModel.editUserID = this.userInfo.userPKID;
      }
    } catch (error) {
      throw error;
    }
  }

  referenceDocRequirement(){
    try {
      let invalid=false;

      this.contraVoucherModel.voucherItemList.forEach((item)=>{
        let transactionNatureCode=this.coaStructureList.find(x=>x.id==item.fromCOAStructID).transactionNatureCode;
          if(transactionNatureCode==FixedIDs.transactionNatureCd.bankNature.code && !item.voucherItemAttachmentList.length){
            invalid=true;
          }
      });

      return invalid;
    } catch (error) {
      throw error;
    }
  }

  checkEntryEditValidity() {
    try {
      let isInvalid = false;
      let message = "";
  
      const { financialYearMinDate, financialYearMaxDate, contraVoucherModel, validityVoucherEntryEdit } = this;
      const { voucherDate, orgID, projectID, id } = contraVoucherModel;
  
      if (financialYearMinDate && financialYearMaxDate) {
        if (!(financialYearMinDate <= voucherDate && financialYearMaxDate >= voucherDate)) {
          isInvalid = true;
          message = "2261";
          return { isInvalid, message };
        }
      }
  
      const lockEntryEdit = validityVoucherEntryEdit?.find((x) =>
        (!orgID || x.orgID == orgID) &&
        (!projectID || x.projectID == projectID)
      );
  
      if (lockEntryEdit) {
        const lockEntryTillDate = new Date(lockEntryEdit.lockEntryTillDate);
        const lockEditTillDate = new Date(lockEntryEdit.lockEditTillDate);
        const voucherDateObj = new Date(voucherDate);
  
        const isEntryable = lockEntryTillDate ? voucherDateObj > lockEntryTillDate : true;
        const isEditable = lockEditTillDate ? voucherDateObj > lockEditTillDate : true;
  
        if (!isEntryable && !id) {           
          message = "2274";
          isInvalid = true;
          return { isInvalid, message };
        }
        if (!isEditable && id) {           
          message = "2277";
          isInvalid = true;
          return { isInvalid, message };
        }
      }
  
      return { isInvalid, message };
    } catch (error) {
      throw error;
    }
  }
  
  setTempVoucher(model) {
    try {
      this.tempVoucherModel = new VoucherModel(model);
    } catch (error) {
      throw error;
    }
  }


  prepareDataForEdit(data: any) {
    try {      
      const model = data;
      if (model.isMultiEntry) {
        this.contraVoucherModel = new VoucherModel(model);
        this.contraVoucherModel.id = model.id;
        this.contraVoucherModel.voucherDate = new Date(model.voucherDate);
        this.contraVoucherModel.company = model.company;
        this.contraVoucherModel.dateID = model.dateID;
        this.contraVoucherModel.voucherTypeCd = model.voucherTypeCd;
        this.contraVoucherModel.companyID = model.companyID;
        this.contraVoucherModel.orgID = model.orgID;
        this.contraVoucherModel.voucherNo = model.voucherNo;
        this.contraVoucherModel.remarks = model.remarks;
        this.contraVoucherModel.createdByID = model.createdByID;
        this.contraVoucherModel.approvedByID = model.approvedByID;
        this.contraVoucherModel.approvalStatus = model.approvalStatus;
        this.contraVoucherModel.isMultiEntry = model.isMultiEntry;
        this.contraVoucherModel.voucherTitleCd = model.voucherTitleCd;
        this.contraVoucherModel.isDraft = model.isDraft;
        this.contraVoucherModel.isActive = model.isActive;
        this.contraVoucherModel.insertUserID =  model.createdByID;
        this.contraVoucherModel.insertDateTime = new Date(model.insertDateTime);

        this.contraVoucherModel.voucherItemList.forEach((item: any) => {
          item.id = item.voucherItemID;
          item.imageFileUploadOpton = imageFileUploadOption();
          if(item.voucherItemAttachmentList.length){
            const voucherItemAttachmentList= item.voucherItemAttachmentList;
                item.voucherItemAttachmentList=[];
                voucherItemAttachmentList.forEach((atch)=>{
                  const fileAttach = new VoucherAttachment();
                  fileAttach.fileName = atch.fileName;
                  fileAttach.folderName = "voucher";
                  fileAttach.id = atch.voucherItemAttachmentID;
                  fileAttach.voucherItemID = atch.voucherItemID;
                  item.voucherItemAttachmentList.push(fileAttach);
                });
          }

          if(item.chequeDate)     
            item.chequeDate=new Date(item.chequeDate); 

          item.fromCOAStructID = item.fromCOAStructID;
          item.toCOAStructID = item.toCOAStructID;

          if(item.chequeLeafID)
          {
            let data = {
              id: item.chequeLeafID, 
              name: item.chequeLeafNo, 
              companyID: this.contraVoucherModel.companyID,
              orgID: this.contraVoucherModel.orgID,
              projectID: this.contraVoucherModel.projectID,
              cOAStructureID: item.fromCOAStructID
            }
            
            this.chequeLeafNoList.push(data);
            //this.tempChequeLeafNoList.push(data);
            //this.utilitySvc.deletedDataPushInDdl(item.chequeLeafID, item.chequeLeafNo, 'id', 'name', this.chequeLeafNoList);
          }
        
        });
      } 
    } catch (error) {
      throw error;
    }
  }

  

  prepareDataModelMultiEntry(data) {
    try {
      this.contraVoucherModel = new VoucherModel(data);
      this.contraVoucherModel.id = data.id;
      this.contraVoucherModel.voucherDate = new Date(data.voucherDate);
      this.contraVoucherModel.company = data.company;
      this.contraVoucherModel.dateID = data.dateID;
      this.contraVoucherModel.voucherTypeCd = data.voucherTypeCd;
      this.contraVoucherModel.companyID = data.companyID;
      this.contraVoucherModel.orgID = data.orgID;
      this.contraVoucherModel.projectID = data.projectID;
      this.contraVoucherModel.voucherNo = data.voucherNo;
      this.contraVoucherModel.remarks = data.remarks;
      this.contraVoucherModel.createdByID = data.createdByID;
      this.contraVoucherModel.approvedByID = data.approvedByID;
      this.contraVoucherModel.approvalStatus = data.approvalStatus;
      this.contraVoucherModel.isMultiEntry = data.isMultiEntry;
      this.contraVoucherModel.voucherTitleCd = data.voucherTitleCd;
      this.contraVoucherModel.isDraft = data.isDraft;
      this.contraVoucherModel.isActive = data.isActive;
      this.contraVoucherModel.insertDateTime=new Date(data.insertDateTime);
      this.contraVoucherModel.voucherItemList.forEach(
        (item: VoucherItemModel) => {
          item.voucherItemID=item.id;
          item.imageFileUploadOpton = imageFileUploadOption();
          if(item.chequeDate)
          item.chequeDate = new Date(item.chequeDate);

          this.prepareChequeLeafNo(item);

          this.filterCOAStructure(item,this.contraVoucherModel.orgID,this.contraVoucherModel.projectID);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  prepareDataAfterSave(data) {
    try {
    
        this.prepareDataModelMultiEntry(data);
        this.tempVoucherModel=JSON.stringify(GlobalMethods.deepClone(this.contraVoucherModel));
    } catch (error) {
      throw error;
    }
  }

  onDebitFieldChange(entity) {
    try {
      if (entity.debitVal > 0) entity.creditVal = 0;
      
    } catch (error) {
      throw error;
    }
  }

  checkSubLedgerFromAccount(entity: any) {
    try {
      if (
        entity.fromCOAStructID == entity.toCOAStructID &&
        entity.fromSubLedgerDetailID == entity.toSubLedgerDetailID
      ) {
        entity.fromSubLedgerDetailID = null;
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerFromAccount(entity: any, balance) {
    try {
      entity.toSubledgerBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerFromAccountMulti(entity: any, balance) {
    try {
      entity.toSubledgerBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  checkSubLedgerToAccount(entity: any) {
    try {
      if (
        entity.fromCOAStructID == entity.toCOAStructID &&
        entity.fromSubLedgerDetailID == entity.toSubLedgerDetailID
      ) {
        entity.toSubLedgerDetailID = null;
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerToAccount(entity: any, balance) {
    try {
      entity.toSubLedgerBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  setSubLedgerToAccountMulti(entity: any, balance) {
    try {
      entity.toSubLedgerBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  onSelectFromAccount(item, balance) {
    try {
      this.setFromAccountBalance(item, balance);
    } catch (error) {
      throw error;
    }
  }

  setFromAccountBalance(item, balance) {
    try {
      item.fromCoaStructBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  onSelectToAccount(item, balance) {
    try {
      this.setToAccountBalance(item, balance);
    } catch (error) {
      throw error;
    }
  }

  setToAccountBalance(item, balance) {
    try {
      item.toAccountBalance = balance || 0;
    } catch (error) {
      throw error;
    }
  }

  onSelectFromAccountMulti(item: VoucherItemModel, balance) {
    try {
      item.fromCoaStructBalance = balance;
    } catch (error) {
      throw error;
    }
  }

  onSelectToAccountMulti(item: VoucherItemModel, balance) {
    try {
      item.toAccountBalance = balance || 0;     
    } catch (error) {
      throw error;
    }
  }


  

  prepareOrgList(res) {
    try {
      this.rawOrgList=res;

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
      this.orgList = orgList || [];
      this.setSingleORG();
    } catch (error) {
      throw error;
    }
  }
  rawOrgList:any=[];
  setSingleORG(){
    if(this.rawOrgList.length==1 && this.isBranchModuleActive){
      this.contraVoucherModel.orgID=this.rawOrgList[0].id;
    }
  }
  fileManagement(item: VoucherItemModel) {
    try {
      item.voucherItemAttachmentList.forEach((attach) => {
        if (attach.tag == 2) {
          attach.deletedFileName = attach.fileName;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  resetVoucherItemOnOfficeOrProjectChange() {
    try {
      this.contraVoucherModel.voucherItemList.forEach(
        (item: VoucherItemModel) => {
          this.resetSingleVoucherItem(item);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  resetSingleVoucherItem(item: any) {
    try {
      item.toSubLedgerDetailList = [];
      item.fromSubLedgerDetailList = [];
      item.fromCoaStructBalance = 0;
      item.fromSubLedgerDetailID = null;
      item.fromSubLedgerTypeID = null;
      item.toSubledgerBalance = 0;
      item.toAccountBalance = 0;
      item.toSubLedgerDetailID = null;
      item.toSubLedgerTypeID = null;
      item.toSubledgerBalance = 0;
      item.transactionID = null;
      item.chequeNo = null;
      item.chequeDate = null;
      item.clearedOnDate = null;
      item.description = null;
      item.invoiceBillRefNo = null;
      item.voucherItemAttachmentList = [];
      item.creditVal = null;
      item.debitVal = null;
      item.projectID = null;
    } catch (error) {
      throw error;
    }
  }

  /// Voucher List Start 
        
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
    
      setNewSearchParam(){ 
        try {
          let currentDate = new Date(GlobalConstants.serverDate);
          this.searchParam = {
            voucherTypeCD: FixedIDs.voucherType.ContraVoucher.code,
            companyName:this.userInfo.company, 
            companyID: this.userInfo.companyID, 
            fromDate : currentDate, 
            toDate : currentDate, 
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
            toLedger:null, 
            toSubLedgerType:null, 
            toSubLedgerDetail:null, 
            debitVal:null, 
            creditVal:null, 
            invoiceBillRefNo:null, 
            createdBy:null, 
            lastUpdate:null, 
            editedBy:null, 
            draftStatus:null };
        } catch (e) {
          throw e;
        }
      }
    
      prepareVoucherList(data:any)
      {
        try {
          let id = 0;
          data.forEach(item => {
            item.isShowActionBtn = false;
            if(item.id != id)
            {
              item.isShowActionBtn = true;
              id = item.id;
            }
          });
          return data;
        } catch (e) {
          throw e;
        }
      }
    
    
      prepareOfficeBranchUnitList(res) {
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
            } else if (item.value == "Unit") {
              //5 Unit
              let objUnit = orgList.find((x) => x.value == "unit");
              if (objUnit) {
                objUnit.items.push(item);
              }
            }
          });
          this.officeBranchUnitList = orgList || [];
        } catch (error) {
          throw error;
        }
      }
    
      prepareFilterValue(filters:any){
        try {
          this.searchParam.toLedger = filters['toLedger'][0].value;
          this.searchParam.debitVal = filters['debitVal'][0].value;
          this.searchParam.creditVal = filters['creditVal'][0].value;
          this.searchParam.createdBy = filters['createdBy'][0].value;
          this.searchParam.editedBy = filters['editedBy'][0].value;
          this.searchParam.draftStatus = filters['draftStatus'][0].value;
        } catch (e) {
          throw e;
        }
      }
    
      prepareSearchParams(){
        try {
          let searchParams = [];
          if(this.searchParam.orgID) searchParams.push(this.keyValuePair('orgID', this.searchParam.orgID || null));
          if(this.searchParam.projectID) searchParams.push(this.keyValuePair('projectID', this.searchParam.projectID || null));
          if(this.searchParam.voucherNo) searchParams.push(this.keyValuePair('voucherNo', this.searchParam.voucherNo || null));
          if(this.searchParam.toLedger) searchParams.push(this.keyValuePair('toLedger', this.searchParam.toLedger || null));
          if(this.searchParam.debitVal) searchParams.push(this.keyValuePair('debitVal', this.searchParam.debitVal || null));
          if(this.searchParam.creditVal) searchParams.push(this.keyValuePair('creditVal', this.searchParam.creditVal || null));
          if(this.searchParam.createdBy) searchParams.push(this.keyValuePair('createdBy', this.searchParam.createdBy || null));
          if(this.searchParam.editedBy) searchParams.push(this.keyValuePair('editedBy', this.searchParam.editedBy || null));
          if(this.searchParam.draftStatus) searchParams.push(this.keyValuePair('draftStatus', this.searchParam.draftStatus || null));
          
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
    
      deleteCollection(entity: any) {
        try {
          let data = this.contraVourcherList.filter(x => x.id == entity.id);
    
          data.forEach(entity => {
            this.utilitySvc.deleteCollection(this.contraVourcherList, entity);
          }); 
    
        } catch (e) {
          throw e;
        }
      }

      filterCOAStructure(item,orgID=null,projectID=null){
        try {
          //Coa Struct Start
          let transactionNature=[{
            code:FixedIDs.transactionNatureCd.bankNature.code
          },{
            code:FixedIDs.transactionNatureCd.cashNature.code
          }];
            
          item.toCoaStructureList = this.coaStructureList.filter((x) => {
            // Check if the code exists in transactionNature
            return x.orgID==orgID && x.projectID==projectID && transactionNature.some(tn => tn.code === x.transactionNatureCode);
          });

          //Make selected if there are only a item
          if(item.toCoaStructureList.length==1){
            item.toCOAStructID=item.toCoaStructureList[0].id;
          }

          item.fromCoaStructureList = this.coaStructureList.filter((x) => {
            // Check if the code exists in transactionNature
            return  x.orgID==orgID && x.projectID==projectID && transactionNature.some(tn => tn.code === x.transactionNatureCode);
          });
          
          //Make selected if there are only a item
          if(item.fromCoaStructureList.length==1){          
              item.fromCOAStructID=item.fromCoaStructureList[0].id;
          }
        } catch (e) {
          throw e;
        }
      }
      public getFromCoaStructureByOrgAndProject(item: any) {
        let coaList = this.contraVoucherModel.fromCoaStructureList.filter(x => 
          (!item.orgID || x.orgID === item.orgID) && 
          (!item.projectID || x.projectID === item.projectID)
        );
        return coaList;
      }
      public getToCoaStructureByOrgAndProject(item: any) {
        let coaList = this.contraVoucherModel.toCoaStructureList.filter(x => 
          (!item.orgID || x.orgID === item.orgID) && 
          (!item.projectID || x.projectID === item.projectID)
        );
        return coaList;
      }

      public hasValidBranchProject() {
        try {
          let isInValid=false;
          if(this.isBranchModuleActive && !this.contraVoucherModel.orgID){
            isInValid=true;
          }
          return isInValid;
        } catch (error) {
          throw error;
          
        }
      }
      comOrgAcceptNegativeList:any=[];
      checkCashNatureNegativeAcceptanceValidity(){
        try {
          let isInValid=false;
          const {companyID,orgID}=this.contraVoucherModel;
          let isNegativeBalanceAcceptance=false;
          const ngtvBlncAcctnce=this.comOrgAcceptNegativeList.find(x=>x.companyID==companyID && orgID?(x.orgID==orgID):true);
          if(ngtvBlncAcctnce){
            isNegativeBalanceAcceptance=ngtvBlncAcctnce.isNegativeBalanceAcceptance;
          }
    
          if(!isNegativeBalanceAcceptance){           
            this.contraVoucherModel.voucherItemList.filter((item:VoucherItemModel)=>{
              let transactionNatureObj=item.fromCoaStructureList.find(x=>x.id==item.fromCOAStructID);
              let fromCoaStructBalance=item.fromCoaStructBalance;
              if(transactionNatureObj){
                if(transactionNatureObj.transactionNatureCode==FixedIDs.transactionNatureCd.cashNature.code){
                  const totalValue=this.contraVoucherModel.voucherItemList.reduce((init,curr)=>init + (+curr.debitVal),0);
                  const calValue=fromCoaStructBalance>0?(fromCoaStructBalance-totalValue):(fromCoaStructBalance+totalValue);
                  if(calValue<0){
                    isInValid=true;
                  }
                }
              }
            })
            
          }  
    
          return isInValid;
        } catch (error) {
          throw error;
        }
      }
    
      prepareCompanyOrgNgtvAcceptanceList(data){
        try {
          this.comOrgAcceptNegativeList=data[0];
        } catch (error) {
         throw error; 
        }
      }
      
      checkDataValidityForMultiEntry() {
        try {
          let isInvalid = false;
        
          let index = 0;
          const items = this.contraVoucherModel.voucherItemList;
    
          while (!isInvalid && index < items.length) {
            const item = items[index];
            if (
              item.toCOAStructID === item.fromCOAStructID 
            ) {
              isInvalid = true;
              
            }
    
            index++;
          }
    
          return isInvalid;
        } catch (error) {
          throw error;
        }
      }

  prepareChequeLeafNo(entity?: any){
    try {
      const dto = this.contraVoucherModel;
      const { companyID, orgID, projectID } = dto;
      let cOAStructureID = entity.fromCOAStructID;

      if (companyID) {
        let filteredList = this.chequeLeafNoList.filter(item => {
          if(!this.isBranchModuleActive)
          {
            return item.companyID === companyID &&
            item.orgID == companyID &&
            (item.cOAStructureID) === (cOAStructureID);
          }
          else
          {
            return item.companyID === companyID &&
            ((orgID == null && item.orgID == null) || (orgID != null && item.orgID === orgID)) &&
            ((projectID == null && item.projectID == null) || (projectID != null && item.projectID === projectID)) &&
            (item.cOAStructureID) === (cOAStructureID);
          }
        });

        entity.chequeLeafNoList = filteredList;
      }
    } catch (error) {
      throw error;
    }
  }
}
