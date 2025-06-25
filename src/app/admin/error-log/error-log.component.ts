import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormGroup, NgForm, Validators, FormsModule } from "@angular/forms";
import {
  ErrorLogDataService,
  ErrorLogModelService,
} from "../services/error-log/error-log.service";

import {
  BaseComponent,
  ProviderService,
  ValidatorDirective,
} from "src/app/shared";
import { ColumnType, GridOption } from "src/app/shared/models/common.model";
import {
  ErrorLog,
  errorLogValidation,
} from "../models/error-log/error-log-model";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-error-log',
  templateUrl: './error-log.component.html',
  providers: [ErrorLogDataService, ErrorLogModelService],
  standalone:true,
  imports:[SharedModule]
})
export class ErrorLogComponent extends BaseComponent implements OnInit {
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("errorLogForm", { static: true, read: NgForm })
  errorLogForm: NgForm;
  validationMsgObj: any;
  gridOption: GridOption;
  constructor(
    protected providerSvc: ProviderService,
    public errorLogDataSVC: ErrorLogDataService,
    public errorLOgModelSVC: ErrorLogModelService
  ) {
    super(providerSvc);
    this.validationMsgObj = errorLogValidation();
  }

  ngOnInit(): void {
    this.errorLOgModelSVC.errorlogModel = new ErrorLog();
    this.initGridOption();
    this.setDefaultData();
  }
  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "errorLOgModelSVC.errorlogModel.errorList",
        columns: this.gridColumns(),
        refreshEvent: this.search,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  gridColumns(): ColumnType[] {
    return [
      { header: "Serial No" },
      { field: "userName", header: "User" },
      { field: "moduleName", header: "Page Name" },
      { field: "actionName", header: "Action" },
      { field: "title", header: "Title" },
      { field: "errorMessage", header: "Message" },
      { field: "stackTrace", header: "Message Dtl" },
      { field: "dateTime", header: "Datetime" },
    ];
  }
  public setDefaultData() {
    this.getUserList();
    this.getPageList();
  }
  public getUserList() {
    this.errorLogDataSVC.gerUserList().subscribe({
      next: (result: any) => 
      {
        this.errorLOgModelSVC.errorlogModel.userList = result;
      },
      error: (e: any) => {
        this.showErrorMsg(e);
      },
    });
  }
  public getPageList() {
    this.errorLogDataSVC.gerPageList().subscribe({
      next: (result: any) => 
      {
        this.errorLOgModelSVC.errorlogModel.pageList = result;
      },
      error: (e: any) => {
        this.showErrorMsg(e);
      },
    });
  }
  onSearch(formGroup: NgForm) {
    debugger
    try {
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      if(this.errorLOgModelSVC.errorlogModel.userId)
      {
        const pageId = formGroup.controls["pageId"];
        const dateFrom = formGroup.controls["dateFrom"];
        const dateTo = formGroup.controls["dateTo"];

        pageId.clearValidators();
        pageId.updateValueAndValidity();

        dateFrom.clearValidators();
        dateFrom.updateValueAndValidity();

        dateTo.clearValidators();
        dateTo.updateValueAndValidity();

      }
     else if(this.errorLOgModelSVC.errorlogModel.pageId)
      {
        const userId = formGroup.controls["userId"];
        const dateFrom = formGroup.controls["dateFrom"];
        const dateTo = formGroup.controls["dateTo"];

        userId.clearValidators();
        userId.updateValueAndValidity();

        dateFrom.clearValidators();
        dateFrom.updateValueAndValidity();

        dateTo.clearValidators();
        dateTo.updateValueAndValidity();
      }

    else if(this.errorLOgModelSVC.errorlogModel.dateFrom && this.errorLOgModelSVC.errorlogModel.dateTo)
      {
        const pageId = formGroup.controls["pageId"];
        const userId = formGroup.controls["userId"];

        pageId.clearValidators();
        pageId.updateValueAndValidity();

        userId.clearValidators();
        userId.updateValueAndValidity();
      }



      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      this.search();
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  
  search() 
  {
    try {
      let fromDate =null;
      let toDate=null;
      if(this.errorLOgModelSVC.errorlogModel.dateFrom && this.errorLOgModelSVC.errorlogModel.dateTo)
      {
        fromDate=  this.errorLOgModelSVC.errorlogModel.dateFrom.toLocaleDateString();
        toDate=  this.errorLOgModelSVC.errorlogModel.dateTo.toLocaleDateString();
      }
     
      this.errorLogDataSVC.gerErrorLog(this.errorLOgModelSVC.errorlogModel.userId, this.errorLOgModelSVC.errorlogModel.pageId, fromDate, toDate
        )
        .subscribe({
          next: (result: any) => {
            this.errorLOgModelSVC.errorlogModel.errorList = result;
          },
          error: (err: any) => {
            this.showErrorMsg(err);
          },
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }
  reset(formGroup: NgForm) 
  {
    formGroup.resetForm();
  }

  onErrorlogBlurUser(){
    try {
      
      // if(this.errorLOgModelSVC.errorlogModel.userId)
      // {
      //   // this.errorLOgModelSVC.errorlogModel.pageId = null;
      //   // this.errorLOgModelSVC.errorlogModel.dateFrom = null;
      //   // this.errorLOgModelSVC.errorlogModel.dateTo = null;
      // }

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onErrorlogBlurPage(){
    try {
      
      //if(this.errorLOgModelSVC.errorlogModel.pageId){      
        // this.errorLOgModelSVC.errorlogModel.userId = null;
        // this.errorLOgModelSVC.errorlogModel.dateFrom = null;
        // this.errorLOgModelSVC.errorlogModel.dateTo = null;
      //}
    
    } catch (e) {
      this.showErrorMsg(e);
    }
  }




}

