import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, ProviderService, QueryData, ValidatingObjectFormat, ValidatorDirective } from 'src/app/app-shared';
import { ModalService } from 'src/app/shared';
import { NgForm } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubLedgerDataService, SubLedgerModelService } from '..';
import { ColumnType, FileOption, GridOption } from 'src/app/shared/models/common.model';
import { SubLedgerAttachmentDTO, SubLedgerDTO } from '../models/sub-ledger/sub-ledger.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-sub-ledger-upload',
  templateUrl: './sub-ledger-upload.component.html',
  providers: [SubLedgerDataService, SubLedgerModelService, ModalService],
  standalone:true,
  imports:[SharedModule]
})
export class SubLedgerUploadComponent extends BaseComponent implements OnInit {

  public validationMsgObj: ValidatingObjectFormat;
  @ViewChild(ValidatorDirective) directive;
  @ViewChild("subLedgerUploadForm", { static: true, read: NgForm }) subLedgerUploadForm: NgForm;
  spData: any = new QueryData();
  ref: DynamicDialogRef;
  fileName: string;
  dataList: any = [];

  constructor(
    protected providerSvc: ProviderService,
    public modelSvc: SubLedgerModelService,
    public modalService: ModalService,
    public dataSvc: SubLedgerDataService,
  ) {
    super(providerSvc);
  }

  ngOnInit(): void {

    this.getSubLedgerTypeList();
    this.modelSvc.subLedgerDTO = new SubLedgerDTO();
    this.modelSvc.subLedgerDTO.subLedgerFile = new SubLedgerAttachmentDTO();
    this.modelSvc.fileUpload = this.modelSvc.fileUploadOption();
    this.modelSvc.configFilePath();
  }

  getSubLedgerTypeList() {
    try {
      this.dataSvc.getSubLedgerTypeList().subscribe({
        next: (res: any) => {
          let data = res[res.length - 1] || [];
          this.modelSvc.subLedgerTypeList = data;
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
        complete: () => { },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  onSelectSubLedgerType() {
    try {
      this.modelSvc.newFileInfo.subLedgerTypeID = this.modelSvc.subLedgerDTO.subLedgerTypeID;
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  fileUploadModal() {
    try {
      this.fileName = this.modelSvc.subLedgerDTO.subLedgerFile.fileName;
      this.modelSvc.fileOption.fileName = this.fileName;
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  onRemoveImage() {
    try {
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  closeModal() {
    try {
      if (this.modalService.isModal) {
        this.modalService.close();
      }
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  saveProjectUpload(subLedgerUploadForm: NgForm) {
    try {

      let messageCode = this.messageCode.saveCode;
      this.dataSvc
        .saveSubLedgerUpload(this.spData, this.modelSvc.newFileInfo)
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.showMsg(messageCode);
              this.modalService.close(res);
            }else{
              this.showMsg('2284');
              this.modalService.close(res);
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

  gridOption: GridOption;
  exportToExcel(): void {
    try {
      let subLedgerType = this.modelSvc.subLedgerTypeList.find(x => x.id == this.modelSvc.subLedgerDTO.subLedgerTypeID).value;
      this.dataList.push({'subLedgerType':subLedgerType});
      this.initGridOption();
      this.gridOption.exportOption.title = this.fieldTitle['subledger'];
      this.modelSvc.exportCSVReport(this.gridOption, this.dataList, this.gridOption.columns);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  initGridOption() {
    try {
      const gridObj = {
        title: "",
        dataSource: "dataList",
        columns: this.GridColumns(),
        paginator: true,
        isGlobalSearch: false,
        exportOption: {
          exportInPDF: false,
          exportInXL: true,
          title: "",
        } as FileOption,
      } as GridOption;
      this.gridOption = new GridOption(this, gridObj);
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  GridColumns(): ColumnType[] {
    let list = [];
    list.push(
      { field: "subLedgerType", header: "SubLedgerType" },
      { field: "subLedger", header: "SubLedger" },
      { field: "mobile", header: "Mobile" },
      { field: "email", header: "Email" },
    )
    return list;
  }

}
