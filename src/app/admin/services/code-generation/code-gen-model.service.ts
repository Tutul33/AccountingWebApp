import { Injectable } from "@angular/core";
import { UtilityService } from "src/app/shared/services/utility.service";
import { UntypedFormGroup } from "@angular/forms";
import { CodeGenDTO } from "../../models/code-generation/code-gen.model";
import { CodeGenItemDTO } from "../../models/code-generation/code-gen-item.model";
import { GlobalConstants, GlobalMethods } from "../..";

@Injectable()
export class CodeGenModelService {
  codeGenForm: UntypedFormGroup;
  codeGenModel: CodeGenDTO;
  tempCodeGenModel: any;
  keyCodeList: any[] = [];
  codeGenDataVariantList: any[] = [];
  dataVariantList: any[] = [];
  propertyList: any[] = [];
  actionList: any[] = [
    { value: "Take", actionName: "Take" },
    { value: "Skip", actionName: "Skip" },
  ];
  constructor(private utilitySvc: UtilityService) { }

  setNewModel() {
    try {
      this.codeGenModel = new CodeGenDTO();
    } catch (error) {
      throw error;
    }
  }
  setExistingModel(data) {
    try {
      this.codeGenModel = new CodeGenDTO(data);
    } catch (error) {
      throw error;
    }
  }

  prepareKeyCodeList(data) {
    try {
      this.keyCodeList = data;
    } catch (error) {
      throw error;
    }
  }

  prepareCodeGenDataVariantList(data) {
    try {
      if (data) {
        this.codeGenDataVariantList = data[0];
      } else {
        this.codeGenDataVariantList = [];
      }
    } catch (error) {
      throw error;
    }
  }

  prepareDataVariantList(data) {
    try {
      if (data) {
        this.dataVariantList = data[0];
      } else {
        this.dataVariantList = [];
      }
    } catch (error) {
      throw error;
    }
  }
  resetCodeGen() {
    try {
      this.prepareCodeGenAndItemList(this.tempCodeGenModel);
    } catch (error) {
      throw error;
    }
  }
  prepareCodeGenAndItemList(data) {
    try {
      this.tempCodeGenModel = GlobalMethods.jsonDeepCopy(data);

      this.codeGenModel = new CodeGenDTO(data[0]);
      data.forEach((item, index) => {
        let codeGentItem = new CodeGenItemDTO(item);
        this.codeGenModel.codeGenItems.entityPush(codeGentItem);
      });
      this.assignLastIndex();
    } catch (error) {
      throw error;
    }
  }

  prepareCodeGenAndItemListForNewKeyCode() {
    try {   
      let codeGentItem = new CodeGenItemDTO();
      this.codeGenModel.codeGenItems.entityPush(codeGentItem);
      this.assignLastIndex();
    } catch (error) {
      throw error;
    }
  }

  addNewProperty() {
    try {
      let codeGentItem = new CodeGenItemDTO();
      this.codeGenModel.codeGenItems.entityPush(codeGentItem);
      this.updateCodeGenFormat();
      this.assignLastIndex();
    } catch (error) {
      throw error;
    }
  }

  removeProperty(item) {
    try {
      this.removeCodeItem(item);
    } catch (error) {
      throw error;
    }
  }

  manageCodeProperties() {
    try {
      this.propertyList = [];
      var newObj = GlobalMethods.codeGenProperty();
      var keyNames = Object.keys(newObj);
      for (var i = 0; i < keyNames.length; i++) {
        var obj = {
          propertyText: "",
          propertyName: "",
        };

        var text = keyNames[i];
        var result = text.replace(/([A-Z])/g, " $1");
        var finalResult = result.charAt(0).toUpperCase() + result.slice(1); // capitalize the first letter - as an example.

        obj.propertyText = finalResult;
        obj.propertyName = keyNames[i];
        this.propertyList.push(obj);
      }
    } catch (e) {
      throw e;
    }
  }


