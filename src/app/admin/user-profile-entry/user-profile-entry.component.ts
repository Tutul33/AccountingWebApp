import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, NgForm, FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from "rxjs";
import { FileUploadOption, GlobalMethods } from 'src/app/shared';
import { ImageFile } from 'src/app/shared/models/common.model';
import {
  ProviderService,
  BaseComponent,
  ModalService,
  ModalConfig,
  ValidatorDirective,
  UserProfileDataService,
  UserProfileModelService,
  EmployeeListComponent,
  QueryData
} from '../index';
import { UserProfile, UserProfileValidation } from 'src/app/admin/models/user-profile/user-profile.model'
import { MenuService } from 'src/app/shared/services/menu.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-user-profile-entry',
  templateUrl: './user-profile-entry.component.html',
  providers: [ModalService, UserProfileModelService, UserProfileDataService],
  standalone:true,
  imports:[SharedModule]
})
export class UserProfileEntryComponent extends BaseComponent implements OnInit {

  private $unsubscribe = new Subject<void>();
  ref: DynamicDialogRef;
  spData: any = new QueryData();
  @ViewChild("userProfileForm", { static: true, read: NgForm }) userProfileForm: NgForm;
  @ViewChild(ValidatorDirective) directive; 
  public validationMsgObj: any;
  singleFileUploadOption: FileUploadOption;
  userTypeList = [];
  autoCompleteUserList = [];
  employeeID: string = null;

  constructor(
    protected providerSvc: ProviderService,
    public dialogService: DialogService,
    public modalService: ModalService,
    public modelSvc: UserProfileModelService,
    private dataSvc: UserProfileDataService,
    private menuService: MenuService,
  ) {
    super(providerSvc);
    this.validationMsgObj = UserProfileValidation();
  }

  ngOnInit(): void {
    this.setSingleFileOption();
    this.getUserListData(true, true);
    this.getUserTypeList(true);
    this.prepareUserInfoObj();
  }

  setSingleFileOption() {
    try {
      this.singleFileUploadOption = new FileUploadOption();
      this.singleFileUploadOption.folderName = 'Employee/PI';
      this.singleFileUploadOption.uploadServiceUrl = 'File/UploadFiles';
      this.singleFileUploadOption.acceptedFiles = '.png,.jpg,.jpeg,.gif';
      this.singleFileUploadOption.fileTick = GlobalMethods.timeTick();
      this.modelSvc.userProfile.imageFile = new ImageFile();
      this.modelSvc.userProfile.imageFile.fileTick = GlobalMethods.timeTick();
    } catch (e) {
      throw e;
    }
  }

