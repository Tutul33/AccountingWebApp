import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { Config } from 'src/app/app-shared/models/config';
import { GlobalConstants } from 'src/app/shared';
import { ApiService } from 'src/app/shared/services/api.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BannerTemplate } from '../../models/banner-template/banner-template.model';
import { ImageFile } from 'src/app/shared/models/common.model';

@Injectable()
export class BannerTemplateDataService {

  controllerName = Config.url.adminLocalUrl + "BannerTemplate";
  constructor(private apiSvc: ApiService) { }

  getBankCardTypes(spData: any) {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetBannerTemplates`, { data: JSON.stringify(spData) })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  save(bannerTemplate: BannerTemplate): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, bannerTemplate, true);
  }

  managerOrder(bannerList: any): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/UpdateSerialNo`, bannerList, true);
  }

  delete(id: number, imgFolderName:string): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/Delete`, { id: id, imgFolderName: imgFolderName })
    .pipe(
      map((response: any) => {
        return response;
      })
    );
  }

}


@Injectable()

export class BannerTemplateModelService {

  bannerTemplate: BannerTemplate;
  tempBannerTemplate: BannerTemplate;
  bannerTemplateList: any = [];

  constructor(private utilitySvc: UtilityService) {
  }

  prepareGridList(dataList: any) {
    try {
      var list = [];
      if (dataList.length > 0) {
        dataList.forEach((item) => {
          item.tag=0;
          // set image 
          item.imageFile = new ImageFile();
          item.imageFile.photoID = item.id;
          item.imageFile.fileName = item.templateFileName;
          item.imageFile.folderName = Config.imageFolders.bannertemplate;

          list.push(item);
        });
      }

      //set ebable
      if (list.length > 0) {
        list[0].isEnabledUp = true;
        list[list.length - 1].isEnabledDown = true;
      }
      return list;
    } catch (e) {
      throw e;
    }
  }

  checkDuplicate(bannerTemplate: BannerTemplate) {
    try {
      let isDuplicateName = this.utilitySvc.checkDuplicateEntry(this.bannerTemplateList, bannerTemplate, 'templateName');
      let isDuplicateSerialNo = this.utilitySvc.checkDuplicateEntry(this.bannerTemplateList, bannerTemplate, 'serialNo');


      if (!isDuplicateName && !isDuplicateSerialNo) return false;
      else return true;
    }
    catch (e) {
      throw e;
    }
  }

  updateCollection(bannerTemplate: BannerTemplate, isEdit: boolean) {
    try {

      if (isEdit) {
        this.utilitySvc.updateCollection(this.bannerTemplateList, bannerTemplate);
      } else {
        this.bannerTemplateList.push(bannerTemplate);
      }
      this.setEditable();
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(bannerTemplate: BannerTemplate) {
    try {
      this.utilitySvc.deleteCollection(this.bannerTemplateList, bannerTemplate);
      this.setEditable();
    } catch (e) {
      throw e;
    }
  }

  setImageFileOptions(singleFile: any) {
    if (singleFile.photoFile.fileName) {
      this.bannerTemplate.templateFileName = singleFile.photoFile.fileName;
      this.bannerTemplate.templateImage = singleFile.photoFile;
      this.bannerTemplate.hasFile = true;
    }
  }

  //order by
  orderBy() {
    try {
      // reset order by
      for (var i = 0, len = this.bannerTemplateList.length; i < len; i++) {
        this.bannerTemplateList[i].serialNo = i + 1;//reset serial no   
        if (!this.bannerTemplateList[i].isModified())
          this.bannerTemplateList[i].setModifyTag();
      }
      this.setEditable();
    } catch (e) {
      throw e;
    }
  }

  setEditable() {
    //set ebable
    this.bannerTemplateList.forEach((item) => {
      item.isEnabledUp = false;
      item.isEnabledDown = false;
    })
    if (this.bannerTemplateList.length > 0) {
      this.bannerTemplateList[0].isEnabledUp = true;
      this.bannerTemplateList[this.bannerTemplateList.length - 1].isEnabledDown = true;
    }
  }

}