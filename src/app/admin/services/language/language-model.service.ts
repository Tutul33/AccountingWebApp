import { Injectable } from "@angular/core";
import { UtilityService } from "src/app/shared/services/utility.service";
import { LaguageImage, Language } from "../../models/langauge/language.model";
import { Config, FileUploadOption, GlobalMethods } from "../..";
import { UntypedFormGroup } from "@angular/forms";
import { ImageFile } from "src/app/shared/models/common.model";
import { LanguageKeyValue } from "../../models/langauge/languageKeyValue.model";
import { LanguageKey } from "../../models/langauge/languageKey.model";

@Injectable()
export class LanguageModelService {
  languageForm: UntypedFormGroup;
  languageKeyForm: UntypedFormGroup;
  languageModel:Language;
  languageKeyModel:LanguageKey;
  languageList:Language[]=[];
  languageKeyValueList:LanguageKeyValue[]=[];
  imageFileUploadOption: FileUploadOption;
  
  searchLanguageCode:string='en';
  removeLanguageKeyCode:string='';
  
  constructor(private utilitySvc: UtilityService) {}
  
  setDefaultData(data){
    try {
      if(data){
        this.languageModel=new Language(data);
        if(data.imageFileName!=null)
        {
        this.languageModel.laguageImage = new LaguageImage();
        this.languageModel.laguageImage.id = data.id;
        this.languageModel.laguageImage.fileName = data.imageFileName;
        this.languageModel.laguageImage.folderName = Config.imageFolders.language;
        this.languageModel.laguageImage.fileTick = this.imageFileUploadOption.fileTick;
       }
      }else
      {
        this.languageModel=new Language();
      }
    } catch (error) {
      throw error;
    }
  }

  prepareLanguageList(data){
   try {
        this.languageList=data;
        this.languageList.forEach((item)=>{
            this.setFlagFileOption(item);
        });
   } catch (error) {
     throw error;
   }
  }

  prepareLanguageKeyValueList(data){
    try {
         this.languageKeyValueList=data;         
    } catch (error) {
      throw error;
    }
   }

  setFlagFileOption(entity: any) {
    try {
      entity.flagFile = new ImageFile();
      entity.flagFile.id = entity.id;
      entity.flagFile.fileName = entity.imageFileName;
      entity.flagFile.folderName = Config.imageFolders.language;
      entity.flagFile.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  prepareSaveData(){
    try {
      this.languageModel.imageFileName=this.languageModel.laguageImage.fileName;
    } catch (error) {
      throw error;
    }
  }

  setFileUploadOption() {
    try {
      this.imageFileUploadOption = new FileUploadOption();
      this.imageFileUploadOption.folderName = Config.imageFolders.language;
      this.imageFileUploadOption.acceptedFiles = ".png,.jpg,.jpeg,.gif";
      this.imageFileUploadOption.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  updateCollection(language: Language) {
    try {
      this.utilitySvc.updateCollection(this.languageList, language);
    } catch (e) {
      throw e;
    }
  }

  deleteCollection(language:Language) {
    try {
      this.utilitySvc.deleteCollection(this.languageList, language);
    } catch (e) {
      throw e;
    }
  }

  //Language Key
  setDefaultLanguageKeyData(){
    try {
      this.languageKeyModel=new LanguageKey();
    } catch (error) {
      
    }
  }
  prepareNewLanguageKey(){
    try {     
      this.languageKeyModel.languageKeyValueList=[];

      this.languageList.forEach((langaugeObj) => {
        let languageKeyValue=new LanguageKeyValue();
        languageKeyValue.languageName=langaugeObj.languageName;
        languageKeyValue.languageCode=langaugeObj.code;
        this.languageKeyModel.languageKeyValueList.entityPush(languageKeyValue);
      });

    } catch (error) {
      throw error;
    }
  }
  prepareSaveKeyData(){
    try {
      this.languageKeyModel.keyCode=this.languageKeyModel.keyCode.trim();
      
      let languageId=0;
      
      let languageObj=this.languageList.filter(x=>x.code==this.searchLanguageCode)[0];
      if(languageObj){
        languageId=languageObj.id;
      }

      this.languageKeyModel.languageKeyValueList.forEach((item)=>{
        item.languageKeyCode=this.languageKeyModel.keyCode;
        item.languageID=languageId;
      });
    } catch (error) {
      throw error;
    }
  }
  prepareSaveKeyValueData(item){
    try {
      item.value=item.value.trim();
      return item;
    } catch (error) {
      throw error;
    }
  }
  resetRemoveLanguageKey(){
    try {
      this.removeLanguageKeyCode='';
    } catch (error) {
      throw error;
    }
  }

  removeSpaceFromLanguageKey(LanguageKey){
    try {
      let key=LanguageKey;
      if(key.length){
        key=key.replace(/\s+/g, '').toLowerCase();
      }
      return key;
    } catch (error) {
      throw error;
    }
  }
}