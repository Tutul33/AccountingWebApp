import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { GlobalMethods } from '../../shared';
import { Config } from 'src/app/app-shared/models/config';
import { ColumnType, GridOption, ImageFile, QueryData, FileUploadOption } from 'src/app/shared/models/common.model';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ProviderService } from '../../core/services/provider.service';
import { ValidatorDirective } from '../../shared/directives/validator.directive';
import { BannerTemplateModelService, BannerTemplateDataService } from '../services/banner-template/banner-template.service'
import { BannerTemplate, bannerTemplateValidation } from '../models/banner-template/banner-template.model';
import { SharedModule } from 'src/app/shared/shared.module';


@Component({
  selector: 'app-banner-template',
  templateUrl: './banner-template.component.html',
  providers: [BannerTemplateDataService, BannerTemplateModelService],
  standalone:true,
  imports:[
    SharedModule
  ]
})
export class BannerTemplateComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("bannerTemplateForm", { static: true, read: NgForm }) bannerTemplateForm: NgForm;

  fileUploadOption: FileUploadOption;
  singleFile: any = {};
  public validationMsgObj: any;
  isSubmitted: boolean = false;
  pageForm: UntypedFormGroup;
  msgCode = {
    templateMandatory: '2072'
  }

  gridOption: GridOption;
  isUpdateOrder: boolean = false;
  spData: any = new QueryData();
  constructor(
    protected providerSvc: ProviderService,
    private dataSvc: BannerTemplateDataService,
    public modelSvc: BannerTemplateModelService
  ) {
    super(providerSvc);
    this.validationMsgObj = bannerTemplateValidation();
  }


  ngOnInit(): void {
    try {
      this.modelSvc.bannerTemplate = new BannerTemplate();
      this.modelSvc.bannerTemplate.serialNo=0;
      this.initGridOption();
      this.getBannerTemplateList(true);
      this.initSingleFile();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  ngAfterViewInit() {
    try {
      this.pageForm = this.bannerTemplateForm.form;
      this.focus(this.pageForm, "templateName");
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initSingleFile() {
    try {
      this.getFileUploadOption();
      this.singleFile.photoFile = new ImageFile();
      this.singleFile.photoFile.fileTick = this.fileUploadOption.fileTick;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private getFileUploadOption() {
    this.fileUploadOption = new FileUploadOption();
    this.fileUploadOption.folderName = Config.imageFolders.bannertemplate;
    this.fileUploadOption.uploadServiceUrl = 'File/UploadFiles';
    this.fileUploadOption.fileTick = GlobalMethods.timeTick();
    this.fileUploadOption.acceptedFiles = '.png,.jpg,.jpeg,.gif';
  }

  onImageChange() {
    this.singleFile.photoFile.deletedFileName = this.modelSvc.bannerTemplate.templateFileName;
    this.pageForm.markAsDirty();
  }

  save(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }

      if (this.modelSvc.bannerTemplate.id == 0 && !this.singleFile.photoFile.fileName) {
        this.showMsg(this.msgCode.templateMandatory);
        return;
      }

      //check duplicate entry
      if (this.modelSvc.checkDuplicate(this.modelSvc.bannerTemplate)) {
        this.showMsg(this.messageCode.duplicateCheck);
        return;
      }
      this.modelSvc.setImageFileOptions(this.singleFile);
      this.isSubmitted = true;
      this.saveBannerTemplate(this.modelSvc.bannerTemplate);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private saveBannerTemplate(bannerTemplate: BannerTemplate) {
    try {
      let messageCode = bannerTemplate.id ? this.messageCode.editCode : this.messageCode.saveCode;
      let isEdit = bannerTemplate.id ? true : false;
      bannerTemplate.serialNo=bannerTemplate.id?bannerTemplate.serialNo:0;
      this.dataSvc.save(bannerTemplate).subscribe({
        next: (res: any) => {
          this.modelSvc.updateCollection(res.body, isEdit);
          this.showMsg(messageCode);
          this.setNew();
          this.gridOption.totalRecords = this.modelSvc.bannerTemplateList.length;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
          this.isSubmitted = false;
        },
        complete: () => {
          this.isSubmitted = false;
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      if (this.modelSvc.bannerTemplate.id > 0) {
        this.formResetByDefaultValue(this.pageForm, this.modelSvc.tempBannerTemplate);
      } else {
        this.setNew();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  edit(bankCardType: any) {
    this.modelSvc.bannerTemplate = new BannerTemplate(bankCardType);
    this.modelSvc.tempBannerTemplate = new BannerTemplate(bankCardType);
    //For Image
    this.initSingleFile();
    this.singleFile.photoFile.id = this.modelSvc.bannerTemplate.id;
  }

  setNew() {
    try {
      this.initSingleFile();
      this.modelSvc.bannerTemplate = new BannerTemplate();
      this.formResetByDefaultValue(this.pageForm, this.modelSvc.bannerTemplate);
      this.focus(this.pageForm, "templateName");
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: this.fieldTitle['templatelist'],
        dataSource: "modelSvc.bannerTemplateList",
        columns: this.gridColumns(),
        refreshEvent: this.getBannerTemplateList,
        isGlobalSearch: true,
        globalFilterFields: ["templateName", "templateFileName","serialNo"]
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  gridColumns(): ColumnType[] {
    return [
      { field: "reorder", header: this.fieldTitle["reorder"], style: "" },
      { field: "templateNameeee", header: this.fieldTitle["bannertemplatename"], style: "" },
      //{ field: "templateFileName", header: this.longft["templatepath"], style: "" },
      { field: "serialNo", header: this.fieldTitle["templateserialno"], style: "" },
      { field: "templateImage", header: this.fieldTitle["templateimage"], style: "" },
      { header: this.fieldTitle['action'], style: '' }
    ];
  }


  getBannerTemplateList(isRefresh: boolean) {
    try { 
      this.spData.isRefresh = isRefresh;
      this.spData.pageNo = 0;
      this.dataSvc.getBankCardTypes(this.spData).subscribe({
        next: (res: any) => {
          this.modelSvc.bannerTemplateList = this.prepareGridList(res[res.length - 1] || []);
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  //onMoveUp
  onMoveUp(elementIndex) {
    try {
      this.modelSvc.bannerTemplateList.arrayMove(null, -1, elementIndex);
      this.modelSvc.orderBy();
      this.isUpdateOrder = true;
      var btnUp = document.getElementById('btnUp' + elementIndex);
      setTimeout(() => {
        btnUp.focus();
      }, 50);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  //onMoveUp
  onMoveDown(elementIndex) {
    try {
      this.modelSvc.bannerTemplateList.arrayMove(null, 1, elementIndex);
      this.modelSvc.orderBy();
      this.isUpdateOrder = true;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  prepareGridList(dataList: any) {
    try {
      return this.modelSvc.prepareGridList(dataList);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  updateOrder() {
    let updateList = this.modelSvc.bannerTemplateList.filter(m => m.isModified());
    if (updateList.length > 0) {
      this.dataSvc.managerOrder(updateList).subscribe({
        next: (res: any) => {
          this.modelSvc.bannerTemplateList = this.prepareGridList(res.body || []);
          this.isUpdateOrder = false;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    }
  }
  onEdit(bannerTemplate: any) {
    try { 
      if (this.bannerTemplateForm.dirty) {
        this.utilitySvc
          .showConfirmModal(this.messageCode.dataLoss)
          .subscribe((isConfirm: boolean) => {
            if (isConfirm) {
              this.edit(bannerTemplate);
            }
          });
      } else {
        this.edit(bannerTemplate);
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }


  delete(bannerTemplate: any) {
    try {
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.delete(bannerTemplate.id, Config.imageFolders.bannertemplate).subscribe({
              next: (res: any) => {
                this.modelSvc.deleteCollection(bannerTemplate);
                this.showMsg(this.messageCode.deleteCode);
                this.gridOption.totalRecords = this.modelSvc.bannerTemplateList.length;
                if (bannerTemplate.id == this.modelSvc.tempBannerTemplate.id) {
                  this.setNew();
                }
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

}
