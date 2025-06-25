import { Component, OnInit, ViewChild } from "@angular/core";

import { forkJoin } from "rxjs";
import { BaseComponent, FixedIDs, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from "src/app/app-shared";
import { ModalService } from "src/app/admin";
import { OrgStructureDataService, ORGStructureModelService } from "..";
import { ORGStructureDTO, orgStructureValidation } from "../models/org-structure/org-structure";
import { AbstractControl, NgForm, UntypedFormGroup,ValidationErrors,ValidatorFn,Validators } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-org-structure-entry-modal",
  templateUrl: "./org-structure-entry-modal.component.html",
  providers: [ORGStructureModelService, ModalService, OrgStructureDataService],
  standalone:true,
  imports:[SharedModule]
})
export class OrgStructureEntryModalComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("orgStructureForm", { static: true, read: NgForm }) orgStructureForm: NgForm;

  public validationMsgObj: ValidatingObjectFormat;
  spData: any = new QueryData();
  orgElementList: any = [];
  officeOrgElementList: any = [];
  entity: any = null;
  isOffice: boolean = false;
  isOfficeEdit: boolean = false;


  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ORGStructureModelService,
    private dataSvc: OrgStructureDataService,
    public modalService: ModalService,
  ) {
    super(providerSvc);
    this.validationMsgObj = orgStructureValidation();
  }

  ngOnInit(): void {
    this.modalService.setHeader(this.fieldTitle['organization']);
    this.entity = this.modalService?.modalData?.entity;
    this.modelSvc.isEdit = this.modalService?.modalData?.isEdit;
    this.getAllData(this.entity.id);
  }

  getAllData(id: number) {
    try {
      this.spData.pageNo = 0;
      forkJoin([
        this.dataSvc.getOrgElementList(this.spData),
        this.dataSvc.getOfficeOrgElementsList(this.spData),
        this.modelSvc.isEdit ? this.dataSvc.getOrgStructureByIDForEdit(this.spData, id, this.entity.parentID) : this.dataSvc.getOrgStructureByID(this.spData, id),
      ]).subscribe({
        next: (results: any) => {
          let elList = results[0] || [];
          this.orgElementList = elList[elList.length - 1];
          let orgelList = results[1] || [];
          this.officeOrgElementList = orgelList[orgelList.length - 1];
          let result = results[2] || [];
          let orgobj = result[result.length - 1];
          this.modelSvc.orgStructure = new ORGStructureDTO(orgobj[0]);
          if(!this.modelSvc.isEdit){
            this.modelSvc.orgStructure.textColorCd =  '#000000';
            this.modelSvc.orgStructure.fillColorCd =  '#008000';
            }

          if (orgobj[0].typeCd == FixedIDs.orgType.Office) {
            this.isOffice = true;
            this.orgElementList = this.orgElementList.filter(x => x.typeCd !== FixedIDs.orgType.Office);
          }
          if (this.modelSvc.isEdit) {
            
            this.modelSvc.prepareOrgForEdit(this.entity.parentID, orgobj[0]);
            this.isOffice = true;
            if (orgobj[0].typeCd == FixedIDs.orgType.Office) {
              this.isOfficeEdit = true;
             this.orgElementList = this.officeOrgElementList;
            }
          } else {
            this.modelSvc.orgStructure.parentName = this.modelSvc.orgStructure.name;
            this.modelSvc.orgStructure.name = '';
            this.modelSvc.orgStructure.elementID = null;//0
          }

        },
        error: (res: any) => { },
      });
    } catch (error) { }
  }

  
  
  onSetOfficeInfo(){
    try{

        let officeCtrlValidatorList = [];
        let orgElementIDCtrlValidatorList = [];
        const orgElementIDCtrl = this.orgStructureForm.form.controls["orgElementID"];
        const officeCtrl = this.orgStructureForm.form.controls["office"];
       //setTimeout(()=>{
        if((this.modelSvc.orgStructure.office == null || this.modelSvc.orgStructure.office == '') && (this.modelSvc.orgStructure.orgElementID == null || this.modelSvc.orgStructure.orgElementID == 0 )){
       
          if(orgElementIDCtrl !=null || orgElementIDCtrl != undefined){
         
            orgElementIDCtrl.setValidators(orgElementIDCtrlValidatorList);
            orgElementIDCtrl.reset();
            orgElementIDCtrl.updateValueAndValidity();
          }
        
          if(officeCtrl !=null || officeCtrl != undefined){
           
          officeCtrl.setValidators(officeCtrlValidatorList);
          officeCtrl.reset();
          officeCtrl.updateValueAndValidity();
          }
         }
      
        if((this.modelSvc.orgStructure.office == null || this.modelSvc.orgStructure.office == '') && this.modelSvc.orgStructure.orgElementID != null){
       // please set office
      
        officeCtrlValidatorList.push(Validators.required);
        officeCtrl.setValidators(officeCtrlValidatorList);
        officeCtrl.updateValueAndValidity();
        
      }
  
      if((this.modelSvc.orgStructure.office != null && this.modelSvc.orgStructure.office != '') && this.modelSvc.orgStructure.orgElementID == null){
        // please set office type
        orgElementIDCtrlValidatorList.push(Validators.required);
        orgElementIDCtrl.setValidators(orgElementIDCtrlValidatorList);
        orgElementIDCtrl.updateValueAndValidity();
      
       }
       //})
      
  
      
    }
   catch (error) {
    this.showErrorMsg(error);
  }
  }



  save(orgStructureForm: NgForm, isAnother: boolean) {
    try {
      this.onSetOfficeInfo();
      if (!orgStructureForm.valid) {
        this.directive.validateAllFormFields(orgStructureForm.form as UntypedFormGroup);
        return;
      }
      this.modelSvc.prepareOrg(this.entity.id);
      this.saveORGStructure(isAnother);

    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  private saveORGStructure(isAnother: boolean) {
    try {

      this.dataSvc.save(this.modelSvc.oRGStructureDTOs).subscribe({
        next: (res: any) => {
          this.afferSave();
          if (isAnother) {
            //this.modelSvc.addAnotherAfferSave(res.body);
            this.addAnother();
       
          } else {
            this.closeModal(res.body);
          }
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  afferSave(){
    try {

  } catch (e) {
    this.showErrorMsg(e);
  }
  }

  closeModal(data:any) {
    try {
    if (this.modalService.isModal) {
      this.modalService.close(data);
    }
  } catch (e) {
    this.showErrorMsg(e);
  }
  }

  addAnother() {
    try {
      this.modelSvc.addNew();
      this.modelSvc.orgStructure.parentName = this.entity.label;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try {
      if (this.modelSvc.isEdit) {
        this.getAllData(this.entity.id);
      } else {
        this.modelSvc.addNew();
        this.modelSvc.orgStructure.parentName = this.entity.label;
        this.modelSvc.orgStructure.textColorCd =  '#000000';
        this.modelSvc.orgStructure.fillColorCd =  '#008000';
      }
      this.formResetByDefaultValue(this.orgStructureForm.form, this.modelSvc.orgStructure);
     
      this.orgStructureForm.form.markAsPristine();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

}