  getUserListData(isRefresh: boolean, isActive: boolean) {
    try {
      this.spData = new QueryData({
        pageNo: 0,
        isRefresh: isRefresh
      });
      this.dataSvc.getUserListData(this.spData, isActive).subscribe({
        next: (res: any) => { 
          this.autoCompleteUserList = res[res.length - 1] || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }

  getUserTypeList(isRefresh: boolean) {
    try {
      this.spData = new QueryData({
        pageNo: 0,
        isRefresh: isRefresh
      });

      this.dataSvc.getUserTypeList(this.spData).subscribe({
        next: (res: any) => { 
          this.userTypeList = res[res.length - 1] || [];
        },
        error: (res: any) => {
          this.showErrorMsg(res);
        },
      });
    } catch (error) {
      this.showErrorMsg(error);
    }
  }


  prepareUserInfoObj() {
    try {
      this.dataTransferSvc
        .on("userInfoObj")
        .pipe(takeUntil(this.$unsubscribe))
        .subscribe((response) => {
          if (response) {
            let userInfoDTO = [];
            userInfoDTO.push(response["entity"]);
            if (userInfoDTO[0].id > 0) {
              this.modelSvc.userProfile.fileName = userInfoDTO[0].fileName;
              this.employeeID = userInfoDTO[0].hR_EmployeeID;
              this.modelSvc.prepareObjForEdit(userInfoDTO);
            }
            this.dataTransferSvc.remove("userInfoObj");
          }
          this.dataTransferSvc.unsubscribe(this.$unsubscribe);
        });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  showMemberList() {
    try {
      const modalConfig = new ModalConfig();
      modalConfig.data = {
        option: 1,
        isActive: true
      };
      this.ref = this.dialogService.open(
        EmployeeListComponent,
        modalConfig
      );
      this.ref.onClose.subscribe((obj: any) => {
        this.bindEmployeeData(obj);
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  bindEmployeeData(obj: any)
  {
    try {
      if(obj.id != null)        
      {
        this.modelSvc.userProfile.employeeID = obj.id;        
      }
      else
      {
        this.modelSvc.userProfile.employeeID = null;
      }
      if(obj.hR_EmployeeID != null)    
      {
        this.employeeID = obj.hR_EmployeeID;        
      }
      else
      {
        this.employeeID = null;
      }
      if(obj.employeeName != null)
      {
        this.modelSvc.userProfile.userName = obj.employeeName;
      }
      else
      {
        this.modelSvc.userProfile.userName = null;
      }
      if(obj.userID != null)
      {
        this.modelSvc.userProfile.userID = obj.userID;        
      }
      else
      {
        this.modelSvc.userProfile.userID = null;
      }
      
      if(obj.email != null)
      {
        this.modelSvc.userProfile.email = obj.email;
      }
      else
      {
        this.modelSvc.userProfile.email = null;
      }

      if(obj.contactNo != null)
      {
        this.modelSvc.userProfile.contactNo = obj.contactNo;
      }
      else
      {
        this.modelSvc.userProfile.contactNo = null;
      }
      if(obj.fileName != null)
        {
          this.modelSvc.userProfile.fileName = obj.fileName;
          this.modelSvc.prepareUserData(obj);
        }
        else
        {
          this.modelSvc.userProfile.fileName = null;
          this.modelSvc.userProfile.imageFile = new ImageFile();
        }
      
    } catch (error) {
      throw error;
    }
  }

   
  saveUserProfile(formGroup: NgForm)
  {
    try{
      if (!formGroup.valid) {
        this.directive.validateAllFormFields(formGroup.form as UntypedFormGroup);
        return;
      }
      //check password match
      if (!this.modelSvc.checkPasswordMatch()) {
        this.showMsg('2191');
        return;
      }

      this.modelSvc.prepareDataBeforeSave();
      this.save(this.modelSvc.userProfile);

    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  private save(userProfileData: UserProfile) {
    try {
      let messageCode = userProfileData.id ? this.messageCode.editCode : this.messageCode.saveCode;

      this.dataSvc.save(userProfileData).subscribe({
        next: (res: any) => {
          //this.modelSvc.userInfoList.push(res.body);

          this.setNew();
          this.showMsg(messageCode);
        },
        error: (res: any) => {
          if(res.error.message == '896')
          {
            this.showMsg(this.messageCode.duplicateEntry);
          }
          else if(res.error.message == '2199')
          {
            this.showMsg('2199');
          }
          else
          {
            this.showErrorMsg(this.messageCode);
          }
        },
      });
    } catch (e) {
      this.showErrorMsg(e);
    }
  }

  
  setNew() {
    try {
      this.modelSvc.userProfile = new UserProfile;
      this.formResetByDefaultValue(this.userProfileForm.form, this.modelSvc.UserProfile);
      this.focus(this.userProfileForm.form, 'UserProfile');
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  reset() {
    try { 
      this.focus(this.userProfileForm.form, "userProfile");
      if (this.modelSvc.userProfile.id > 0) {
        this.modelSvc.prepareObjForEdit(this.modelSvc.tempuserProfile);
        this.userProfileForm.form.markAsPristine();
      } 
      else {
        this.setNew();
      }
    }
    catch (e) {
      this.showErrorMsg(e);
    }
  }

  viewUserListPage() {
    try {
      let navigateUrl = '/ADMIN-PAGE/manage-user-profile';
      this.menuService.setpageInfoByUrl(navigateUrl);
      this.router.navigateByUrl(navigateUrl);
    } catch (error) {
      this.showErrorMsg(error);
    }
  }
}
