import { Component, OnInit } from '@angular/core';
import { BaseComponent,  ColumnType,  GridOption,  ModalConfig,  ModuleDataService,  ModuleModelService,  ModuleTreeViewComponent,  PageAddEditComponent,  ProviderService, QueryData } from '..';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-page-set-up',
  templateUrl: './page-set-up.component.html',
  providers:[
    ModuleModelService,
    ModuleDataService
  ],
  standalone:true,
  imports:[SharedModule,ModuleTreeViewComponent]
})
export class PageSetUpComponent extends BaseComponent implements OnInit {
tempMenu: any;
tempNode: any;
showPage:boolean=false;
spData:any=new QueryData();
ref: DynamicDialogRef;
gridOption: GridOption = null;

constructor(
  protected providerSvc: ProviderService,
  public modelSvc: ModuleModelService,
  private dataSvc: ModuleDataService,
  public dialogService: DialogService
){
super(providerSvc);
}

ngOnInit(): void {
  this.initGridOption();
}
initGridOption() {
  try {
    const gridObj = {
      title:'',
      dataSource: "modelSvc.pageList",
      columns: this.gridColumns(),
      refreshEvent:this.loadPageList,
      isGlobalSearch: true
    } as GridOption;
    this.gridOption = new GridOption(this, gridObj);
  } catch (e) {
    this.showErrorMsg(e);
  }
}

gridColumns(): ColumnType[] {
  try {
    return [
      { field: "pageName", header: this.fieldTitle["pagename"], style: "" },
      { field: "pageTitle", header: this.fieldTitle["pagetitle"], style: "" },
      { field: "searialNo", header: this.fieldTitle["serialno"], style: "" },
      { field: "action",header: this.fieldTitle["pageaction"], style: "" },     
      { header: this.fieldTitle["action"], style: "" },
    ];
  } catch (error) {
    this.showErrorMsg(error);
  }
}
handleOutputEvent(data: any) {
  try {  
      this.tempMenu = data.selectedMenu;
      this.tempNode = data.selectedNode;

      this.modelSvc.setFileUploadOption();

      this.showPage = true;
      this.modelSvc.setDefaultData(data.selectedMenu);   

      //All Tree View Menu List  
      this.modelSvc.moudleList = data.allMenu;

      //Specific Page of Selected Menu
      this.loadPageList();
  } catch (error) {
    this.showErrorMsg(error);
  }
}
loadPageList() {
  try {
    this.spData.pageNo=0;
    const isPageOrMenu=2;
    const parentID=this.tempMenu.id
    this.dataSvc.GetModuleList(this.spData,isPageOrMenu,parentID).subscribe({
      next: (res: any) => {
        let resData = res[res.length - 1] || [];
        if (resData.length > 0) {
          this.modelSvc.preparePageList(resData);
        } else {
          this.modelSvc.pageList = [];
          this.gridOption.totalRecords = 0;
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

addPage() {
  try {
    this.pageAddEdit();
  } catch (e) {
    this.showErrorMsg(e);
  }
}

editPage(entity: any) {
  try {
    this.pageAddEdit(entity);
  } catch (e) {
    this.showErrorMsg(e);
  }
}

pageAddEdit(page?:any) {
  try {
    const modalConfig = new ModalConfig();
    modalConfig.header = page?this.fieldTitle['editpage']:this.fieldTitle['addpage'];
    var obj = {
      page:page,
      menu:this.tempMenu,
      pageList:this.modelSvc.pageList
    };
    modalConfig.data = obj;
    this.ref = this.dialogService.open(PageAddEditComponent, modalConfig);
    this.ref.onClose.subscribe((data: any) => {
      if (data) { 
        if(page){
          this.modelSvc.updateCollection(data.body);      
        }else{
          this.loadPageList();
        }
      }
    });
  } catch (e) { 
    this.showErrorMsg(e);
  }
}
deletePage(page) {
  try {
    this.utilitySvc
      .showConfirmModal(this.messageCode.confirmDelete)
      .subscribe((isConfirm: boolean) => {
        if (isConfirm) {
          this.dataSvc.DeleteModule(page.id).subscribe({
            next: (res: any) => {
              this.showMsg(this.messageCode.deleteCode);      
              this.modelSvc.deleteCollection(page);        
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
}
