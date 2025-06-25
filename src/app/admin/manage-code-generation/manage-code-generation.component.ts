import { Component, OnInit, ViewChild } from "@angular/core";
import {
  BaseComponent,
  CodeGenDaDataService,
  CodeGenModelService,
  ColumnType,
  GridOption,
  ProviderService,
  QueryData,
  ValidatorDirective,
} from "..";
import { NgForm, UntypedFormGroup } from "@angular/forms";
import { codeGenValidation } from "../models/code-generation/code-gen.model";
import { DropdownChangeEvent } from "primeng/dropdown";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-manage-code-generation",
  templateUrl: "./manage-code-generation.component.html",
  providers: [CodeGenModelService, CodeGenDaDataService],
  standalone:true,
  imports:[SharedModule]
})
export class ManageCodeGenerationComponent
  extends BaseComponent
  implements OnInit
{
  spData: any = new QueryData();
  @ViewChild(ValidatorDirective) directive;
  validationMsgObj: any;
  validationMsgObjForItem: any;
  @ViewChild("codeGenForm", { static: true, read: NgForm })
  codeGenForm: NgForm;
  gridOption: GridOption;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: CodeGenModelService,
    private dataSvc: CodeGenDaDataService
  ) {
    super(providerSvc);
    this.validationMsgObj = codeGenValidation();
  }

  ngOnInit(): void {
    this.initGridOption();
    this.modelSvc.setNewModel();
    this.loadKeyCodes();
    this.loadCodeGenDataVariant();
    this.loadPropertyList();
  }
  
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.codeGenModel.codeGenItems",
        columns: this.gridColumns(),
        paginator: false,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    try {
      return [
        {
          field: "properties",
          header: this.fieldTitle["properties"],
          style: "",
        },
        { field: "value", header: this.fieldTitle["value"], style: "" },
        { field: "prefix", header: this.fieldTitle["prefix"], style: "" },
        { field: "psl", header: this.fieldTitle["sl"], style: "" },
        { field: "suffix", header: this.fieldTitle["suffix"], style: "" },
        { field: "ssl", header: this.fieldTitle["sl"], style: "" },
        { field: "startIndex", header: this.fieldTitle["index"], style: "" },
        { field: "length", header: this.fieldTitle["length"], style: "" },
        { header: this.fieldTitle["action"], style: "" },
        { field: "reset", header: this.fieldTitle["reset"], style: "" },
        { header: this.fieldTitle["action"], style: "" },
      ];
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  loadKeyCodes() {
    try {
      this.spData.pageNo = 0;
      const keyCodeType = "CODEGEN";
      this.dataSvc.GetKeyCodes(this.spData, keyCodeType).subscribe({
        next: (res: any) => {
          let resData = res[res.length - 1] || [];
          if (resData.length > 0) {
            this.modelSvc.prepareKeyCodeList(resData);
          } else {
            this.modelSvc.keyCodeList = [];
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
  save(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(
          formGroup.form as UntypedFormGroup
        );
        return;
      }

      let isValid=this.modelSvc.checkCustomValidation();
      if(isValid){
        this.showMsg('998');
        return;
      }

      let saveData=this.modelSvc.prepareDataBeforeSave();

      this.dataSvc.SaveCodeGen(saveData).subscribe({
        next:(res:any)=>{
          if(res.ok){
            this.showMsg(this.messageCode.saveCode);
            this.modelSvc.afterSave(res);
            formGroup.form.markAsPristine();
          }
        },
        error:(res:any)=>{
           this.showErrorMsg(res);
        },
        complete:()=> {}
      })
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  
  onChangeKeyCode($event: DropdownChangeEvent) {
    try {
      this.loadCodeItemList();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  loadCodeItemList() {
    try {
      
      this.spData.pageNo = 0;
      const keyCode = this.modelSvc.codeGenModel.keyCode;
      this.dataSvc.GetCodeGenItemList(this.spData, keyCode).subscribe({
        next: (res: any) => {
          let resData = res[res.length - 1] || [];
          if (resData.length > 0) {
            this.modelSvc.prepareCodeGenAndItemList(resData);
            setTimeout(() => {
              this.codeGenForm.form.markAsDirty();
            }, 5);
          } else {
            this.modelSvc.prepareCodeGenAndItemListForNewKeyCode();
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

  loadCodeGenDataVariant() {
    try {
      this.dataSvc.GetUdcCodeGenDataVariant().subscribe({
        next: (res: any) => {
          if (res) this.modelSvc.prepareCodeGenDataVariantList(res);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  loadPropertyList() {
    try {
      this.modelSvc.manageCodeProperties();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeProperty(item: any) {
    try {
      this.modelSvc.renewCodeGenItem(item);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  addProperty(item, formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      if(!item.reset){
        if (!item.prefix && !item.sufffix) {
          item.isPrefixOrSuffixSelected=true;
          return;
        }
      }
      
      
      if(item.length && item.startIndex && (item.action==null || item.action==''))
      {
        item.isActionNotSelected=true;
        return;
      }

      this.modelSvc.addNewProperty();
      formGroup.form.markAsPristine();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  removeProperty(item) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.modelSvc.removeProperty(item);
            this.codeGenForm.form.markAsDirty();
          }
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeVariantRequired() {
    try {
     
        this.modelSvc.codeGenModel.codeGenVarID = null;
        this.modelSvc.codeGenModel.dataVariantID = null;
 
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  updateCodeGenFormat() {
    try {
      this.modelSvc.updateCodeGenFormat();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangePrefixSuffix(item, type) {
    try {
      this.modelSvc.psOnchange(item, type);
      if(!item.sufffix && !item.prefix){
        item.isPrefixOrSuffixSelected=true;
      }else{
        item.isPrefixOrSuffixSelected=false;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeStart(){
    try {
      this.modelSvc.startOnChange();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onChangeEnd(){
    try {
      this.modelSvc.endOnChange();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onActionChanged(item){
    try {
      if(item.action){
        item.isActionNotSelected=false;
      }else{
        item.isActionNotSelected=true;
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onStartIndexChange(entity) {
    try {
        if (entity.startIndex == 0) {
            entity.startIndex = null;
            entity.action = null;
        }
    } catch (e) {
      this.showErrorMsg(e);
    }
}

onLengthChange(entity) {
  try {
      if (entity.length == 0) {
          entity.length = null;
          entity.action = null;
      }
  } catch (e) {
    this.showErrorMsg(e);
  }
}

reset(){
  try {
    this.modelSvc.resetCodeGen();
    this.codeGenForm.form.markAsPristine();
  } catch (e) {
    this.showErrorMsg(e);
  }
}

cancel(){
  try {
    this.modelSvc.setNewModel();
  } catch (e) {
    this.showErrorMsg(e);
  }
}
}
