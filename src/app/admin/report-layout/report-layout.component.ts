import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormGroup, NgForm, FormsModule } from "@angular/forms";
import {
  ProviderService,
  BaseComponent,
  ValidatorDirective,
  ReportLayoutDataService,
  ReportLayoutModelService,
  ModalConfig,
  GlobalMethods,
  FileUploadComponent,
  DynamicDialogRef,
  GridOption,
  ColumnType,
  QueryData,
  NiMultipleFileViewComponent,
} from "../index";
import { ReportLayout, reportLayoutValidation } from "../models/report-layout/report-layout.model";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-report-layout',
  templateUrl: './report-layout.component.html',
  providers: [ReportLayoutDataService, ReportLayoutModelService],
  standalone:true,
  imports:[SharedModule]
})

export class ReportLayoutComponent extends BaseComponent implements OnInit, AfterViewInit
{
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("reportLayoutForm", { static: true, read: NgForm }) reportLayoutForm: NgForm;
  ref: DynamicDialogRef;
  public validationMsgObj: any;
  gridOption: GridOption;
  spData: any = new QueryData();


  constructor(
    protected providerSvc: ProviderService,
    private dataSvc: ReportLayoutDataService,
    public modelSvc: ReportLayoutModelService
  ) {
    super(providerSvc);
    this.validationMsgObj = reportLayoutValidation();
  }

  ngOnInit(): void {
    try{
      this.setDefaultData();
      this.getReportLayoutList(true);
      this.getReportNameList();
      this.getLayoutNameList();
    }catch(e)
    {
      this.showErrorMsg(e);
    }
  }

  ngAfterViewInit() {
    try {

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "Report Layout List",
        dataSource: "modelSvc.reportLayoutList",
        columns: this.gridColumns(),
        refreshEvent: this.getReportLayoutList,
        isGlobalSearch: true,
        paginator:true
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "reportName", header: this.fieldTitle['reportname'] },
      { field: "layoutTypeName", header: this.fieldTitle['layoutname'] },
      { field: "description", header: this.fieldTitle['description']},
      { header: this.fieldTitle['layout'], styleClass: "d-center"},
      { field: "isDefault", header: this.fieldTitle['default'] },
      { header: this.fieldTitle['action'] }]
  }

  setDefaultData(){
    try {
       this.initGridOption();
       this.modelSvc.reportLayout = new ReportLayout();
       this.modelSvc.setFileUploadOption();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  getReportLayoutList(isRefresh:boolean) {
    try {
      this.spData.isRefresh = isRefresh;
      this.spData.pageNo = 0;
      this.dataSvc.getReportLayoutList(this.spData).subscribe({
        next: (res: any) => {
          this.modelSvc.reportLayoutList = res[res.length - 1] || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getReportNameList() {
    try {
      this.dataSvc.getReportNameList().subscribe({
        next: (res: any) => {
          this.modelSvc.reportNameList = res || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  getLayoutNameList() {
    try {
      this.dataSvc.getLayoutNameList().subscribe({
        next: (res: any) => {
          this.modelSvc.tempLayoutNameList = res || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  save(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      //check duplicate entry
      if (this.modelSvc.checkDuplicate()) {
        this.showMsg(this.messageCode.duplicateCheck);
        return;
      }

      if(!this.modelSvc.checkImageFile())
      {
        this.showMsg('838');
        return;
      }
      this.modelSvc.isSubmitted = true;
      this.saveReportLayout(this.modelSvc.reportLayout);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveReportLayout(reportLayout: ReportLayout) {
    try {
      let messageCode = reportLayout.id ? this.messageCode.editCode: this.messageCode.saveCode;
      this.dataSvc.save(reportLayout).subscribe({
        next: (res: any) => {
          this.modelSvc.afterSave(res.body);
          this.showMsg(messageCode);
          this.setNew();
          this.gridOption.totalRecords = this.modelSvc.reportLayoutList.length;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete:() => {
          this.modelSvc.isSubmitted = false;
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      if (this.modelSvc.reportLayout.id > 0) {
        this.formResetByDefaultValue(this.reportLayoutForm.form, this.modelSvc.tempReportLayout);
      } else {
        this.setNew();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(reportLayout: any) {
    try {
      this.modelSvc.reportLayout = this.modelSvc.prepareDataForEdit(reportLayout);
      this.modelSvc.tempReportLayout = GlobalMethods.jsonDeepCopy(this.modelSvc.reportLayout);
      this.onChangeReportName();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  setNew() {
    try {
      this.modelSvc.reportLayout = new ReportLayout();
      this.formResetByDefaultValue(this.reportLayoutForm.form, this.modelSvc.reportLayout);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  imageUploadModal() {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = 'File Upload';
      modalConfig.closable = false;

      modalConfig.data = {
        uploadOption: this.modelSvc.imageUploadOption,
        targetObjectList: this.modelSvc.reportLayout.reportLayoutAttachmentsList
      };

      this.ref = this.dialogSvc.open(FileUploadComponent, modalConfig);

      this.ref.onClose.subscribe((data: any) => {
        if (data) {
          this.reportLayoutForm.form.markAsDirty();
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  imageGalleryModal(entity:any) {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.header = 'Image Gallery';
      modalConfig.width = '';
      modalConfig.contentStyle = {};
      modalConfig.data = {
        fileOption: this.modelSvc.imageUploadOption,
        fileIDs: entity.fileID
      };

      this.ref = this.dialogSvc.open(NiMultipleFileViewComponent, modalConfig);
      this.ref.onClose.subscribe((data: any) => {
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  delete(entity: any) {
    try{
      this.utilitySvc
      .showConfirmModal(this.messageCode.confirmDelete)
      .subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.dataSvc.delete(entity.id).subscribe({
            next: (res: any) => {
              this.showMsg(this.messageCode.deleteCode);
              this.modelSvc.deleteCollection(entity);
              this.gridOption.totalRecords = this.modelSvc.reportLayoutList.length;
            },
            error: (res: any) => {
              this.showErrorMsg(res);
            },
          });
        }
      });
    }catch(error){
      throw error;
    }
  }

  onChangeReportName(){
    try {
      this.modelSvc.layoutNameList = this.modelSvc.tempLayoutNameList.filter(f => f.reportCode == this.modelSvc.reportLayout.reportCode);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  

}




