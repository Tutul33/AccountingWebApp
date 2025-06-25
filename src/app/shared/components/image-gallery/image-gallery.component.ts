import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../../services/file-upload.service';
import { ModalService } from '../../services/modal.service';
import { GalleriaModule } from 'primeng/galleria';


@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  providers: [ModalService],
  standalone:true,  
  imports:[GalleriaModule]
})
export class ImageGalleryComponent implements OnInit {
  // config
  currentIndex = 0;
  isMultiple = false;
  responsiveOptions: any = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 2,
    },
  ];

  currentFile = {};
  fileList = [];
  photoGallery: any = [];

  constructor(
    private modalService: ModalService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    if (this.modalService.isModal) {
      this.fileList = this.modalService.modalData.fileList;
      this.currentFile = this.modalService.modalData.currentFile;
      this.modalService.setClass('ecom-modal photo-modal');
      this.modalService.setWidth('650px');
      if (this.fileList) {
        this.init();
      }
    }
  }
  

  // showImageModal
  init() {
    const thumbnailPictureList = this.fileList.filter(
      (x) => x.isThumbnailFormat && x.isUploaded
    );
    const realPictureList = this.fileList.filter(
      (x) => x.isThumbnailFormat === false || x.isUploaded === false
    );

    if (thumbnailPictureList.length > 0) {
      this.fileList = [];
      this.currentFile = {};
      for (let i = 0; i < realPictureList.length; i++) {
        this.fileList.push(realPictureList[i]);
      }
      this.loadImage(thumbnailPictureList, 0, false);
    } else {
      this.loadImagesInGallary(realPictureList);
    }
  }

  loadImagesInGallary(realPictureList) {
    // check file type is image or not
    const imageType = 'image';
    this.photoGallery = realPictureList.filter(
      (x) => x.fileSrc && x.fileSrc.indexOf(imageType) > -1
    );

    // get current file index from photot gallary
    const curIndex = this.photoGallery.indexOf(this.currentFile);
    this.currentIndex = curIndex > -1 ? curIndex : 0;
    // for multiple image show
    this.isMultiple = this.photoGallery.length > 1 ? true : false;
  }

  async loadImage(fileListForRender, index, needInitialization) {
    const loadFileObj = fileListForRender[index];
    loadFileObj.fileObject = null;

    loadFileObj.isThumbnailFormat =
      loadFileObj.isUploaded === true ? false : true;
    index++;

    // image getting from server
    await this.fileUploadService.getImageFile(loadFileObj);

    loadFileObj.isThumbnailFormat = false;
    this.fileList.push(loadFileObj);

    // check recursive index condition. If condion true then call current method again for getting another image
    // else call image gallery init method to render image in gallery
    if (fileListForRender.length > index) {
      this.loadImage(fileListForRender, index, false);
    } else {
      // Put first image in the gallery
      this.currentFile = this.fileList[0];
      if (needInitialization) {
        index = 0;
      }
      this.init();
    }
  }
}
