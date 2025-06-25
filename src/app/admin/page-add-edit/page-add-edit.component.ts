import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent,  ModalService, ModuleDataService, ModuleModelService, ProviderService, QueryData, ValidatorDirective } from '..';
import { NgForm, UntypedFormGroup } from '@angular/forms';
import { modulePageValidation } from '../models/module/module.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-page-add-edit',
  templateUrl: './page-add-edit.component.html',
  providers:[ModuleDataService, ModuleModelService,ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class PageAddEditComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  public validationMsgObj: any;
  @ViewChild("pageForm", { static: true, read: NgForm }) 
  pageForm: NgForm;
  spData:any=new QueryData();

  pageData:any;
  menuData:any;
  pageList:any=[];

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ModuleModelService,
    private dataSvc: ModuleDataService,
    public modalService: ModalService
 )
 {
   super(providerSvc);
   this.validationMsgObj=modulePageValidation();
 }

 ngOnInit(): void {  
  this.loadProjectModuleList();
  this.pageData = this.modalService.modalData?.page; 
  this.menuData = this.modalService.modalData?.menu; 
  this.modelSvc.loadPageData(this.modalService.modalData);
 }

 loadProjectModuleList() {
  try {
    this.spData.pageNo=0;
    this.dataSvc.GetProjectModuleList(this.spData).subscribe({
      next: (res: any) => {
        let resData = res[res.length - 1] || [];
        if (resData.length > 0) {
          this.modelSvc.projectModuleList=resData;
        } else {
          this.modelSvc.projectModuleList = [];
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
      this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
      return;
    }
    
    this.modelSvc.prepareSaveDataOfPage();
    
    this.dataSvc.SaveModule(this.modelSvc.moduleModel).subscribe({
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
