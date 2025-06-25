import { AfterViewInit, Directive, Input } from '@angular/core';
import { ImageFile } from '../models/common.model';
import { FileUploadService } from '../services/file-upload.service';
import { FixedIDs } from 'src/app/shared';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[niLoadImage]',
  standalone:true
})
export class NiLoadImageDirective implements AfterViewInit {
  // tslint:disable-next-line: no-input-rename
  @Input('niLoadImage') niLoadImage: any;
  // tslint:disable-next-line: no-input-rename
  @Input('imageOption') imageOption: any;

  loadFileObj: ImageFile;

  constructor(private fileUploadService: FileUploadService) {}

  ngAfterViewInit() {
    this.loadFileObj = this.niLoadImage;

    if (!this.loadFileObj.fileSrc) {
      // if image is inserted
      if (this.loadFileObj.tag === FixedIDs.objectState.unchanged || this.loadFileObj.tag === FixedIDs.objectState.added) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const src = event.target.result;
          this.loadFileObj.filePath = null;
          this.loadFileObj.fileSrc = src;
          this.fileUploadService.setThubnail(this.loadFileObj);
        };
        if (this.loadFileObj.fileObject && this.loadFileObj.fileObject.size) {
          reader.readAsDataURL(this.loadFileObj.fileObject as File);
        } else {
          this.loadImageFromServer(false);
        }
      }

      // if image is edited
      if (this.loadFileObj.tag === FixedIDs.objectState.detached && this.loadFileObj.fileSrc == null) {
        this.loadImageFromServer(true);
      }
    }
  }

  async loadImageFromServer(isParmanent) {
    this.loadFileObj.folderName = this.imageOption.folderName;
    this.loadFileObj.isThumbnailFormat = true;
    if (!isParmanent) {
      this.loadFileObj.fileTick = this.imageOption.fileTick;
    }

    // image getting from server
    await this.fileUploadService.getImageFile(this.loadFileObj);
  }

  // add image source into table
  // _onLoadFile(event) {
  //  let src = event.target.result;
  //  this.loadFileObj.filePath = null;
  //  this.loadFileObj.fileSrc = src;
  //  this.fileUploadService.setThubnail(this.loadFileObj);
  // }
}
