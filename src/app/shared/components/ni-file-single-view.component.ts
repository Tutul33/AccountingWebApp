import { AfterContentInit, Component, Input, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalConfig, ImageFile } from '../models/common.model';
import { FileUploadService } from '../services/file-upload.service';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';
import { FixedIDs, ProviderService } from 'src/app/shared';
import { BaseComponent } from './base/base.component';
import { NiFileDownloadDirective } from '../directives/ni-file-download.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ni-file-single-view',
  template: `
    <div class="attachedImage"  *ngIf="!isFullImage">
          <img style="{{customStyle}}"
            src="{{
              targetObject.thubnailSrc
                ? targetObject.thubnailSrc
                : targetObject.fileSrc
            }}"
            alt=""
            class="img-responsive"
          />
          <div
            *ngIf="targetObject.thubnailSrc && targetObject.filePath"
            [niFileDownload]="targetObject.filePath"
            class="attachedImageHover"
          ></div>
          <div
            *ngIf="!targetObject.thubnailSrc && targetObject.fileName"
            (click)="imageGalleryModal(targetObject)"
            class="attachedImageHover"
          ></div> 
    </div>

    <div class="attachedFullImage" *ngIf="isFullImage">
        <img style="{{customStyle}}"
          src="{{
            targetObject.thubnailSrc
              ? targetObject.thubnailSrc
              : targetObject.fileSrc
          }}"
          alt=""
          class="img-responsive"
        />
        <div
          *ngIf="targetObject.thubnailSrc && targetObject.filePath"
          [niFileDownload]="targetObject.filePath"
          class="attachedImageHover"
        ></div>
        <div
          *ngIf="!targetObject.thubnailSrc && targetObject.fileName"
          (click)="imageGalleryModal(targetObject)"
          class="attachedImageHover"
        ></div>
  </div>
  `,
  styles: [
    `
      .attachedImage img {
        width: 120px;
        height: 120px;
        margin: 0 auto;
      }

      .attachedFullImage img {
        width: 100%;
        height: 100%;             
        margin: 0 auto;
      }

      .attachedImageHover {
        width: 18px;
        height: 18px;
        border: 1px solid red;
      }
    `,
  ],
  standalone:true,
  imports:[NiFileDownloadDirective,CommonModule]
})


export class NiFileSingleViewComponent extends BaseComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('uploadOption') uploadOption: any;
  // tslint:disable-next-line: no-input-rename
  @Input('targetObject') targetObject?: any;
  // tslint:disable-next-line: no-input-rename
  @Input('objectId') objectId: any;
  // if need to display full resulation image
  @Input('isFullImage') isFullImage?: boolean;
  // if need to display image with custome style
  @Input('customStyle') customStyle?: any;

  ref: DynamicDialogRef;

  constructor(
    private fileUploadService: FileUploadService,
    public dialogService: DialogService,
    protected providerSvc: ProviderService,
  ) {
    super(providerSvc);
   }

  ngOnInit() {   
    if(!this.customStyle) this.customStyle = ""; 
    if (!this.targetObject.fileSrc) {
      this.loadImageFromServer(false);
    }
  }

  ngOnChanges() {
    if (!this.targetObject) {
      this.targetObject = new ImageFile();
    }
    if (this.targetObject != null) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const src = event.target.result;
        this.targetObject.filePath = null;
        this.targetObject.fileSrc = src;
        this.fileUploadService.setThubnail(this.targetObject);
      };

      if (this.targetObject.tag === FixedIDs.objectState.added) {
        if (this.targetObject.fileObject && this.targetObject.fileObject.size) {
          reader.readAsDataURL(this.targetObject.fileObject);
        } else {
          this.loadImageFromServer(false);
        }
      } else {
        this.loadImageFromServer(true);
      }
    }
  }

  async loadImageFromServer(isParmanent) {
    if (this.objectId != 0 && (this.targetObject.deletedFileName == null || this.targetObject.fileName)) {
      this.targetObject.id = this.objectId;
      this.targetObject.folderName = this.uploadOption.folderName;
      this.targetObject.isThumbnailFormat = !this.isFullImage;
      if (!isParmanent) {
        this.targetObject.fileTick = this.uploadOption.fileTick;
      }

      // image getting from server
      await this.fileUploadService.getImageFile(this.targetObject);
    } else {
      const data = this.fileUploadService.setNotFoundImage();
      this.targetObject.fileSrc = data.fileStream;
      this.targetObject.filePath = data.filePath;
      this.fileUploadService.setThubnail(this.targetObject);
    }
  }

  // Image Gallery Modal
  imageGalleryModal(currentFile) {
    // modal config
    const modalConfig = new ModalConfig();
    modalConfig.header =this.fieldTitle['imagegallery'] //'Image Gallery';
    modalConfig.width = '';
    modalConfig.contentStyle = {};
    modalConfig.data = {
      fileList: [currentFile],
      currentFile: currentFile,
    };

    this.ref = this.dialogService.open(ImageGalleryComponent, modalConfig);
    this.ref.onClose.subscribe((data: any) => { });
  }
}
