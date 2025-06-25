import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, LanguageDataService, LanguageModelService, ModalService, ProviderService, ValidatingObjectFormat, ValidatorDirective } from '..';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { languageValidation } from '../models/langauge/language.model';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-language-add-edit',
  templateUrl: './language-add-edit.component.html',
  providers:[LanguageDataService, LanguageModelService,ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class LanguageAddEditComponent extends BaseComponent implements OnInit,AfterViewInit {

  @ViewChild(ValidatorDirective) directive;
  public validationMsgObj: any;
  @ViewChild("languageForm", { static: true, read: NgForm }) 
  languageForm: NgForm;
  
  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: LanguageModelService,
    private dataSvc: LanguageDataService,
    public modalService: ModalService,
    public fileUploadService:FileUploadService
 )
 {
   super(providerSvc);
   this.validationMsgObj=languageValidation();
 }

 ngOnInit(): void {
  let languageModel = this.modalService.modalData?.language; 
  this.modelSvc.setFileUploadOption();
  this.modelSvc.setDefaultData(languageModel);
  setTimeout(() => {
    this.copyPreviousImage();
  }, 1);
 }
 copyPreviousImage() {
  this.fileUploadService
    .shiftPermanentToTemporaryFiles(
      this.modelSvc.languageModel.laguageImage.fileTick,
      this.modelSvc.languageModel.laguageImage.folderName,
      this.modelSvc.languageModel.laguageImage.folderName,
      this.modelSvc.languageModel.laguageImage.id.toString()
    )
    .subscribe({
      next: (res: any) => {},
      error: (res: any) => {
        this.showErrorMsg(res);
      },
    });
  }
  
 ngAfterViewInit() {
  try {    
    this.modelSvc.languageForm = this.languageForm.form;
  } catch (e) {
    this.showErrorMsg(e);
  }
}

onImageChange() {
 try {
   this.languageForm.form.markAsDirty();
 } catch (e) {
  this.showErrorMsg(e);
 }
}

onRemoveImage() {
  try {
    this.languageForm.form.markAsDirty();
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
    
    this.modelSvc.prepareSaveData();
    
    this.dataSvc.SaveLanguage(this.modelSvc.languageModel).subscribe({
      next: (res: any) => {
        this.showMsg(this.messageCode.saveCode);
        formGroup.form.markAsPristine();
        this.closeModal(res);
      },
      error: (res: any) => {
        this.showErrorMsg(res);
      },
      complete: () => {},
    });
  } catch (e) {
    this.showErrorMsg(e);
  }
}

closeModal(res?:any){
  try {
       this.modalService.close(res);
  } catch (error) {
    this.showErrorMsg(error);
  }
}

}