  renewCodeGenItem(item) {
    try {
      let itemExist = this.codeGenModel.codeGenItems.find(x => x.id == item.id);
      if (itemExist) {
        itemExist = new CodeGenItemDTO();
      }

      this.updateCodeGenFormat();
    } catch (error) {
      throw error;
    }
  }
  updateCodeGenFormat() {
    try {
      let prefCodeString = "";
      let sufCodeString = "";
      let prefixList = this.codeGenModel.codeGenItems.filter(
        (x) => x.prefix && !x.isDeleted()
      );
      prefixList.forEach((item) => {
        prefCodeString = prefCodeString + this._buildSingleCode(item);
      });

      let suffixList = this.codeGenModel.codeGenItems.filter(
        (x) => x.sufffix && !x.isDeleted()
      );
      suffixList.forEach((item) => {
        sufCodeString = sufCodeString + this._buildSingleCode(item);
      });
      if (prefixList.length > 0 || suffixList.length > 0) {
        this.codeGenModel.genCodeFormat = prefCodeString + sufCodeString;
      }
    } catch (error) {
      throw error;
    }
  }
  _buildSingleCode(itemData) {
    try {
      if (itemData.propertyName == "Text") {
        var code = this._skipOrTakeFromString(itemData);
        return code;
      } else {
        var propertyName = this.propertyList.find(
          (x) => x.propertyName == itemData.propertyName
        ).propertyName;
        return "{{" + propertyName + "}}";
      }
    } catch (e) {
      throw e;
    }
  }

  _skipOrTakeFromString(data) {
    try {
      if (data.action == "" || data.action == null || data.action == undefined) {
        return data.value;
      }
      if (data.value == null) {
        return "";
      }
      let length = parseInt(data.length);
      if (data.value.length >= data.startIndex - 1) {
        if (data.value.length < data.startIndex - 1 + length) {
          data.length = data.value.length;
        }
        if (data.action == "Take") {
          return data.value.substring(data.startIndex - 1, length);
        } else if (data.action == "Skip") {
          return (
            data.value.substr(0, data.startIndex - 1) +
            data.value.substr(length)
          );
        }
      } else {
        return data.value;
      }
    } catch (e) {
      throw e;
    }
  }
  //bring from existing system start


  removeCodeItem(entity) {
    try {
      if (entity.isAdded()) {
        this.codeGenModel.codeGenItems.entityPop(entity);

        var deletedDataCount = this.codeGenModel.codeGenItems.filter((x) =>
          x.isDeleted()
        ).length;

        if (
          this.codeGenModel.codeGenItems.length === 0 ||
          this.codeGenModel.codeGenItems.length === deletedDataCount
        ) {
          var obj = new CodeGenItemDTO();
          this.codeGenModel.codeGenItems.entityPush(obj);
        }

        this.updateCodeGenFormat();
        this.serialOnCahnge();
      } else {
        this.codeGenModel.codeGenItems.entityPop(entity);
        this.updateCodeGenFormat();
        this.serialOnCahnge();

        var deletedDataCount = this.codeGenModel.codeGenItems.filter((x) =>
          x.isDeleted()
        ).length;

        if (
          this.codeGenModel.codeGenItems.length === 0 ||
          this.codeGenModel.codeGenItems.length === deletedDataCount
        ) {
          var obj = new CodeGenItemDTO();
          this.codeGenModel.codeGenItems.entityPush(obj);
        }
      }

      this.assignLastIndex();
    } catch (e) {
      throw e;
    }
  }

  assignLastIndex() {
    try {
      var lastItem = this.codeGenModel.codeGenItems.filter((x: CodeGenItemDTO) => !x.isDeleted());

      for (var i = 0; i < this.codeGenModel.codeGenItems.length; i++) {
        this.codeGenModel.codeGenItems[i].lastIndex = false;
      }

      if (lastItem) {
        lastItem[lastItem.length - 1].lastIndex = true;
      }
    } catch (error) {
      throw error;
    }
  }
  serialOnCahnge() {
    try {
      var prefixList = this.codeGenModel.codeGenItems.filter(function (x) {
        return !x.isDeleted() && x.prefix;
      });

      if (prefixList.length > 0) {
        prefixList = prefixList.sort((a, b) => a.pSL - b.pSL);
        for (var i = 0; i < prefixList.length; i++) {
          prefixList[i].pSL = i + 1;
          prefixList[i].setModifyTag();
        }
      }

      var suffixList = this.codeGenModel.codeGenItems.filter(function (x) {
        return !x.isDeleted() && x.sufffix;
      });

      if (suffixList.length > 0) {
        suffixList = suffixList.sort((a, b) => a.pSL - b.pSL);

        for (var j = 0; j < suffixList.length; j++) {
          suffixList[j].sSL = j + 1;
          suffixList[j].setModifyTag();
        }
      }
    } catch (e) {
      throw e;
    }
  }

