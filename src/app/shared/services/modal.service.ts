import { Injectable, Injector } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
interface IModalCloseEventFunc { (data?: any): any; }

@Injectable()
export class ModalService {

  private ref: DynamicDialogRef;
  private config: DynamicDialogConfig;
  //public activatedRoute: ActivatedRoute;

  isModal: boolean = false;
  modalData?: any;
  closeEvent: IModalCloseEventFunc = null;

  constructor(private injector: Injector) {
    //this.activatedRoute = this.injector.get(ActivatedRoute);
    //const data: Data = this.activatedRoute.snapshot.data;    

    this.ref = this.injector.get(DynamicDialogRef, null);
    this.config = this.injector.get(DynamicDialogConfig, null);

    if (this.ref) {
      this.isModal = true;
    }

    if (this.config) {
      this.modalData = this.config.data;
    }
  }

  //set header
  setHeader(header: string) {
    this.config.header = this.config.header == 'Modal' ? header : this.config.header;
  }

  //set width
  setWidth(width: string) {
    this.config.width = width;
  }

  setClass(className:string){
    this.config.styleClass = className;
  }

  //modal close
  close(result?: any) {
    this.ref.close(result);
  }

}
