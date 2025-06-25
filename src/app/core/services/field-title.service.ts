import { GlobalConstants as glcon } from 'src/app/app-shared/models/javascriptVariables';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from '../../shared/services/api.service';
import { DataCacheService } from '../../shared/services/data-cache.service';
import { Config } from 'src/app/app-shared/models/config';
import { GlobalMethods } from '../models/javascriptMethods';

@Injectable({
  providedIn: 'root',
})
export class FieldTitleService {
  baseUrl: string = Config.url.adminLocalUrl;
  constructor(
    private apiSvc: ApiService,
    private dataCacheSvc: DataCacheService
  ) {}

  getFieldDetail(languageCode: string) {
      languageCode = localStorage.getItem('languageCd');
    return this.apiSvc
      .executeQuery(`${this.baseUrl}FieldDetail/GetFieldDetail/`, {languageCode : languageCode })
      .pipe(
        map((response: any) => {
          this.dataCacheSvc.set('FieldTitleCache', response.body);
          GlobalMethods.isLanguageLoad = true;
          this.setFieldTitle();
          this.setOrgHeader();
          return response;
        })
      ); 
  }

  // used to get field detail by passing name
  private getFieldDetailByName(name) {
    let fieldObject: any = null;
    const notFound = `Field not found for ${name}`;

    this.dataCacheSvc.get('FieldTitleCache').subscribe((res) => {
      fieldObject = res.find((x: any) => { 
        return x.name === name;
      });
    });

    return fieldObject != null ? fieldObject : notFound;
  }

  private setFieldTitle() {
    this.dataCacheSvc.get('FieldTitleCache').subscribe((res) => {
      res.forEach((item) => {
        const key = item.languageKeyCode.toLowerCase();
        glcon.fieldTitle[key] = item.value;
      });
    });
  }

  private setOrgHeader() {
    glcon.shortft.org1Name = glcon.shortft.administrativeoffice;
    glcon.shortft.org2Name = glcon.shortft.plant;
    glcon.shortft.org3Name = glcon.shortft.department;
    glcon.shortft.org4Name = glcon.shortft.section;
    glcon.shortft.org5Name = glcon.shortft.subsection;

    glcon.longft.org1Name = glcon.longft.administrativeoffice;
    glcon.longft.org2Name = glcon.longft.plant;
    glcon.longft.org3Name = glcon.longft.department;
    glcon.longft.org4Name = glcon.longft.section;
    glcon.longft.org5Name = glcon.longft.subsection;

    glcon.longft.org1Name = glcon.longft.administrativeoffice;
    glcon.longft.org2Name = glcon.longft.plant;
    glcon.longft.org3Name = glcon.longft.department;
    glcon.longft.org4Name = glcon.longft.section;
    glcon.longft.org5Name = glcon.longft.subsection;

    glcon.longft.bOrg1BName = 'প্রশাসনিক অফিস';
    glcon.longft.bOrg2BName = 'প্ল্যান্ট';
    glcon.longft.bOrg3BName = 'বিভাগ';
    glcon.longft.bOrg4BName = 'সেকশন';
    glcon.longft.bOrg5BName = 'সাবসেকশন';

    glcon.longft.bOrg1BName = 'প্রশাসনিক  অফিস';
    glcon.longft.bOrg2BName = 'প্ল্যান্ট';
    glcon.longft.bOrg3BName = 'বিভাগ';
    glcon.longft.bOrg4BName = 'সেকশন';
    glcon.longft.bOrg5BName = 'সাবসেকশন';

    glcon.shortft.bOrg1BName = 'প্রশাসনিক অফিস';
    glcon.shortft.bOrg2BName = 'প্ল্যান্ট';
    glcon.shortft.bOrg3BName = 'বিভাগ';
    glcon.shortft.bOrg4BName = 'সেকশন';
    glcon.shortft.bOrg5BName = 'সাবসেকশন';
  }
}
