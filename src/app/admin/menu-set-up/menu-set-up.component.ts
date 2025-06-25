import { Component, OnInit, ViewChild } from "@angular/core";
import {
  BaseComponent,
  ModuleDataService,
  ModuleModelService,
  ModuleTreeViewComponent,
  ProviderService,
  ValidatorDirective,
} from "..";
import { NgForm, UntypedFormGroup } from "@angular/forms";
import { moduleValidation } from "../models/module/module.model";
import { FileUploadService } from "src/app/shared/services/file-upload.service";
import { SharedModule } from "src/app/shared/shared.module";
@Component({
  selector: "app-menu-set-up",
  templateUrl: "./menu-set-up.component.html",
  providers: [ModuleModelService, ModuleDataService],
  standalone:true,
  imports:[SharedModule,ModuleTreeViewComponent]
})
export class MenuSetUpComponent extends BaseComponent implements OnInit {
  @ViewChild(ModuleTreeViewComponent)
  moduleTreeViewCom: ModuleTreeViewComponent;
  showForm: boolean = false;
  isRoot: boolean = false;
  rootView: boolean = false;
  showAction:boolean=false;
  tempTreeData:any;
  type:string='';
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("menuForm", { static: true, read: NgForm })
  menuForm: NgForm;

  public validationMsgObj: any;
  

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ModuleModelService,
    private dataSvc: ModuleDataService,
    public fileUploadService: FileUploadService
  ) {
    super(providerSvc);
    this.validationMsgObj = moduleValidation();
  }

  ngOnInit(): void {
    this.modelSvc.setDefaultData(null);
  }

  handleOutputEvent(data: any) {
    try {
      this.tempTreeData=data.allTreeData;

      if (!data.isInsertOrUpdate) { 
        this.modelSvc.setTempMenuNode(data);       
        this.modelSvc.setFileUploadOption();
        this.showForm = true;
        this.modelSvc.setDefaultData(data.selectedMenu);
        if (this.modelSvc.tempMenu.imageName) {
          this.modelSvc.copyPreviousImage();
        }
        this.modelSvc.moudleList = data.allMenu;

        if (this.modelSvc.tempNode.isRoot) {
          this.isRoot = true;
          this.rootView = true;
        } else {
          this.rootView = false;
        }
        this.actionView();
      } else {
        //After insert , load updated menu list
        this.modelSvc.moudleList = data.allMenu;                   
        this.actionView();
      }
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
  private actionView() {
    if (this.modelSvc.moduleModel.parentID == null || this.modelSvc.moduleModel.parentID == 0) {
      this.showAction = true;
    } else {
      this.showAction = false;
    }
  }

  
  deleteMenu() {
    try {
      const id=this.modelSvc.tempMenu.id;
      this.utilitySvc
        .showConfirmModal(this.messageCode.confirmDelete)
        .subscribe((isConfirm: boolean) => {
          if (isConfirm) {
            this.dataSvc.DeleteModule(id).subscribe({
              next: (res: any) => {
                this.showMsg(this.messageCode.deleteCode);

                this.type='delete';
                this.moduleTreeViewCom.updateTree(this.modelSvc.tempMenu, this.modelSvc.tempNode,this.tempTreeData,this.type);
                
                this.showForm = false;
              },
              error: (res: any) => {
                this.showErrorMsg(res);
              },
            });
          }
        });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  setNew(formGroup: NgForm) {
    try {
      if (this.isRoot) {
        this.rootView = false;
      }
      this.modelSvc.setNewModule(this.modelSvc.selectedParentMenu);
      this.actionView();
      formGroup.form.markAsPristine();
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  reset() {
    try {
      this.modelSvc.setDefaultData(this.modelSvc.tempMenu);
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
      let saveData=this.modelSvc.prepareSaveDataOfMenu();

      if (saveData.errorCode=='2188') {
          this.showMsg('2188');
          return;
      }

      if (saveData.errorCode=='2189') {       
          this.showMsg('2189');
          return;
      }
      
      this.saveModule(saveData.model, formGroup);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private saveModule(menu: any, formGroup: NgForm) {
    try {
      let messageCode = menu.id
        ? this.messageCode.editCode
        : this.messageCode.saveCode;

      this.dataSvc.SaveModule(menu).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.showMsg(messageCode);

            formGroup.form.markAsPristine();
            let newMenuObj=res.body;
            newMenuObj.parentName=menu.parentName;
            this.modelSvc.setFileUploadOption();
            this.modelSvc.setDefaultData(res.body); 
            this.modelSvc.tempMenu=res.body;

            this.type='addOrEdit';
            this.moduleTreeViewCom.updateTree(this.modelSvc.tempMenu, this.modelSvc.tempNode,this.tempTreeData,this.type);
            
          }
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

  close() {
    try {
      this.modelSvc.setDefaultData(null);
      this.showForm = false;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onImageChange(formGroup: NgForm) {
    try {
      formGroup.form.markAsDirty();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onRemoveImage(formGroup: NgForm) {
    try {
      formGroup.form.markAsDirty();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
}
