import { Component, OnInit } from "@angular/core";
import {
  BaseComponent,
  ColumnType,
  Config,
  DynamicDialogRef,
  FileUploadOption,
  GlobalMethods,
  GridOption,
  LanguageAddEditComponent,
  LanguageDataService,
  LanguageModelService,
  ModalConfig,
  ProviderService,
  QueryData,
} from "..";
import { DialogService } from "primeng/dynamicdialog";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-languages",
  templateUrl: "./languages.component.html",
  providers: [LanguageDataService, LanguageModelService],
  standalone:true,
  imports:[SharedModule]
})
export class LanguagesComponent extends BaseComponent implements OnInit {
  ref: DynamicDialogRef;
  gridOption: GridOption = null;
  spData: any = new QueryData();  
  flagViewOption:FileUploadOption;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: LanguageModelService,
    private dataSvc: LanguageDataService,
    public dialogService: DialogService
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {
    this.initGridOption();
    this.initFileViewOption();
    this.loadLanguages();
  }
  
  initFileViewOption() {
    try {
      this.flagViewOption = new FileUploadOption();
      this.flagViewOption.folderName = Config.imageFolders.language;
      this.flagViewOption.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  initGridOption() {
    try {
      const gridObj = {
        dataSource: "modelSvc.languageList",
        columns: this.gridColumns(),
        refreshEvent:this.loadLanguages,
        isGlobalSearch: true,
        exportOption: {
          exportInPDF: true,
          exportInXL: true,
          title: "Language List",
          isUnicodeSupported:true
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
        { field: "language", header: this.fieldTitle["language"], style: "" },
        { field: "code", header: this.fieldTitle["code"], style: "" },
        { field: "native", header: this.fieldTitle["native"], style: "" },
        { header: this.fieldTitle["flag"], style: "" },
        { field: "isActive", header: this.fieldTitle["active"], style: "" },
        { field: "isDefault", header: this.fieldTitle["default"], style: "" },
        { header: this.fieldTitle["action"], styleClass: "d-center" },
      ];
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

  deleteLanguage(entity: any) {
    try {
      this.utilitySvc
      .showConfirmModal(this.messageCode.confirmDelete)
      .subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.dataSvc.DeleteLanguage(entity.id).subscribe({
            next: (res: any) => {
              this.modelSvc.deleteCollection(entity);
              this.showMsg(this.messageCode.deleteCode);              
            },
            error: (res: any) => {
              this.showErrorMsg(res);
            },
          });
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  addLanguage() {
    try {
      this.languageAddEdit();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  editLanguage(entity: any) {
    try {
      this.languageAddEdit(entity);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  
  languageAddEdit(language?:any) {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = "Language Add/Edit";
      var obj = {
        language:language
      };
      modalConfig.data = obj;
      this.ref = this.dialogService.open(LanguageAddEditComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
        if (data) { 
      
          setTimeout(()=>{
            this.initFileViewOption();
            this.loadLanguages();
          },5);        
        }
      });
    } catch (e) { 
      this.showErrorMsg(e);
    }
  }
}
