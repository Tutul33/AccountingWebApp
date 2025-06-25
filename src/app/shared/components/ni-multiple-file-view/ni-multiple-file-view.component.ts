import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  FileUploadOption,
  ImageFile,
  ModalConfig,
} from '../../models/common.model';
import { FileUploadService } from '../../services/file-upload.service';
import { ModalService } from '../../services/modal.service';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { BaseComponent } from '../base/base.component';
import { ProviderService } from 'src/app/core/services/provider.service';
import { TableModule } from 'primeng/table';
import { NiLoadImageDirective } from '../../directives/ni-load-image.directive';
import { NiFileDownloadDirective } from '../../directives/ni-file-download.directive';
import { CommonModule } from '@angular/common';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ni-multiple-file-view',
  templateUrl: './ni-multiple-file-view.component.html',
  styleUrls: ['./ni-multiple-file-view.component.css'],
  providers: [ModalService],
  standalone:true,
  imports:[CommonModule,TableModule,NiLoadImageDirective,NiFileDownloadDirective]
})
export class NiMultipleFileViewComponent extends BaseComponent implements  OnInit {
  ref: DynamicDialogRef;

  fileOption: FileUploadOption;
  fileIDs: string = null;
  fileList: ImageFile[] = [];

  constructor(
    public modalService: ModalService,
    public dialogService: DialogService,
    private fileUploadService: FileUploadService,
    protected providerSvc: ProviderService,
  ) {super(providerSvc)}

  ngOnInit(): void {
    if (this.modalService.isModal) {
      this.fileOption = this.modalService.modalData.fileOption;
      this.fileIDs = this.modalService.modalData.fileIDs;
    }

    if (this.fileIDs != null) {
      this.LoadFileFromServer();
    }
  }

  async LoadFileFromServer() {
    const pkIDs = this.fileIDs.split(',');

    // Load file  and push in file list
    for (let i = 0; i < pkIDs.length; i++) {
      const loadFileObj = new ImageFile();
      loadFileObj.folderName = this.fileOption.folderName;
      loadFileObj.fileTick = this.fileOption.fileTick;
      loadFileObj.id = Number(pkIDs[i]);

      // image getting from server
      await this.fileUploadService.getImageFile(loadFileObj);

      // collect
      loadFileObj.isThumbnailFormat = false;
      this.fileList.push(loadFileObj);
    }
  }

  // Image Gallery Modal
  imageGalleryModal(fileList, currentFile) {
    // modal config
    const modalConfig = new ModalConfig();
    modalConfig.header = this.fieldTitle['imagegallery'];
    modalConfig.width = '';
    modalConfig.contentStyle = {};
    modalConfig.data = {
      fileList: fileList,
      currentFile: currentFile || fileList[0],
    };

    this.ref = this.dialogService.open(ImageGalleryComponent, modalConfig);
    this.ref.onClose.subscribe((data: any) => {});
  }
}
