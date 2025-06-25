import {
  ImageFile,
} from "src/app/shared/models/common.model";
import {
  GlobalConstants,
  ValidatingObjectFormat,
} from "../..";

export class Module {
  id: number = 0;
  locationID: number = null;
  applicationID: number = null;
  parentID: number = null;
  parentName:string = null;
  moduleName: string = null;
  pageTitle: string = null;
  menuTitle: string = null;
  menuLevel: number = null; 
  serialNo: number = null;  
  isPageOrMenu: number = null;  
  projectFileName: string = null;
  imageName: string = null;
  action: string = null;  
  insertUserID=GlobalConstants.userInfo.userPKID;
  editUserID=GlobalConstants.userInfo.userPKID;
  lastUpdate:Date=new Date();  
  isDashboard: boolean = false;
  isActive: boolean = true;

  //Extra properties
  moduleImage= new ModuleImage();
  
  constructor(defaultData?: Partial<Module>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function moduleValidation(): any {
  return {
    modelValidationModel: {
      moduleName: {
        required: GlobalConstants.validationMsg.moduleName
      },
      serialNo: {
        required: GlobalConstants.validationMsg.serialNo
      },
      menuLevel: {
        required: GlobalConstants.validationMsg.menuLevel
      }
    } as ValidatingObjectFormat,
  };
}

export function modulePageValidation(): any {
  return {
    modulePageValidationModel: {
      moduleName: {
        required: GlobalConstants.validationMsg.moduleName
      },
      pageTitle: {
        required: GlobalConstants.validationMsg.pageTitle
      },
      serialNo: {
        required: GlobalConstants.validationMsg.serialNo
      },
      action: {
        required: GlobalConstants.validationMsg.action
      },
      projectFileName: {
        required: GlobalConstants.validationMsg.projectFileName
      }
    } as ValidatingObjectFormat,
  };
}

export class ModuleImage extends ImageFile {
  id: number = 0;
  moduleID: number = 0;
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
  constructor(defaultData?: Partial<ModuleImage>) {
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