  psOnchange(entity, type) {
    try {
      switch (type) {
        case 'prefix':
          entity.prefix = entity.prefix ? entity.prefix : null;
          entity.pSL = null;

          var prefixCount = this.codeGenModel.codeGenItems.filter((x) =>
            !x.isDeleted() && x.prefix
          ).length;

          if (prefixCount > 1) {
            var items = this.codeGenModel.codeGenItems.filter((x) => !x.isDeleted());
            const maxSL = items.reduce((max, obj) => (obj.pSL > max ? obj.pSL : max), items[0].pSL);

            prefixCount = maxSL + 1;
          }

          if (entity.prefix) {
            entity.pSL = prefixCount;
            entity.isPrefix = true;
          } else {
            entity.isPrefix = false;
          }

          entity.sufffix = null;
          entity.sSL = null;
          entity.isSufffix = false;
          break;
        case 'suffix':
          entity.sufffix = entity.sufffix ? entity.sufffix : null;
          entity.sSL = null;

          var sufffixCount = this.codeGenModel.codeGenItems.filter((x) =>
            !x.isDeleted() && x.sufffix
          ).length;

          if (sufffixCount > 1) {
            var items = this.codeGenModel.codeGenItems.filter((x) =>
              !x.isDeleted()
            );
            const maxSL = items.reduce((max, obj) => (obj.pSL > max ? obj.pSL : max), items[0].pSL);

            sufffixCount = maxSL + 1;
          }

          if (entity.sufffix) {
            entity.sSL = sufffixCount;
            entity.isSufffix = true;
          } else {
            entity.isSufffix = false;
          }

          entity.prefix = null;
          entity.pSL = null;
          entity.isPrefix = false;
          break;
      }

      this.serialOnCahnge();

    } catch (e) {
      throw e;
    }
  }
  //bring from existing system end
  startOnChange() {
    try {
      if (this.codeGenModel.valFromFormat == undefined || this.codeGenModel.valFromFormat == "") {
        this.codeGenModel.valTo = null;
      } else {
        if (this.codeGenModel.valTo && Number(this.codeGenModel.valFromFormat) > this.codeGenModel.valTo) {
          this.codeGenModel.valTo = null;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  endOnChange() {
    try {
      if (this.codeGenModel.valTo == undefined) {
        this.codeGenModel.valTo = null;
      } else {
        if (this.codeGenModel.valTo && Number(this.codeGenModel.valFromFormat) > this.codeGenModel.valTo) {
          this.codeGenModel.valTo = null;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  prepareDataBeforeSave() {
    try {
      this.updateCodeGenFormat();
      let dataModel = new CodeGenDTO(this.codeGenModel);
      dataModel.isActive=true;
      let itemList = this.codeGenModel.codeGenItems.filter(x => !x.isDeleted());
      dataModel.valFrom = parseInt(dataModel.valFromFormat);
      dataModel.codeGenItems = [];
      itemList.forEach((item) => {
        let itemNew = new CodeGenItemDTO(item);
        itemNew.id = 0;
        itemNew.tag = 0;
        itemNew.prefix = (itemNew.prefix == null ? false : itemNew.prefix);
        itemNew.sufffix = (itemNew.sufffix == null ? false : itemNew.sufffix);
        dataModel.codeGenItems.entityPush(itemNew);
      });
      return dataModel;
    } catch (error) {
      throw error;
    }
  }
  checkCustomValidation() {
    try {
      var toSaveDataList = this.codeGenModel.codeGenItems.filter(x => !x.isDeleted());

      // check duplicate serial no 
      var isDuplicateSLNo = this.checkDuplicateSlNo(toSaveDataList);
      if (!isDuplicateSLNo) {
        return false;
      }

      return true;
    } catch (e) {
      throw e;
    }
  }
  checkDuplicateSlNo(codeGenItems) {
    try {
      var isDuplicate = false;
      for (var i = 0; i < codeGenItems.length; i++) {

        if (codeGenItems[i].pSL) {
          var checkPSL = this.codeGenModel.codeGenItems.filter(x => x.pSL == codeGenItems[i].pSL && !x.isDeleted());
          if (checkPSL.length > 1) {
            isDuplicate = true;
            break;
          }
        }

        if (codeGenItems[i].sSL) {
          var checkSSL = this.codeGenModel.codeGenItems.filter(x => x.sSL == codeGenItems[i].sSL && !x.sSL && !x.isDeleted());
          if (checkSSL.length > 1) {
            isDuplicate = true;
            break;
          }
        }
      }
      return isDuplicate;
    } catch (e) {
      throw e;
    }
  }

  afterSave(res) {
    try {
      this.setExistingModel(res.body);
      this.assignLastIndex();
    } catch (error) {
      throw error;
    }
  }
}
