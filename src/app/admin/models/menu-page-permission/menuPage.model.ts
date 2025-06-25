
import {
  GlobalConstants,
} from "../..";

export class MenuPage {
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

  constructor(defaultData?: Partial<MenuPage>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}




export class MenuPermission {
  id: number = 0;
  locationID: number = GlobalConstants.userInfo.locationID;
  groupID: number = null;
  userID: number = null;
  moduleID:number = null;
  userMenuPageAccess: number = 1;
  insertUserID=GlobalConstants.userInfo.userPKID;
  editUserID=GlobalConstants.userInfo.userPKID;
  lastUpdate:Date=new Date();  
  tag:any = 0;

  userEmployee:string = '';

  constructor(defaultData?: Partial<MenuPermission>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export class PagePermission {
  id: number = 0;
  menuPermissionID: number = null;
  pageID: number = null;
  read: number = null;
  add: number = null;
  edit: number = null;
  editTime: number = null;
  delete: number = null;
  deleteTime: number = null;
  preview: number = null;
  print: number = null;
  cancel: number = null;
  standBy: number = null;
  approve: number = null;
  accessDeny: number = null;
  allocation: number = null;
  isQuickbarPage: boolean = false;
  tag:any =0;


  groupID?: number = null;
  userID?: number = null;
  userEmployee:string = '';

  constructor(defaultData?: Partial<PagePermission>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}






