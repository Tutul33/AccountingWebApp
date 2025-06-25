import { HttpEventType, HttpResponse } from '@angular/common/http';
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
import { GlobalConstants, FixedIDs } from '../../index';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { NiFileDownloadDirective } from '../../directives/ni-file-download.directive';
import { NiLoadImageDirective } from '../../directives/ni-load-image.directive';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';


// import { ImageGalleryComponent } from '../../commonComponents/image-gallery/image-gallery.component';
// import { FileUploadOption, ImageFile, ModalConfig } from '../../shared/models/common.model';
// import { FileUploadService } from '../services/file-upload.service';
// import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [ModalService],
  standalone:true,
  imports:[CommonModule,TableModule,ProgressBarModule,ButtonModule,NiFileDownloadDirective,NiLoadImageDirective]
})
export class FileUploadComponent implements OnInit {
  userID: number;
  isChanged = false;
  isPageChanged = false;
  uploadOption: FileUploadOption;
  selectedFiles?: FileList;
  targetObjectList: ImageFile[] = [];

  ref: DynamicDialogRef;

  constructor(
    public modalService: ModalService,
    public dialogService: DialogService,
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit(): void {
    if (this.modalService.isModal) {
      this.userID = GlobalConstants.userInfo.userPKID; //100000307; //TODO nedd check userPKID is null
      this.uploadOption = this.modalService.modalData.uploadOption;
      this.targetObjectList = this.modalService.modalData.targetObjectList;
    }
  }

  // browse from computer
  onSelectFiles(event): void {
    this.selectedFiles = event.target.files;

    if (this.selectedFiles.length !== 0) {
      let isUnexpectedFileFound = false;
      const unexpectedFiles = [];
      // push files into list to show into grid
      for (let i = 0; i < this.selectedFiles.length; i++) {
        if (
          this.fileUploadService.isSelectedFileValid(
            this.selectedFiles.item(i).name,
            this.uploadOption.acceptedFiles
          )
        ) {
          // check whether the selected file exist into list
          const nmInd = this.targetObjectList.find(
            (x) => x.fileName === this.selectedFiles[i].name && x.tag !== 2
          );
          if (nmInd == null) {
            const fileObj = new ImageFile();
            fileObj.fileObject = this.selectedFiles.item(i);
            fileObj.fileName = this.selectedFiles.item(i).name;
            fileObj.tag = FixedIDs.objectState.unchanged; // insert mode
            fileObj.fileChecked = true;
            fileObj.folderName = this.uploadOption.folderName;
            fileObj.fileTick = this.uploadOption.fileTick;
            fileObj.isUploaded = false;
            fileObj.id = this.targetObjectList.length;
            fileObj.progressId = Math.random().toString().replace('.', '');
            // splitname[splitname.length - 2] + splitname[splitname.length - 1];
            fileObj.progress = 0;

            fileObj.filePath = null;
            fileObj.fileSrc = null;

            // push into list if it is not exist into list
            this.targetObjectList.push(fileObj);

            this.isChanged = true;
            this.isPageChanged = true;
          }
        } else {
          isUnexpectedFileFound = true;
          unexpectedFiles.push(this.selectedFiles.item(i).name);
        }
      } // end for
      if (isUnexpectedFileFound) {
        alert(
          'System found some unexpected files: ' +
          unexpectedFiles.join(', ') +
          '; allowed extensions are: ' +
          this.uploadOption.acceptedFiles
        );
      }
    }
    event.currentTarget.value = ''; // to fire change event
  }
  
  onUploadFiles() {
    const uploadServiceUrl = this.uploadOption.uploadServiceUrl;
    // those file which are not uploaded and whose tag is 4 (insert mode)
    const selectedFiles = this.targetObjectList.filter(
      (x) => x.fileChecked && !x.isUploaded && x.tag === FixedIDs.objectState.unchanged
    );
    let totalPrg = 0;
    const unitPrg = 100 / selectedFiles.length;
    for (let i = 0; i < selectedFiles.length; i++) {
      // userInfo.userPKID
      const flObject = {
        userID: this.userID,
        id: selectedFiles[i].id,
        fileName: selectedFiles[i].fileName,
        progressId: selectedFiles[i].progressId,
        fileTick: selectedFiles[i].fileTick,
      };
      // TODO: need to add in upload service
      // imageUploadSvc.removeImageFromCache(selectFiles[i].id, this.uploadOption.folderName);

      const currentIndex = this.targetObjectList.indexOf(selectedFiles[i]);

      // file upload service
      this.fileUploadService
        .uploadFile(
          uploadServiceUrl,
          this.uploadOption.folderName,
          flObject,
          selectedFiles[i].fileObject
        )
        .subscribe(
          (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              const progress = Math.round((100 * event.loaded) / event.total);
              this.targetObjectList[currentIndex].progress = progress;
            } else if (event instanceof HttpResponse) {
              // file is uploaded successfully
              const uploadedFile = this.targetObjectList.find(
                (x) => x.fileName === event.body.imgName && x.tag !== 2
              );
              uploadedFile.isUploaded = true;
              uploadedFile.tag = FixedIDs.objectState.added;
              const totalUpFile = this.targetObjectList.filter(
                (x) => x.fileChecked && x.isUploaded && x.tag === FixedIDs.objectState.added
              );
              const checkFile = this.targetObjectList.filter(
                (x) => x.fileChecked && x.tag === FixedIDs.objectState.added
              );
              if (totalUpFile.length === checkFile.length) {
                this.uploadOption.uploadCompleted = true;
              }
              // total upload progress
              totalPrg += unitPrg;
              this.setCurrentUploadedFileVirtualPath(uploadedFile);

              this.isPageChanged = false;
            }
          },
          (error) => {
            this.targetObjectList[currentIndex].progress = 0;
            
          }
        );
    }
  }

