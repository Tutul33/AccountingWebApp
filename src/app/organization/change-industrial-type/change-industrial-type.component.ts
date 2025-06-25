import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm } from '@angular/forms';
import { ChangeIndustryTypeDTO, changeIndustryTypeValidation } from '../models/change-industry-type/change-industry-type';

import {
  ProviderService,
  BaseComponent,
  ValidatorDirective,
  ChangeIndustryTypeDataService,
  ChangeIndustryTypeModelService,
} from '../index';
import { SharedModule } from 'src/app/shared/shared.module';


@Component({
  selector: 'app-change-industrial-type',
  templateUrl: './change-industrial-type.component.html',
  providers: [ChangeIndustryTypeDataService, ChangeIndustryTypeModelService],
  standalone:true,
  imports:[SharedModule]
})

export class ChangeIndustrialTypeComponent extends BaseComponent implements OnInit {

  @ViewChild(ValidatorDirective) directive; 
  @ViewChild("industryTypeForm", { static: true, read: NgForm }) industryTypeForm: NgForm;
  public validationMsgObj: any;

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: ChangeIndustryTypeModelService,
    private dataSvc: ChangeIndustryTypeDataService,
  ) {
    super(providerSvc);
    this.validationMsgObj = changeIndustryTypeValidation();
  }

  ngOnInit(): void {
    this.setDefault();
  }

  setDefault() {
    try {
      this.modelSvc.setDefault();
      this.getUDCIndustryTypeList();
    } catch (e) {
      this.showErrorMsg(e)
    }
  }

  getUDCIndustryTypeList(){
    try {
      this.dataSvc.getUDCIndustryTypeList().subscribe({
        next: (res: any) => {
          this.modelSvc.industryTypList = res[res.length - 1]; 
          this.modelSvc.updateDefault();
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveIndustry(formGroup: NgForm) {
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      
      this.save(this.modelSvc.changeIndustryTypeDTO);
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  private save(industryType: ChangeIndustryTypeDTO) {
    try {
      let messageCode = this.messageCode.editCode;
      this.dataSvc.save(industryType).subscribe({
        next: (res: any) => {
          this.setDefault();
          this.showMsg(messageCode);
          this.industryTypeForm.form.markAsPristine();
        },
        error: (e) => {
          this.showErrorMsg(e);
        }
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onClickRadio(item){
    this.modelSvc.changeIndustryTypeDTO.code = item.code;
    this.modelSvc.tempChangeIndustryTypeDTO;
  }

  reset() {
    try {
      this.modelSvc.updateDefault();
      this.industryTypeForm.form.markAsPristine();
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }


}
