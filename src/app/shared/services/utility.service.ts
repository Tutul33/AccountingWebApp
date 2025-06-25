import { filter, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { GlobalMethods } from 'src/app/core/models/javascriptMethods';
import { FixedIDs, GlobalConstants, ModalConfig } from '..';
import { Observable } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmModalComponent } from '../components/confirm-modal/confirm-modal.component';
import { formatDate } from '@angular/common';
import { ObjectUtils } from 'primeng/utils';
import { GridOption } from 'src/app/app-shared';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(private dialogService: DialogService) { }

  tagHandlingForPush(entity: UntypedFormGroup, pk?: any): UntypedFormGroup {
    pk = typeof pk === 'undefined' ? 'id' : pk;

    if (entity.get(pk).value === 0) {
      entity.get('tag').setValue(4);
    }
    return entity;
  }

  convertIntoShortDate(date: any) {
    return formatDate(date, FixedIDs.fixedIDs.format.shortMonthDateFormat, "en");
  }

  getServerShortDate() {
    return formatDate(GlobalConstants.serverDate, FixedIDs.fixedIDs.format.shortMonthDateFormat, "en");
  }

  getDateIsCurrentOrUpcoming(date: any) {
    if(date) {
      const convDate = new Date(date);
      const shortDate = this.convertIntoShortDate(convDate);
      const serverShrotDate = this.getServerShortDate();

      if(shortDate > serverShrotDate) {
        return FixedIDs.fixedIDs.dateStatus.Current
      } else if(shortDate == serverShrotDate) {
        return FixedIDs.fixedIDs.dateStatus.Upcoming
      } else {
        return FixedIDs.fixedIDs.dateStatus.Previous
      }
    }
  }

  tagHandlingForPop(entity: UntypedFormGroup, pk?: any): UntypedFormGroup {
    pk = typeof pk === 'undefined' ? 'id' : pk;

    if (
      entity.get(pk).value !== 0 &&
      (entity.get('tag').value === 0 || entity.get('tag').value === 3)
    ) {
      entity.get('tag').setValue(2);
    }
    return entity;
  }

  setFormCtrlValueNull(frmGroup: UntypedFormGroup, ctrlNames: any[]) {
    (function processGrp(frmGrp: UntypedFormGroup) {
      const formKeys = Object.keys(frmGroup.controls) || [];
      if (formKeys.length) {
        for (let i = 0; i < formKeys.length; i++) {
          const field = formKeys[i];
          const control = frmGroup.get(field);
          if (control instanceof UntypedFormControl) {
            const ctrlNameindex = ctrlNames.indexOf(field);
            if (ctrlNameindex > -1) {
              control.setValue(null, { onlySelf: true });
              ctrlNames.splice(ctrlNameindex, 1);
            }
          } else if (control instanceof UntypedFormGroup) {
            processGrp(control);
          } else if (control instanceof UntypedFormArray) {
            if (control.controls.length) {
              control.controls.forEach((formGrp: UntypedFormGroup) => {
                processGrp(formGrp);
              });
            }
          }
        }
      }
    })(frmGroup);
  }

  updateCollection(
    entityList: any[],
    data: any,
    keyProperty?: any,
    isEdit?: any,
  ) {
    const entity = GlobalMethods.deepClone(data);

    // if entry then just unshifted
    if (isEdit === false) {
      entityList.unshift(entity);
    } else {
      // default key property is id
      keyProperty = typeof keyProperty === 'undefined' ? 'id' : keyProperty;

      // get old object and find index for replace if exists otherwise unshifted
      const objData = entityList.find(
        (item) => item[keyProperty] === entity[keyProperty]
      );

      if (!objData) {
        entityList.unshift(entity);
      } else {
        const index = entityList.indexOf(objData);
        if (index > -1) {
          entityList[index] = entity;
        }
      }
    }
  }

  //show confirm modal
  showConfirmModal(msgCode: any): Observable<any> {
    const modalConfig = new ModalConfig();

    let ref = new DynamicDialogRef;
    modalConfig.header = 'Confirm Operation!!!';
    modalConfig.width = "";
    modalConfig.style = { 'top': '-30%' };
    modalConfig.styleClass="ecom-modal delete-modal";
    modalConfig.data = {
      msgCode: msgCode
    };

    ref = this.dialogService.open(ConfirmModalComponent, modalConfig);

    return ref.onClose.pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  deleteCollection(
    entityList: any[],
    data: any,
    keyProperty?: any
  ) {
    const entity = GlobalMethods.deepClone(data);
    // default key property is id
    keyProperty = typeof keyProperty === 'undefined' ? 'id' : keyProperty;

    // get object and find index for delete if exists
    const objData = entityList.find(
      (item) => item[keyProperty] === entity[keyProperty]
    );

    if (objData) {
      const index = entityList.indexOf(objData);
      if (index > -1) {
        entityList.splice(index, 1);
      }
    }
  }


  /*
   Check duplicate entry between an entityCollection and an Entity of same type
   based on some given properties of the Entity

   propertyName will be [brandName,itemName,itemType]
   ignoreIsModify is a boolean (true/false) to ignore a check on Modified EntityState
   */
  checkDuplicateEntry(
    entityList: any[],
    entity: any,
    propertyName: any,
    keyProperty?: any) {
    try {

      keyProperty = typeof keyProperty === "undefined" ? "id" : keyProperty;

      var isDuplicate = false;
      var names = propertyName.split(',');
      var result = [];

      var keyValue = 0;

      //Check each value of corresponding given property name between each entity of the collection and the given entity. 
      for (var i = 0; i < entityList.length; i++) {
        for (var index = 0; index < names.length; index++) {
          entity[names[index]] = entity[names[index]] ? entity[names[index]] : ''; // code added by rasel 
          if (!entityList[i][names[index]]) {
            if (!entity[names[index]]) {
              isDuplicate = true;
              result.push(isDuplicate);
            }
          } else if (entityList[i][names[index]]) {
            var src, desti;
            if (Object.prototype.toString.call(entity[names[index]]) === '[object Array]') {
              src = JSON.stringify(entityList[i][names[index]]);
              desti = JSON.stringify(entity[names[index]]);
            } else {
              src = entityList[i][names[index]].toString().toLowerCase();
              desti = entity[names[index]].toString().toLowerCase();
            }

            if (src === desti) {
              isDuplicate = true;
              result.push(isDuplicate);
            }
          }
        }//end of Property Names iteration

        /*if Number of given property names  and number of matched results are equal
            then no need to iterate entityCollection. A matched entity must exist in the entityCollection 
            and break the iteration.
        */
        if (result.length === names.length) {
          keyValue = entityList[i][keyProperty]; //Store the key property value of the matched entity of the collection
          break;
        } else {
          result = [];
          isDuplicate = false;
        }
      }//end of entityCollection iteration

      /*While the entityState is modified then the key property of the given entity will be checked with the matched entity from the collection.
          If the flag isDuplicate is true then the key property will decide whether the matched entity is same or not.
          If same it will not be a duplicate entry else isDuplicate will remain true.

          In case of different business approach (like SET_Brand insert/update) developer can ignore this check by setting the flag ignoreIsModify 
          true though the entity is in Update.
      */
      if (entity[keyProperty] > 0 && (!entity.isTagChanged() || entity.isModified())) {
        if (isDuplicate === true && keyValue === entity[keyProperty])
          isDuplicate = false;
      }

      return isDuplicate;

    } catch (e) {
      throw e;
    }
  }

  //// checkDuplicateEntry from array by keyProperty        
  checkDuplicateEntryByKey(entityList: any[], keyProperty: any) {
    var length = entityList.length;
    var result = false;
    for (var i = 0; i < length; i++) {
      var objList = entityList.filter((x) => x[keyProperty] == entityList[i][keyProperty]);

      if (objList.length > 1) {
        result = true;
        return result;
      }
    }
    return result;
  }


  prepareDataBasedOnCols(colums: any[], data: any): any {
    const curentColObject = {};
    for (let i = 0; i < colums.length; i++) {
      const key = this.getKeyFromObject(data, i, colums);
      curentColObject[key] = key;
    }
    return curentColObject;
  }

  groupMetaDataTest(list: any[], colums: any[]): any {
    const rowGroupMetadata = {};
    if (list.length) {
      for (let i = 0; i < list.length; i++) {
        const rowData = list[i];
        const currentRowColObj = this.prepareDataBasedOnCols(colums, rowData);

        if (i === 0) {
          Object.keys(currentRowColObj).forEach((key) => {
            rowGroupMetadata[key] = { index: 0, size: 1 };
          });
        } else {
          const previousRowData = list[i - 1];
          const prevRowColObj = this.prepareDataBasedOnCols(
            colums,
            previousRowData
          );

          Object.keys(currentRowColObj).forEach((key) => {
            if (currentRowColObj[key] === prevRowColObj[key]) {
              rowGroupMetadata[key].size++;
            } else {
              rowGroupMetadata[key] = { index: i, size: 1 };
            }
          });
        }
      }
    }
    return rowGroupMetadata;
  }

  removeSpace(value: string) {
    return value.replace(/\s/g, '').toLowerCase().trim();
  }

  getKeyFromObject(item: any, propIndex: number, colums: any[]) {
    let name = '';
    for (let i = 0; i <= propIndex; i++) {
      const properties = colums[i].split('.');
      const value = properties.reduce(
        (prev, curr) => (prev && prev[curr]) || null,
        item
      );
      name += this.removeSpace(value);
    }
    return name;
  }

  purchaseConvertionQuantityAndPrice(sUOMID: number, prUOMID: number, reqQty: number, unitConversion: number, price: number , puomList: any, conversionUomList: any){
    try{
      let item : any = {};
      if(sUOMID === prUOMID){  //kg to kg
        item.purchaseQty = reqQty
        item.price = price;
      }else{
        let baseUnit= puomList.filter((x)=> x.id === prUOMID)[0];

        if(sUOMID === baseUnit.baseUOMID){ //  kg to gram
          let factor = conversionUomList.filter((x)=> x.convertedFromUOMID == sUOMID && x.convertedToUOMID == baseUnit.id)[0].factor;
          item.purchaseQty = reqQty  * factor;
          item.price = (price / factor);

        }else{ 
          if(baseUnit.baseUOMID == null){ //pc to kg
            item.purchaseQty = reqQty * unitConversion; 
            item.price= price / unitConversion;
          }
          else{ //pc to gram
           let factor = conversionUomList.filter((x)=> x.convertedFromUOMID == baseUnit.baseUOMID && x.convertedToUOMID == baseUnit.id)[0].factor;
           item.purchaseQty = reqQty * unitConversion * factor;
           item.price = ((price / unitConversion)/factor);
  
          }
        }

      }
      return item;
    }
    catch(e){
      throw e;
    }
  }

  convertDateToDateID(date: Date, dateList:any) {
    try {
      if (date) {
        let dateObj = new Date(date);
        let fomatedDate = new Intl.DateTimeFormat('en-US').format(dateObj);
        let elementItem: any = null;
      if (dateList && dateList.length > 0) {
        for (let i = 0; i <dateList.length; i++) {
          const element: any = dateList[i];
          let exstDate = new Date(element.date);
          let convertedexstDate = new Intl.DateTimeFormat('en-US').format(exstDate);
          if (fomatedDate == convertedexstDate) {
            elementItem = element;
            break;
          }
        }
      }
        return elementItem.dateID;
      }
    } catch (e) {
      throw e;
    }
  }

  //Inactive data will be inserted into dropDownList that was chosen in transactional data. 
  //Required in Edit Mode

  //Value: ID/Code value bind in DropDown
  //Text: Text that has been shown in dropDown Selection
  //ValueProperty: On which property the value will be assigned in DropDownList (Name of Value Property in the DataList)
  //TextProperty: On which property the text will be assigned in DropDownList (Name of Text Property in the DataList)
  //DataList: Item Source for DorpDownList
  //ParentID: A value that has been used for filter. It is optional
  //ParentProperty: On which property the parent value will be assigned in DropDownList (Name of Filter Property in the DataList)
  //It depends on ParentID
  deletedDataPushInDdl(value:any, text:any, valueProperty:any, textProperty:any, dataList:any, parentID?:any, parentProperty?:any) {
      if (!value) {
          return null;
      }
      var hasData = false;

      if (parentProperty) {
          hasData = dataList.find(x => x[valueProperty] == value && x[parentProperty] === parentID);
      } else {
          hasData = dataList.find(x => x[valueProperty] == value);
      }

      if (!hasData) {
          var newData = {};
          newData[valueProperty] = value;
          newData[textProperty] = text;
          newData[parentProperty] = parentID;
          dataList.push(newData);
          return newData;
      }

      return null;
  }


   exportCSVReport( gridOption: GridOption,values: any, column?: any[]) {
            let data: any = values;
            let csv = '';
            let columns = column;
            let csvSeparator = ',';
        
            //headers
            for (let i = 0; i < columns.length; i++) {
              let column = columns[i];
              if (column.exportable !== false && column.field) {
                csv += '"' + (column.header || column.field) + '"';
        
                if (i < (columns.length - 1)) {
                  csv += csvSeparator;
                }
              }
            }
        
            //set yes/no
            if (columns.length > 0) {
              for (let index = 0; index < data.length; index++) {
                const element = data[index];
                columns.forEach(x => {
                  if (x.isBoolean) {
                    if (typeof element[x.field] === 'string') {
                      element[x.field] = element[x.field] == 'Yes' ? 'Yes' : 'No'
                    } else {
                      element[x.field] = element[x.field] == true ? 'Yes' : 'No'
                    }
                  }
                })
              }
            };
        
        
            //body
            data.forEach((record: any, i: number) => {
              csv += '\n';
              for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                if (column.exportable !== false && column.field) {
                  let cellData = ObjectUtils.resolveFieldData(record, column.field);
        
                  if (cellData != null) {
                    cellData = String(cellData).replace(/"/g, '""');
                  }
                  else
                    cellData = '';
        
                  csv += '"' + cellData + '"';
        
                  if (i < (columns.length - 1)) {
                    csv += csvSeparator;
                  }
                }
              }
            });
        
            let blob = new Blob([csv], {
              type: 'text/csv;charset=utf-8;'
            });
        
            if ((<any>window.navigator).msSaveOrOpenBlob) {
              (<any>navigator).msSaveOrOpenBlob(blob, gridOption.exportOption.title + '.csv');
            }
            else {
              let link = document.createElement("a");
              link.style.display = 'none';
              document.body.appendChild(link);
              if (link.download !== undefined) {
                link.setAttribute('href', URL.createObjectURL(blob));
                link.setAttribute('download', gridOption.exportOption.title + '.csv');
                link.click();
              }
              else {
                csv = 'data:text/csv;charset=utf-8,' + csv;
                window.open(encodeURI(csv));
              }
              document.body.removeChild(link);
            }
          }

}