  // remove image
  removeImage(fileNum) {
    //  ctrl.$setDirty();
    if (
      this.targetObjectList[fileNum].tag === FixedIDs.objectState.unchanged ||
      this.targetObjectList[fileNum].tag === FixedIDs.objectState.added
    ) {
      // for new images
      this.targetObjectList.splice(fileNum, 1);
    } else if (this.targetObjectList[fileNum].tag === FixedIDs.objectState.detached) {
      // for update images
      this.targetObjectList[fileNum].tag = FixedIDs.objectState.deleted;
    }
    // willAllFileSelected();
    this.isChanged = true;
  }

  //// select image
  // selectImage(fileNum) {
  //  this.targetObjectList[fileNum].fileChecked = !this.targetObjectList[fileNum].fileChecked;
  //  //this.willAllFileSelected();
  // };

  //// used to set all check box selection
  // willAllFileSelected() {
  //  let isSelectAll = true;
  //  for (let i = 0; i < this.targetObjectList.length; i++) {
  //    if (!this.targetObjectList[i].fileChecked) {
  //      isSelectAll = false;
  //      break;
  //    }
  //  }
  //  if (isSelectAll === true) {
  //    this.isSelectAll = isSelectAll;
  //  } else {
  //    this.isSelectAll = isSelectAll;
  //  }
  // }

  setCurrentUploadedFileVirtualPath(selectedFile) {
    try {
      const flObject = {
        folderName: this.uploadOption.folderName,
        userID: this.userID,
        id: selectedFile.id,
        fileName: selectedFile.fileName,
        fileTick: selectedFile.fileTick,
      };
      // image getting from server
      this.fileUploadService
        .getCurrentUploadedFileVirtualPath(flObject)
        .subscribe((data) => {
          const uploadedFile = this.targetObjectList.find(
            (x) => x.fileName === data.fileName && x.tag !== 2
          );

          if (uploadedFile) {
            uploadedFile.filePath = data.filePath;
          }
        });
    } catch (e) {
      
    }
  }

  // close modal
  _closeModal() {
    // remove unsave images
    const selectedFiles = this.targetObjectList.filter((x) => x.tag === FixedIDs.objectState.unchanged);
    // those images which are not uploaded and whose tag is 4 (insert mode)
    for (let i = 0; i < selectedFiles.length; i++) {
      const index = this.targetObjectList.indexOf(selectedFiles[i]);
      this.targetObjectList.splice(index, 1);
    }
    // make object liteweight
    for (let j = 0; j < this.targetObjectList.length; j++) {
      this.targetObjectList[j].fileObject = null;
      this.targetObjectList[j].fileSrc = null;
    }
  }

  onClose() {
    if (this.modalService.isModal) {
      this._closeModal();

      const data: any = [];
      data.isChanged = this.isChanged;
      data.targetObjectList = this.targetObjectList;

      this.modalService.close(data);
    }
  }

  // Image Gallery Modal
  imageGalleryModal(fileList, currentFile) {
    // modal config
    const modalConfig = new ModalConfig();
    modalConfig.header = 'Image Gallery';
    modalConfig.width = '';
    modalConfig.contentStyle = {};
    modalConfig.data = {
      fileList: fileList,
      currentFile: currentFile,
    };

    this.ref = this.dialogService.open(ImageGalleryComponent, modalConfig);
    this.ref.onClose.subscribe((data: any) => { });
  }

  isMultipleUpload() {
    let fileList = this.targetObjectList.filter(x => !x.isDeleted())
    if (!this.uploadOption.isMultipleUpload && fileList.length > 0)
      return true;
    else
      return false;
  }

}
