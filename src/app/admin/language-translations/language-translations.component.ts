import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ColumnType, GridOption, LanguageDataService, LanguageModelService, ProviderService, QueryData, ValidatorDirective } from '..';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { languageKeyValidation } from '../models/langauge/languageKey.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-language-translations',
  templateUrl: './language-translations.component.html',
  providers: [LanguageDataService, LanguageModelService],
  standalone:true,
  imports:[SharedModule]
})
export class LanguageTranslationsComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive;
  public validationMsgObj: any;
  @ViewChild("languageKeyForm", { static: true, read: NgForm }) 
  languageKeyForm:NgForm;

  gridOption:GridOption;
  spData:any = new QueryData();
  
constructor(
  public providerSvc:ProviderService,
  public modelSvc: LanguageModelService,
  private dataSvc: LanguageDataService,
){
  super(providerSvc);
  this.validationMsgObj=languageKeyValidation();
}

ngOnInit(): void {
  this.modelSvc.setDefaultLanguageKeyData();
  this.initGridOption();
  this.loadLanguageKeyValue();
  this.loadLanguages();
}

ngAfterViewInit() {
  try {    
    this.modelSvc.languageKeyForm = this.languageKeyForm.form;
  } catch (e) {
    this.showErrorMsg(e);
  }
}

changeLanguageCode(){
  try {
    if(this.modelSvc.searchLanguageCode){
      this.loadLanguageKeyValue();
    }
  } catch (error) {
    this.showErrorMsg(error);
  }
}

loadLanguages() {
  try {
    this.spData.pageNo=0;
    this.dataSvc.GetLanguageList(this.spData).subscribe({
      next: (res: any) => {
        let resData = res[res.length - 1] || [];

        if (resData.length > 0) {
          this.modelSvc.prepareLanguageList(resData);

          this.modelSvc.prepareNewLanguageKey();
        } else {
          this.modelSvc.languageList = [];
        }
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  } catch (error) {
    this.showErrorMsg(error);
  }
}

initGridOption() {
  try {
    const gridObj = {
      dataSource: "modelSvc.languageKeyValueList",
      columns: this.gridColumns(),
      refreshEvent:this.loadLanguageKeyValue,
      isGlobalSearch: true,
      exportOption: {
        exportInPDF: true,
        exportInXL: true,
        title: this.fieldTitle['translationlist']
      }
    } as GridOption;
    this.gridOption = new GridOption(this, gridObj);
  } catch (e) {
    this.showErrorMsg(e);
  }
}

gridColumns(): ColumnType[] {
  try {
    return [
      { field: "languageKeyCode", header: this.fieldTitle["languagekey"], style: "" },
      { field: "value", header: this.fieldTitle["content"], style: "" },
      { header: this.fieldTitle["action"], style: "" }
    ];
  } catch (error) {
    this.showErrorMsg(error);
  }
}

loadLanguageKeyValue() {
  try {
    this.spData.pageNo=0;
    this.dataSvc.GetLanguageKeyValueList(this.spData,this.modelSvc.searchLanguageCode).subscribe({
      next: (res: any) => {
        let resData = res[res.length - 1] || [];

        if (resData.length > 0) {

          this.modelSvc.prepareLanguageKeyValueList(resData);

        } else {

          this.modelSvc.languageKeyValueList = [];
          
        }
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  } catch (error) {
    this.showErrorMsg(error);
  }
}

updateLanguageKeyValue(item){
  try {
      if(!item.value){
        this.showMsg("2179");
        return;
      }

      let postObj=this.modelSvc.prepareSaveKeyValueData(item);
      
      this.dataSvc.SaveLanguageKeyValue(postObj).subscribe({
          next: (res: any) => {
            this.showMsg(this.messageCode.saveCode);
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
          complete: () => {},
        });
  } catch (error) {
    this.showErrorMsg(error);
  }
}

saveKey(formGroup: NgForm) {
  try {  
    if(!this.modelSvc.languageKeyModel.keyCode){
      this.showMsg("2180");
      return;
    }

    if (!formGroup.valid) {
      this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
      return;
    }

    this.modelSvc.prepareSaveKeyData();
    
    this.dataSvc.SaveLanguageKey(this.modelSvc.languageKeyModel).subscribe({
      next: (res: any) => {
        this.showMsg(this.messageCode.saveCode);

        formGroup.form.markAsPristine();

        this.modelSvc.setDefaultLanguageKeyData();

        this.modelSvc.prepareNewLanguageKey();

        this.loadLanguageKeyValue();
      },
      error: (res: any) => {   
        this.showErrorMsg(res);
      },
      complete: () => {
      },
    });
  } catch (e) {
    this.showErrorMsg(e);
  }
}

removeLanguageKey(){
  try {
      if(!this.modelSvc.removeLanguageKeyCode){
        this.showMsg("2180");
        return;
      }

      this.dataSvc.DeleteLanguageKey(this.modelSvc.removeLanguageKeyCode).subscribe({
          next: (res: any) => {
            this.showMsg(this.messageCode.saveCode);

            this.modelSvc.resetRemoveLanguageKey();

            this.loadLanguageKeyValue();
          },
          error: (res: any) => {
            this.showErrorMsg(res);
          },
          complete: () => {},
        });

  } catch (error) {
    this.showErrorMsg(error);
  }
}

onInputLangugeKey() {
  try {
    this.modelSvc.languageKeyModel.keyCode=this.modelSvc.removeSpaceFromLanguageKey(this.modelSvc.languageKeyModel.keyCode);
  } catch (error) {
    
  }
  }
}
