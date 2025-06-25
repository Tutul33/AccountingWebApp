import { Injectable } from '@angular/core';
import { UtilityService } from '../../index';
import { GlobalMethods } from 'src/app/shared';
import { LockVoucherDTO } from '../../models/lock-voucher-edit-or-entry/lock-voucher.model';

@Injectable()
export class LockVoucherEditOrEntryModelService {

  isBranchModuleActive: boolean = false;
  lockVoucherDTO: LockVoucherDTO;
  tempLockVoucherDTO: LockVoucherDTO;
  lockVoucherList: any = [];

  companyList: any = [];
  orgList: any = [];
  projectList: any = [];
  companyNameDDList: any = [];
  orgNameDDList: any = [];
  projectNameDDList: any = [];

  isCompanyDisabled: boolean = false;
  isOfficeDisabled: boolean = false;
  isProjectDisabled: boolean = false;

  constructor(private utilitySvc: UtilityService) { }

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
        } else if (item.value == "Unit") {
          //5 Unit
          let objUnit = orgList.find((x) => x.value == "unit");
          if (objUnit) {
            objUnit.items.push(item);
          }
        }
      });
      this.orgList = orgList || [];
    } catch (error) {
      throw error;
    }
  }

  prepareEditForm(entity: any) {
    try {
      const fromParts = entity.fromDate.split('/'); 
      entity.lockEntryTillDate = new Date(
        parseInt(fromParts[2], 10),
        parseInt(fromParts[1], 10) - 1, // Month (0-indexed)
        parseInt(fromParts[0], 10) 
      );

      const toParts = entity.toDate.split('/'); 
      entity.lockEditTillDate = new Date(
        parseInt(toParts[2], 10), 
        parseInt(toParts[1], 10) - 1, // Month (0-indexed)
        parseInt(toParts[0], 10) 
      );

      this.lockVoucherDTO = new LockVoucherDTO(GlobalMethods.jsonDeepCopy(entity));
      this.tempLockVoucherDTO = new LockVoucherDTO(GlobalMethods.jsonDeepCopy(entity));

      if (this.lockVoucherDTO.lockEntryTillDate && typeof this.lockVoucherDTO.lockEntryTillDate === 'string') {
        this.lockVoucherDTO.lockEntryTillDate = new Date(this.lockVoucherDTO.lockEntryTillDate);
        this.tempLockVoucherDTO.lockEntryTillDate = new Date(this.lockVoucherDTO.lockEntryTillDate);
      }
  
      if (this.lockVoucherDTO.lockEditTillDate && typeof this.lockVoucherDTO.lockEditTillDate === 'string') {
        this.lockVoucherDTO.lockEditTillDate = new Date(this.lockVoucherDTO.lockEditTillDate);
        this.tempLockVoucherDTO.lockEditTillDate = new Date(this.lockVoucherDTO.lockEditTillDate);
      }

      this.isCompanyDisabled = true;
      this.isOfficeDisabled = true;
      this.isProjectDisabled = true;

    } catch (e) {
      throw e;
    }
  }

  checkDuplicate(entity: LockVoucherDTO) {
    try {
      let isDuplicate = false;
      if (entity.id === 0) {

        if(entity.orgName == "")
        {
          entity.orgName = null
        }
        if(this.lockVoucherList.length > 0)
        {
          let data = this.lockVoucherList.find(x => x.companyName == entity.companyName && x.orgName == entity.orgName);

          if(data != null || data != undefined)
          {
            isDuplicate = true;
          }
        }
      }
      return isDuplicate; 
    } catch (e) {
      throw e;
    }
  }
  
  

  updateCollection(entity: any, isEdit: boolean) {
    try {
      if (isEdit) {
        this.utilitySvc.updateCollection(this.lockVoucherList, entity);
      } else {
        this.lockVoucherList.push(entity);
      }
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(entity: any) {
    try {
      this.utilitySvc.deleteCollection(this.lockVoucherList, entity);
    } catch (e) {
      throw e;
    }
  }
}
