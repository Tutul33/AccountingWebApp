import { Injectable } from '@angular/core';
import { FixedIDs, GlobalMethods, UtilityService } from '../../index';
import { OrgCashConfigDTO, AccountDestinationDTO, SubLedgerTypeDTO, TransactionModeDTO, VoucherNotificationDTO, ProjectBranchDTO, VoucherCategoryDTO } from '../../models/business-config/business-config.model';
import { AccountingConfig } from '../../config';


@Injectable()
export class BusinessConfigModelService {

  isBranchModuleActive: boolean = false;
  
  accountDestinationList: any = [];
  tempaccountDestinationList: any = [];
  accountDestinationDTOList: AccountDestinationDTO[] = [];


  accountHeadList: any = [];
  tempAccountHeadList: any = [];
  isSkipped: boolean = false;
  isCOA: boolean = false;
  code: number = 0;
  accountHeadLevel: number = 0;


  subLedgerTypeDTO: SubLedgerTypeDTO;
  tempSubLedgerTypeDTO: SubLedgerTypeDTO;
  subLedgerTypeList: any = [];
  subLedgerTypeSourceList: any = [];


  transactionModeDTO: TransactionModeDTO;
  tempTransactionModeDTO: TransactionModeDTO;
  transactionModeList: any = [];
  isCodeEntryDisabled: boolean = false;


  voucherNotificationList: any = [];
  voucherCode: number = null;
  voucherNotificationDTO: VoucherNotificationDTO;
  tempVoucherNotificationDTO: VoucherNotificationDTO;

  voucherListForBizConfig: any = [];
  projectBranchList: any = [];
  keyCode: string = null;
  projectBranchDTO: ProjectBranchDTO;
  tempProjectBranchDTO: ProjectBranchDTO;

  sMSType: any = {
    SendSMSAuto: 1,
    SendSMSManual: 2
  };

  voucherCategoryDTO: VoucherCategoryDTO;
  tempVoucherCategoryDTO: VoucherCategoryDTO;
  voucherCategoryList: any = [];
  voucherList: any = [];


  orgCashConfigDTO: OrgCashConfigDTO;
  tempOrgCashConfigDTO: OrgCashConfigDTO;
  companyList: any = [];
  officeBranchUnitList: any = [];
  projectList: any = [];
  orgCashConfigList: any = [];
  companyBranchList: any = [];


  chequeLeafStatusList: any = [];
  chequeStatusNotifyList: any = [];
  tempChequeStatusNotifyList: any = [];
  
  constructor(private utilitySvc: UtilityService) { }

  prepareDestinationDefine(entity: any)
  {
    try {
      this.accountDestinationDTOList = [];
      this.tempaccountDestinationList = [];

      let obj = new AccountDestinationDTO();

      obj.id = entity.id;
      obj.destinationCode = entity.destinationCode;
      obj.isActive = entity.isActive;
      obj.isDefault = entity.isDefault;

      if(obj.id > 0)
      {
        obj.tag = FixedIDs.objectState.modified;
      }

      this.accountDestinationDTOList.push(obj);

    } catch (error) {
      throw error;
    }
  }

  prepareAccountHeadData()
  {
    try {
      this.accountHeadLevel = this.accountHeadList.length;

      if(this.accountHeadLevel <= FixedIDs.AccountHeadLevel.Controlledger)
      {
        this.isSkipped = true;
      }

    } catch (error) {
      throw error;
    }
  }

  getSubLedgerTypeSourceCd(){
    try {
      this.subLedgerTypeSourceList = [];

      Object.keys(AccountingConfig.subLedgerTypeSourceCd).forEach((key) => {
        const code = AccountingConfig.subLedgerTypeSourceCd[key];
        this.subLedgerTypeSourceList.push({
          value: key,
          code: code,
        });
      });
    } catch (error) {
      throw error;
    }
  }

  prepareSubLedgerTypeEditForm(entity: any) {
    try {
      this.subLedgerTypeDTO = new SubLedgerTypeDTO(entity);
      this.tempSubLedgerTypeDTO = new SubLedgerTypeDTO(entity);
    } catch (e) {
      throw e;
    }
  }

  deleteSubLedgerTypeCollection(entity: SubLedgerTypeDTO) {
    try {
      this.utilitySvc.deleteCollection(this.subLedgerTypeList, entity);
    } catch (e) {
      throw e;
    }
  }

  prepareTransactionModeEditForm(entity: any) {
    try {
      this.transactionModeDTO = new TransactionModeDTO(entity);
      this.tempTransactionModeDTO = new TransactionModeDTO(entity);

      this.isCodeEntryDisabled = true;
    } catch (e) {
      throw e;
    }
  }

  deleteTransactionModeCollection(entity: TransactionModeDTO) {
    try {
      this.utilitySvc.deleteCollection(this.transactionModeList, entity);
    } catch (e) {
      throw e;
    }
  }

