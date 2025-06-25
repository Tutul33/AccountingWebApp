import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config } from '../../index';
import { FileUploadOption, FixedIDs, GlobalConstants, GlobalMethods } from 'src/app/shared';
import { ApiService } from 'src/app/shared/services/api.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { ReportLayout } from '../../models/report-layout/report-layout.model';
import { ImageFile } from 'src/app/shared/models/common.model';

@Injectable()
export class ReportLayoutDataService {

  controllerName = Config.url.adminLocalUrl + "ReportLayout";
  constructor(private apiSvc: ApiService) { }
  save(reportLayout: ReportLayout): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, reportLayout, true);
  }

  delete(id: number) {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/Delete`, { id: id })
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }
  getReportLayoutList(spData: any) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetReportLayoutList`, {
        data: JSON.stringify(spData),
      })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getReportNameList() {
    return this.apiSvc
      .get(`${this.controllerName}/GetReportNameList`)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  getLayoutNameList() {
    return this.apiSvc
      .get(`${this.controllerName}/GetLayoutNameList`)
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }
}

@Injectable()
export class ReportLayoutModelService {
  reportLayout: ReportLayout;
  tempReportLayout: ReportLayout;
  isSubmitted:boolean = false;
  reportLayoutList:any[] = [];
  reportNameList:any[] = [];
  layoutNameList:any[] = [];
  tempLayoutNameList:any[] = [];
  imageUploadOption:FileUploadOption; 

  constructor(private utilitySvc: UtilityService) {
  }

  setFileUploadOption() {
    try {
      this.imageUploadOption = new FileUploadOption();
      this.imageUploadOption.isMultipleUpload = true;
      this.imageUploadOption.folderName = Config.imageFolders.reportLayout;
      this.imageUploadOption.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  checkDuplicate() {
    try {
      let isDuplicate = this.utilitySvc.checkDuplicateEntry(this.reportLayoutList, this.reportLayout, 'reportCode,layoutTypeCode');

      if (!isDuplicate) return false;
      else return true;
    }
    catch (e) {
      throw e;
    }
  }

  checkImageFile() {
    try {
      let list = this.reportLayout.reportLayoutAttachmentsList.filter(f => f.tag != FixedIDs.objectState.deleted);
      if(list.length > 0)
      {
        return true;
      }
      return false;
    }
    catch (e) {
      throw e;
    }
  }

  

  afterSave(entity:ReportLayout) {
    try {
      entity.fileID = entity.reportLayoutAttachmentsList.map(x => x.id).join(',');
      entity.fileName = entity.reportLayoutAttachmentsList.map(x => x.fileName).join(',');
      this.updateCollection(entity);
    }
    catch (e) {
      throw e;
    }
  }

  updateCollection(reportLayout: ReportLayout) {
    try {
      if(reportLayout.isDefault)
      {
        let entity = this.reportLayoutList.find((x) => x.isDefault && x.reportCode == reportLayout.reportCode);
        if(entity)
        {
          entity.isDefault = false;
        }
      }
      this.utilitySvc.updateCollection(this.reportLayoutList, reportLayout);
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(entity: any) {
    try {
      this.utilitySvc.deleteCollection(this.reportLayoutList, entity);
    } catch (e) {
      throw e;
    }
  }

  prepareDataForEdit(entity){
    try {
      let reportLayout = new ReportLayout(entity);
      var fileIdsArray = entity.fileID.split(",");
      var fileNamesArray = entity.fileName.split(",");

      for (var i = 0; i < fileIdsArray.length; i++) {
          for (var j = i; j <= i; j++) {
              var obj = new ImageFile();
              obj.id = fileIdsArray[j];
              obj.fileName = fileNamesArray[j];
              reportLayout.reportLayoutAttachmentsList.push(obj);
          }
      }
      return reportLayout;
    } catch (e) {
      throw e;
    }
  }
}

