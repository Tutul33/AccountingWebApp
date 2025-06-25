import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, IPattern } from "src/app/shared/models/common.model";

export class ProjectDTO {
    id: number = 0;
    name: string = null;
    address: string = null;
    contactPerson: string = null;
    contactPersonEmail: string = null;
    contactPersonMobileNo: string = null;
    website: string = null;
    orgID: number = null;
    isActive: boolean = true;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    insertDateTime: Date= new Date(); 


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    tag: any = 0;
    orgName: string = null;
    projectFile: ProjectAttachmentDTO = new ProjectAttachmentDTO();
    companyID: number = null;
    unitBranchID: number = null;
    companyName: string = null;
    unitBranchName: string = null;
  
    constructor(defaultData?: Partial<ProjectDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function projectValidation(): any {
    return {
        projectValidation: {
            companyID: {
                required: 'Company is required.',
            },
            name: {
                required: 'Project name is required.',
                maxlength:{
                  message: 'Value max length 75!',
                  length: 75
                } as ICharachterLength,
            },
            address: {
                maxlength:{
                  message: 'Value max length 75!',
                  length: 75
                } as ICharachterLength
            },
            contactPerson: {
                maxlength:{
                  message: 'Value max length 50!',
                  length: 50
                } as ICharachterLength
            },
            contactPersonEmail: {
                maxlength:{
                  message: 'Value max length 50!',
                  length: 50
                } as ICharachterLength,
                pattern: {
                  message: "Enter Valid Email",
                  regex: "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}"
                } as IPattern
            },
            contactPersonMobileNo: {
                maxlength:{
                  message: 'Value max length 50!',
                  length: 50
                } as ICharachterLength,
                pattern: {
                  message: "Enter Valid Mobile No",
                  regex: "(^(\\+88)?(01){1}[3456789]{1}(\\d){8})$"
                } as IPattern
            },
            website: {
                maxlength:{
                  message: 'Value max length 50!',
                  length: 50
                } as ICharachterLength,
            },
        } as ValidatingObjectFormat,

    }
}

export function projectUploadValidation(): any {
  return {
      projectUploadValidation: {
          companyID: {
              required: 'Company is required.',
          },
          orgID: {
              required: 'Branch name is required.',
          }
      } as ValidatingObjectFormat,

  }
}


export class ProjectAttachmentDTO {
  id: number = 0;
  fileName: string = null;
  uploadDatetime: Date = GlobalConstants.serverDate;
  folderName: string = null;
  deletedFileName: string = null;
  fileTick: string = null;
  tag: any = 0;

  constructor(defaultData?: Partial<ProjectAttachmentDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}