  prepareVoucherNotificationSaveData()
  {
    try {
      this.voucherNotificationList.forEach((e)=> {
        if(e.voucherCode == this.voucherCode)
        {
          this.voucherNotificationDTO = new VoucherNotificationDTO();
          this.voucherNotificationDTO.id = e.id;
          this.voucherNotificationDTO.voucherCode = e.voucherCode;
          this.voucherNotificationDTO.sendSMSAuto = e.sendSMSAuto;
          this.voucherNotificationDTO.sendSMSManual = e.sendSMSManual;
          if(e.sendSMSAuto)
          {
            if(e.voucherCode == FixedIDs.voucherType.DebitVoucher.code)
            {
              this.voucherNotificationDTO.sMSTypeDR = this.sMSType.SendSMSAuto;
            }
            else if(e.voucherCode == FixedIDs.voucherType.CreditVoucher.code)
            {
              this.voucherNotificationDTO.sMSTypeCR = this.sMSType.SendSMSAuto;
            }
          }
          else if(e.sendSMSManual)
          {
            if(e.voucherCode == FixedIDs.voucherType.DebitVoucher.code)
            {
              this.voucherNotificationDTO.sMSTypeDR = this.sMSType.SendSMSManual;
            }
            else if(e.voucherCode == FixedIDs.voucherType.CreditVoucher.code)
            {
              this.voucherNotificationDTO.sMSTypeCR = this.sMSType.SendSMSManual;
            }
          }

          this.tempVoucherNotificationDTO = new VoucherNotificationDTO();
          this.tempVoucherNotificationDTO.id = e.id;
          this.tempVoucherNotificationDTO.voucherCode = e.voucherCode;
          this.tempVoucherNotificationDTO.sendSMSAuto = e.sendSMSAuto;
          this.tempVoucherNotificationDTO.sendSMSManual = e.sendSMSManual;
          if(e.sendSMSAuto)
          {
            if(e.voucherCode == FixedIDs.voucherType.DebitVoucher.code)
            {
              this.tempVoucherNotificationDTO.sMSTypeDR = this.sMSType.SendSMSAuto;
            }
            else if(e.voucherCode == FixedIDs.voucherType.CreditVoucher.code)
            {
              this.tempVoucherNotificationDTO.sMSTypeCR = this.sMSType.SendSMSAuto;
            }
          }
          else if(e.sendSMSManual)
          {
            if(e.voucherCode == FixedIDs.voucherType.DebitVoucher.code)
            {
              this.tempVoucherNotificationDTO.sMSTypeDR = this.sMSType.SendSMSManual;
            }
            else if(e.voucherCode == FixedIDs.voucherType.CreditVoucher.code)
            {
              this.tempVoucherNotificationDTO.sMSTypeCR = this.sMSType.SendSMSManual;
            }
          }
        }
      });
    } catch (error) {
      throw(error);
    }
  }

  prepareDataBeforeSave() {
    try {
      if(this.voucherNotificationDTO.sMSTypeDR)
      {
        this.manageDebitData();
      }
      if(this.voucherNotificationDTO.sMSTypeCR)
      {
        this.manageCreditData();
      }
    } catch (error) {
      throw(error);
    }
  }

  manageDebitData() {
    try {
      if(this.voucherNotificationDTO.sMSTypeDR == this.sMSType.SendSMSAuto)
      {
        this.voucherNotificationDTO.sendSMSAuto = true;
      }
      else
      {
        this.voucherNotificationDTO.sendSMSAuto = false;
      }
      if(this.voucherNotificationDTO.sMSTypeDR == this.sMSType.SendSMSManual)
      {
        this.voucherNotificationDTO.sendSMSManual = true;
      }
      else
      {
        this.voucherNotificationDTO.sendSMSManual = false;
      }
    } catch (error) {
      throw(error);
    }
  }
  manageCreditData() {
    try {
      if(this.voucherNotificationDTO.sMSTypeCR == this.sMSType.SendSMSAuto)
      {
        this.voucherNotificationDTO.sendSMSAuto = true;
      }
      else
      {
        this.voucherNotificationDTO.sendSMSAuto = false;
      }

      if(this.voucherNotificationDTO.sMSTypeCR == this.sMSType.SendSMSManual)
      {
        this.voucherNotificationDTO.sendSMSManual = true;
      }
      else
      {
        this.voucherNotificationDTO.sendSMSManual = false;
      }
    } catch (error) {
      throw(error);
    }
  }
  updateVoucherListCollection(entity: VoucherNotificationDTO) {
    try { 
      this.utilitySvc.updateCollection(this.voucherNotificationList, entity);
    } catch (e) {
      throw e;
    }
  }


