import {
  FileUploadOption,
  ImageFile,
} from "src/app/shared/models/common.model";
import {
  GlobalConstants,
  ValidatingObjectFormat,
} from "../..";

export class ReportLayout {
  id: number = 0;
  reportCode: string = null;
  layoutTypeCode: string = null;
  description: string = null;
  isDefault: string = null;
  
  fileID:string = null;
  fileName:string = null;
  reportName:string = null;
  layoutTypeName:string = null;
  insertUserID=GlobalConstants.userInfo.userPKID;
  locationID:number = GlobalConstants.userInfo.locationID;
  reportLayoutAttachmentsList:ImageFile[] = [];

  constructor(defaultData?: Partial<ReportLayout>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function reportLayoutValidation(): any {
  return {
    reportLayoutValidationModel: {
      reportCode: {
        required: GlobalConstants.validationMsg.reportname,
      },
      layoutTypeCode: {
        required: GlobalConstants.validationMsg.layoutname,
      },
      description: {
        required: GlobalConstants.validationMsg.description,
      },
    } as ValidatingObjectFormat,
  };
}

// export class LaguageImage extends ImageFile {
//   id: number = 0;
//   languageID: number = 0;
//   mediaFileName: string = null;
//   mediaTypeCd: number = 0;
//   usedInCd: number = 0;
//   folderName: string = null;
//   fileName: string = null;
//   deletedFileName: string = null;
//   fileTick: string = null;
//   tag: any = 0;
//   creationDate: string = GlobalConstants.serverDate.toLocaleDateString();
//   creationTime: string = GlobalConstants.serverDate.toLocaleTimeString();
//   constructor(defaultData?: Partial<LaguageImage>) {
//     super();
//     defaultData = defaultData || {};
//     Object.keys(defaultData).forEach((key) => {
//       const value = defaultData[key];
//       if (this.hasOwnProperty(key)) {
//         this[key] = value;
//       }
//     });
//   }
// }
