import { Injectable } from '@angular/core';
import { GridOption, UtilityService } from '../../index';
import { Config, FileUploadOption, GlobalConstants, GlobalMethods } from 'src/app/shared';
import { SubLedgerDTO } from '../../models/sub-ledger/sub-ledger.model';

@Injectable()
export class SubLedgerModelService {

  subLedgerDTO: SubLedgerDTO;
  tempSubLedgerDTO: SubLedgerDTO;
  subLedgerList: any = [];
  subLedgerTypeList: any = [];
  subLedgerDDList: any = [];
  subLedgerTypeDDList: any = [];
  subLedgerEmailDDList: any = [];
  subLedgerMobileDDList: any = [];

  constructor(private utilitySvc: UtilityService) { }

  prepareEditForm(entity: any) {
    try {
      this.subLedgerDTO = new SubLedgerDTO(GlobalMethods.jsonDeepCopy(entity));
      this.tempSubLedgerDTO = new SubLedgerDTO(GlobalMethods.jsonDeepCopy(entity));
    } catch (e) {
      throw e;
    }
  }

  checkDuplicate(entity: SubLedgerDTO) {
    try {
      let isDuplicate;

      if (entity.id == 0) {
        isDuplicate = this.utilitySvc.checkDuplicateEntry(this.subLedgerList, entity, 'name', 'subLedgerType');
      }

      if (!isDuplicate) return false;
      else return true;
    }
    catch (e) {
      throw e;
    }
  }

  updateCollection(entity: any, isEdit: boolean) {
    try {
      if (isEdit) {
        this.utilitySvc.updateCollection(this.subLedgerList, entity);
      } else {
        this.subLedgerList.push(entity);
      }
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(entity: any) {
    try {
      this.utilitySvc.deleteCollection(this.subLedgerList, entity);
    } catch (e) {
      throw e;
    }
  }

  //for upoad
  fileUpload: any;
  fileOption = new FileUploadOption();

  fileUploadOption() {
    try {
      this.fileOption.isMultipleSelection = false;
      this.fileOption.isMultipleUpload = false;
      this.fileOption.uploadServiceUrl = "File/UploadFiles";
      this.fileOption.acceptedFiles = '.csv,.xlsx,.xls';
      this.fileOption.folderName = Config.imageFolders.subLedger;
      this.fileOption.fileTick = GlobalMethods.timeTick() + 1;
      return this.fileOption;
    } catch (error) {

    }

  }

  newFileInfo: any;
  configFilePath() {
    try {
      this.newFileInfo = GlobalMethods.deepClone<any>(this.fileOption);
      this.newFileInfo.id = 0;
      this.newFileInfo.isThumbnailFormat = true;
      this.newFileInfo.userID = GlobalConstants.userInfo.userPKID;
      this.newFileInfo.name = GlobalConstants.userInfo.userName;
      //this.newFileInfo.orgID = this.projectDTO.orgID;
      this.newFileInfo.locationID = GlobalConstants.userInfo.locationID;

    } catch (error) {

    }

  }

  exportCSVReport(gridOption: GridOption, values: any, column?: any[]) {
    this.utilitySvc.exportCSVReport(gridOption, values, column);
  }
}