  prepareProjectBranchSavedData()
  {
    try {
      this.projectBranchDTO = new ProjectBranchDTO();
      this.tempProjectBranchDTO = new ProjectBranchDTO();

      this.projectBranchList.forEach((e)=> {
        this.projectBranchDTO.id = e.id;
        if(e.keyCode == "IBMA")
        {
          this.projectBranchDTO.keyCodeBranch = e.keyCode;
          this.projectBranchDTO.isBranchModuleActive = e.isActive;
        }
        else if(e.keyCode == "IPMA")
        {
          this.projectBranchDTO.keyCodeProject = e.keyCode;
          this.projectBranchDTO.isProjectModuleActive = e.isActive;
        } 

        
        this.tempProjectBranchDTO.keyCode = e.keyCode;
        if(e.keyCode == "IBMA")
        {
          this.tempProjectBranchDTO.keyCodeBranch = e.keyCode;
          this.tempProjectBranchDTO.isBranchModuleActive = e.isActive;
        }
        else if(e.keyCode == "IPMA")
        {
          this.tempProjectBranchDTO.keyCodeProject = e.keyCode;
          this.tempProjectBranchDTO.isProjectModuleActive = e.isActive;
        } 
      });
    } catch (error) {
      throw(error);
    }
  }

  prepareProjectBranchDataBeforeSave() {
    try {
      if(this.keyCode == "IBMA")
      {
        this.projectBranchDTO.isActive = this.projectBranchDTO.isBranchModuleActive;
      }
      if(this.keyCode == "IPMA")
      {
        this.projectBranchDTO.isActive = this.projectBranchDTO.isProjectModuleActive;
      }
    } catch (error) {
      throw(error);
    }
  }

  updateProjectBranchListCollection(entity: ProjectBranchDTO) {
    try { 
      this.utilitySvc.updateCollection(this.projectBranchList, entity);
    } catch (e) {
      throw e;
    }
  }

  getVoucherList(){
    try {
      this.voucherList = [];

      Object.keys(FixedIDs.voucherType).forEach((key) => {
        const code = FixedIDs.voucherType[key].code;
        this.voucherList.push({
          value: FixedIDs.voucherType[key].value,
          code: code,
        });
      });
    } catch (error) {
      throw error;
    }
  }

  prepareVoucherCategoryEditForm(entity: any) {
    try {
      this.voucherCategoryDTO = new VoucherCategoryDTO(entity);
      this.tempVoucherCategoryDTO = new VoucherCategoryDTO(entity);
    } catch (e) {
      throw e;
    }
  }

  deleteVoucherCategoryCollection(entity: VoucherCategoryDTO) {
    try {
      this.utilitySvc.deleteCollection(this.voucherCategoryList, entity);
    } catch (e) {
      throw e;
    }
  }

  public hasValidBranchProject() {
    try {
      let isInValid = false;
      if(this.isBranchModuleActive && !this.orgCashConfigDTO.unitBranchID){
        isInValid = true;
      }
      return isInValid;
    } catch (error) {
      throw error;
      
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

  prepareOrgCashConfigDataBeforeSave() {
    try {
      if(this.orgCashConfigDTO.unitBranchID != null)
      {
        this.orgCashConfigDTO.orgID = this.orgCashConfigDTO.unitBranchID;
      }
      else
      {
        this.orgCashConfigDTO.orgID = this.orgCashConfigDTO.companyID;
      }
    } catch (e) {
      throw e;
    }
  }

  prepareOrgCashConfigEditForm(entity: any) {
    try {
      this.orgCashConfigDTO = new OrgCashConfigDTO(entity);
      this.tempOrgCashConfigDTO = new OrgCashConfigDTO(entity);
    } catch (e) {
      throw e;
    }
  }

  deleteOrgCashConfigCollection(entity: OrgCashConfigDTO) {
    try {
      this.utilitySvc.deleteCollection(this.orgCashConfigList, entity);
    } catch (e) {
      throw e;
    }
  }

  updateOrgCashConfigCollection(entity: OrgCashConfigDTO) {
    try {
      this.utilitySvc.deleteCollection(this.companyBranchList, entity);
    } catch (e) {
      throw e;
    }
  }

  prepareCashBalanceListData() {
    try {
      this.companyBranchList.forEach(element => {
        this.orgCashConfigList.forEach(e => {
          if(element.orgID == e.orgID)
          {
            element.id = e.id;
            element.isNegativeBalanceAllowed = e.isNegativeBalanceAllowed;
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  checkChangeData(entity: any) {
    try {
      let data = this.tempChequeStatusNotifyList.find(x => x.id == entity.id);
      if(data.value != entity.value || data.isActive != entity.isActive)
      {
        return true;
      }
      else
      {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }
  
  modifyAfterSave(entity: any) {
    try {
      const index = this.tempChequeStatusNotifyList.findIndex(x => x.id === entity.id);
      if (index !== -1) {
        this.tempChequeStatusNotifyList[index] = GlobalMethods.jsonDeepCopy(entity);
      }
    } catch (error) {
      throw error;
    }
  }
  
}
