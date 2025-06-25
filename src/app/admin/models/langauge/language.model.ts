import {
  FileUploadOption,
  ImageFile,
} from "src/app/shared/models/common.model";
import {
  GlobalConstants,
  ValidatingObjectFormat,
} from "../..";

export class Language {
  id: number = 0;
  code: string = null;
  languageName: string = null;
  native: string = null;
  imageFileName: string = null;
  isActive: boolean = true;
  isDefault: boolean = false;
  laguageImage= new LaguageImage();
  InsertUserID=GlobalConstants.userInfo.userPKID;
  constructor(defaultData?: Partial<Language>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function languageValidation(): any {
  return {
    languageValidationModel: {
      language: {
        required: GlobalConstants.validationMsg.language,
      },
      code: {
        required: GlobalConstants.validationMsg.code,
      },
    } as ValidatingObjectFormat,
  };
}

export class LaguageImage extends ImageFile {
  id: number = 0;
  languageID: number = 0;
  mediaFileName: string = null;
  mediaTypeCd: number = 0;
  usedInCd: number = 0;
  folderName: string = null;
  fileName: string = null;
  deletedFileName: string = null;
  fileTick: string = null;
  tag: any = 0;
  creationDate: string = GlobalConstants.serverDate.toLocaleDateString();
  creationTime: string = GlobalConstants.serverDate.toLocaleTimeString();
  constructor(defaultData?: Partial<LaguageImage>) {
    super();
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}
