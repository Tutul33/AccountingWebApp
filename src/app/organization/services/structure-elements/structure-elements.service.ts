import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Config, FixedIDs, GlobalMethods, UtilityService } from '../../index';
import { ApiService } from 'src/app/shared/services/api.service';
import { StruetureElementDTO, StruetureElementMapDTO } from '../../models/structure-elements/structure-elements';

@Injectable()
export class StructureElementDataService { 

  controllerName = Config.url.orgLocalUrl + "StructureElement"; 

  constructor(private apiSvc: ApiService) { }

  save(StruetureElementDTO: StruetureElementDTO): Observable<any> {
    return this.apiSvc.save(`${this.controllerName}/Save`, StruetureElementDTO, true);
  }


  getStructureElementsList(): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/GetStructureElementsList`, { })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

  remove(id: number): Observable<any> {
    return this.apiSvc
    .executeQuery(`${this.controllerName}/Delete`, { id: id})
    .pipe(
      map((response: any) => {
        return response.body;
      })
    );
  }

  updateSelectStatus(id: number, status:boolean): Observable<any> {
    return this.apiSvc
      .executeQuery(`${this.controllerName}/UpdateSelectStatus`, { id: id, status: status })
      .pipe(
        map((response: any) => {
          return response.body;
        })
      );
  }

}


@Injectable()
export class  StructureElementModelService {

  struetureElementDTO: StruetureElementDTO;
  tempStruetureElementDTO: StruetureElementDTO;

  struetureElementMapDTO: StruetureElementMapDTO;
  tempStruetureElementMapDTO: StruetureElementMapDTO;

  orgElementsList: any[] = [];
  orgTypeList = [];
  orgBehaviorList = [];
  

  constructor(private utilitySvc: UtilityService) { }

  loadOrgBehaviorList() {
    try {
      Object.entries(FixedIDs.orgBehavior).forEach(([value, code]) => {
        this.orgBehaviorList.push({ value, code });
      });
    } catch (e) {
      throw e;
    }
  }

  loadOrgTypList() {
    try {
      Object.entries(FixedIDs.orgType).forEach(([value, code]) => {
        this.orgTypeList.push({ value, code });
      });
    } catch (e) {
      throw e;
    }
  }
  

  setDefault() {
    try {
      this.struetureElementDTO = new StruetureElementDTO();
      this.tempStruetureElementDTO = new StruetureElementDTO();

      this.struetureElementMapDTO = new StruetureElementMapDTO();
      this.tempStruetureElementMapDTO = new StruetureElementMapDTO();
    } catch (e) {
      throw e;
    }
  }

  prepareGridList(dataList: any) {
    try { 
      var flatDataList = dataList[dataList.length - 1] || [];
      var list = [];
      if (flatDataList.length > 0) {
        flatDataList.forEach((item) => {
  
          if (item.elementID) {
            let exist = flatDataList.filter(x => x.elementStructureID == item.elementID);
  
            if (exist.length > 0) {
              let myElement: {
                elementStructureID?: number;
                elementName?: string | null;
                isSelected?: boolean;
                typeCd?: string | null;
                typeName?: string | null;
                elementStructureMapID?: number | null;
                elementID?: number | null;
                behaviorCd?: string | null;
                behaviorName?: string | null;
              } = {};
  
              myElement.elementStructureID = exist[0].elementStructureID;
              myElement.elementName = exist[0].elementName.trim();
              myElement.isSelected = exist[0].isSelected;
              myElement.typeCd = exist[0].typeCd;
              myElement.typeName = Object.entries(FixedIDs.orgType).find(([key, value]) => value === exist[0].typeCd)?.[0];
              myElement.elementStructureMapID = exist[0].elementStructureMapID;
              myElement.elementID = exist[0].elementID;
  
              let behaviorCd: string[] = [];
              let behaviorNames: string[] = [];
  
              exist.forEach((item) => {
                const behaviorName = Object.entries(FixedIDs.orgBehavior).find(([key, value]) => value === item.behaviorCd)?.[0];
                if (behaviorName) {
                  behaviorNames.push(behaviorName);
                }
                behaviorCd.push(item.behaviorCd);
              });
              myElement.behaviorCd = behaviorCd.join(", ");
              myElement.behaviorName = behaviorNames.join(", ");
  
              list.push(myElement);
  
              // Remove all rows from flatDataList where item.elementID matches
              flatDataList = flatDataList.filter(x => x.elementID !== item.elementID);
              
            }
          } else {
            item.typeName = Object.entries(FixedIDs.orgType).find(([key, value]) => value === item.typeCd)?.[0];
            item.behaviorName = null;
            list.push(item);
          }
        });
      }
      return list;
    } catch (e) {
      throw e;
    }
  }
  

  prepareDataBeforeSave(){
    try {
      if(this.struetureElementMapDTO.behaviorCd)
      {
        this.struetureElementDTO.structureElementMapList = [];
        let behaviorNames: string[] = [];
        this.struetureElementDTO.behaviorName = null;

        this.struetureElementMapDTO.behaviorCd.split(",").forEach((item) => {
          let struetureElementMapDTO = new StruetureElementMapDTO();
          struetureElementMapDTO.behaviorCd = item;
          struetureElementMapDTO.tag = FixedIDs.objectState.added;

          let data = {
            id: struetureElementMapDTO.id,
            elementID: struetureElementMapDTO.elementID,
            behaviorCd: parseInt(struetureElementMapDTO.behaviorCd),

            //extra properties
            locationID: struetureElementMapDTO.locationID,
            createdByID: struetureElementMapDTO.createdByID,
            tag: struetureElementMapDTO.tag,
          }
          this.struetureElementDTO.structureElementMapList.push(data);

          const behaviorName = Object.entries(FixedIDs.orgBehavior).find(([key, value]) => value === data.behaviorCd)?.[0];
          if (behaviorName) {
            behaviorNames.push(behaviorName);
          }
        });
        this.struetureElementDTO.behaviorName = behaviorNames.join(", ");
      }
      if(this.struetureElementDTO.id == 0)  
      {
        this.struetureElementDTO.tag = FixedIDs.objectState.added;
      }
    } catch (e) {
      throw e;
    }
  }

  prepareDataForUpdateModal(entity: any)
  {
    try {
      this.struetureElementDTO = GlobalMethods.jsonDeepCopy(new StruetureElementDTO(entity));
      this.struetureElementDTO.id = entity.elementStructureID;
      this.struetureElementDTO.tag = FixedIDs.objectState.modified;

      this.struetureElementMapDTO = new StruetureElementMapDTO();
      this.struetureElementMapDTO.behaviorCd = entity.behaviorCd;


      this.tempStruetureElementDTO = GlobalMethods.jsonDeepCopy(new StruetureElementDTO(entity));
      this.tempStruetureElementDTO.id = entity.elementStructureID;
      this.tempStruetureElementDTO.tag = FixedIDs.objectState.modified;

      this.tempStruetureElementMapDTO = new StruetureElementMapDTO();
      this.tempStruetureElementMapDTO.behaviorCd = entity.behaviorCd;
    } catch (error) {
      
    }
  }

  deleteCollection(entity: any) {
    try { 
      this.utilitySvc.deleteCollection(this.orgElementsList, entity);
    } catch (e) {
      throw e;
    }
  }

  
}
