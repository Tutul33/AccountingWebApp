import { ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { GlobalConstants, FixedIDs } from "../index";
import { MaxValidator } from "@angular/forms";

interface IServerDataFunc { (event: any, isRefresh?: boolean): any; }
interface IFilterFromServerFunc { (event: any, filters?: any): any; }
interface IRefreshEventFunc { (isRefresh?: boolean): any; }
interface exportDataEvent { (): any; }

export interface IPattern {
  message: string;
  regex: string;
}

export interface IRange {
  message: string;
  startValue: number;
  endValue: number;
}

export interface ICharachterLength {
  message: string;
  length: number;
}

// For Modal
export class ModalConfig {
  header = "Modal";
  footer: string;
  height: string = null;
  width = "";
  contentStyle: any = { "max-height": "", };
  style: any = {};
  baseZIndex = 10000;
  dismissableMask = false;
  closeOnEscape = false;
  closable = true;
  data: any;
  transitionOptions?: string;
  position?: string;
  styleClass: string;
}

export class ColumnType {
  field?: string = "";
  header?: string = "";
  isVisible?: boolean = true;
  style?: string = null;
  styleClass?:string = null;
  isDate?: boolean = false;
  isBoolean?: boolean = false;
  isRequired?: boolean = false;
  fieldTitleKey?:string = "";
  pFrozenColumnFromLeft?: boolean = false;
  pFrozenColumnFromRight?: boolean = false;
  dataList?: any[] = [];
  labelField?: any = null;

  isSearchFilter?: boolean = false;
  isDateFilter?: boolean = false;
  isDDFilter?: boolean = false;
  isMultiselectFilter?: boolean = false;
  isStatusFilter?: boolean = false;
  isNumberFilter?: boolean = false;
  constructor(defaultData?: Partial<ColumnType>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export class FileOption {
  exportInPDF: boolean = false;
  exportInXL: boolean = false;
  exportInSelectedXL: boolean = false;
  isUnicodeSupported: boolean = false;
  orientation: number = FixedIDs.reportOrientationType.Landscape;
  exportDataEvent: exportDataEvent = null;
  title: string = "Listing Page";
}

export class GridOption {
  value = [];
  dataSource: string = null;
  filters: any = null;
  paginator: boolean = true;
  styleClass: string = "p-datatable-sm p-datatable-gridlines p-datatable-striped";
  rows: number = 10;
  first: number = 0;
  totalRecords: number = this.value.length;
  pageLinks: number = 3;
  rowsPerPageOptions = [10, 25, 50];
  exportOption: FileOption = new FileOption();
  globalFilterFields: string[] = [];
  isGlobalSearch: boolean = false;
  columns: ColumnType[] = [];
  colspanForEmpty: number = 3;
  isDynamicHeader: boolean = true;
  groupBy: string = null;
  isByDefaultSorted: boolean = true;
  currentPageNo: number = 0;

  sortWithoutGroup: string = null;
  sortMetaDataWithoutGroup: any[] = [];
  sortMode: string = "multiple";
  multipleSortingMetaData = [];
  self: any = null;
  lazy: boolean = false;
  dataKey: string = null;
  languageCode: string = null;
  titleFieldKeyCode:string = null;

  getServerData: IServerDataFunc = null;
  filterFromServer: IFilterFromServerFunc = null;
  refreshEvent: IRefreshEventFunc = null;
  serverPageNumber: any = getPageNo.bind(this);
  resetPageNumber: any = getResetPageNo.bind(this);

  title: string = "Listing Page";
  isReset: boolean = false;
  isClear: boolean = false;
  hasFrozenColumn:boolean=false;
  constructor(selfComponent: any, defaultData?: Partial<GridOption>) {
    this.self = selfComponent || null;
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

function getPageNo(event: any) {
  return Math.floor(event.first / event.rows) + 1;
}

function getResetPageNo(first: number) {
  let val = first / this.rows;
  val = Number.isInteger(val) ? val : Math.floor(val);
  return val + 1;
}

// File Upload
export class FileUploadOption {
  public folderName: string = null;
  public uploadServiceUrl: string = null;
  public downloadServiceUrl: string = null;
  public fileName: string = null;
  // public propertyName: string = null;
  public isMultipleSelection = false;
  public isMultipleUpload = false;
  public fileTick: string = null;
  public acceptedFiles: string = null;
  public uploadCompleted = false;
}
export class FileInfo {
  public UserID: string = null;
  public id: string = null;
  public FileName: string = null;
  public FolderName: string = null;
  public FileTick: string = null;
  public PhysicalPath: string = null;
}
export class ImageFile {
  public id = 0;
  public folderName: string = null;
  public fileName: string = null;
  public deletedFileName: string = null;
  public thubnailSrc: string = null;
  public fileSrc: string = null;
  public filePath: string = null;
  public fileChecked = false;
  public isUploaded = false;
  public isThumbnailFormat = true;
  public fileObject: any = {};
  public progressId: string = null;
  public progress = 0;
  public tag = 0;
  public fileTick: string = null;
  public creationDate: string = GlobalConstants.serverDate.toLocaleDateString();
  public creationTime: string = GlobalConstants.serverDate.toLocaleTimeString();
}

export class Address {
  id: number = 0;
  isEnabled: boolean = false;
  isSelected: boolean = false;
  locationID: number = GlobalConstants.userInfo.locationID;
  tag: number = 0;
  codeGenPropertyVal: string = null;
  addressLine1: string = null;
  addressLine2: string = null;
  village: string = null;
  postOffice: string = null;
  pOBox: string = null;
  zip: string = null;
  thana: string = null;
  district: string = null;
  division: string = null;
  city: string = null;
  state: string = null;
  countryID: number = null;
  country: string = null;
  shortAddressFormat: string = null;
  shortAddress: string = null;
  insertUserID: number = GlobalConstants.userInfo.userPKID;
  lastUpdate: Date=new Date(); 
  mapObj: string = null;
  constructor(defaultData?: Partial<Address>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function addressValidation(): any {
  return {
    addressValidation: {
      addressLine1: {
        required: 'Address1 is required.',
        maxlength:{
          message: 'Value max length 255!',
          length: 255
        } as ICharachterLength,
      },
      countryID: {
          required: 'Country is required.'
      },
      shortAddress: {
          required: 'Short Address is required.',
          maxlength:{
            message: 'Value max length 200!',
            length: 200
          } as ICharachterLength,
      },
      shortAddressDescription: {
        required: 'Short Address is required.',
        maxlength:{
          message: 'Value max length 200!',
          length: 200
        } as ICharachterLength,
      },
      addressLine2: {
        maxlength:{
          message: 'Value max length 255!',
          length: 255
        } as ICharachterLength,
      },
      village: {
        maxlength:{
          message: 'Value max length 150!',
          length: 150
        } as ICharachterLength,
      },
      postOffice: {
        maxlength:{
          message: 'Value max length 150!',
          length: 150
        } as ICharachterLength,
      },
      pOBox: {
        maxlength:{
          message: 'Value max length 150!',
          length: 150
        } as ICharachterLength,
      },
      zip: {
        maxlength:{
          message: 'Value max length 50!',
          length: 50
        } as ICharachterLength,
      },
      thana: {
        maxlength:{
          message: 'Value max length 50!',
          length: 50
        } as ICharachterLength,
      },
      district: {
        maxlength:{
          message: 'Value max length 50!',
          length: 50
        } as ICharachterLength,
      },
      division: {
        maxlength:{
          message: 'Value max length 50!',
          length: 50
        } as ICharachterLength,
      },
      city: {
        maxlength:{
          message: 'Value max length 50!',
          length: 50
        } as ICharachterLength,
      },
      state: {
        maxlength:{
          message: 'Value max length 200!',
          length: 200
        } as ICharachterLength,
      },
    } as ValidatingObjectFormat,
  };
}



export class Email {
  id: number = 0;
  email: string = null;
  subject: string = null;
  body: string = null;

  attachmentName: string = null;
  to: any = [];
  files: any = [];
  moduleName: string = null;
  
  // Extra Properties
  locationID: number = GlobalConstants.userInfo.locationID;
  tag: number = 0;
  insertUserID: number = GlobalConstants.userInfo.userPKID;
  lastUpdate: Date = new Date(); 

  constructor(defaultData?: Partial<Email>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function emailValidation(): any {
  return {
    emailValidation: {
      email: {
        required: 'Email is required.',
        pattern: {
          message: "Enter Valid Email",
          regex: "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}"
        } as IPattern
      },
      subject: {
          required: 'Subject is required.',
          maxlength:{
            message: 'Value max length 150!',
            length: 150
          } as ICharachterLength,
      },
    } as ValidatingObjectFormat,
  };
}



export function QueryData(defaultData?: any) {
  defaultData = defaultData || {};

  this.userID = defaultData.userID || null;
  this.pageDataCount = defaultData.pageDataCount || 10; // for instant bug fix of grid page size
  this.queryEvent = defaultData.queryEvent || "";
  this.pageNo =
    defaultData.pageNo === 0 ? 0 : defaultData.pageNo ? defaultData.pageNo : 1;
  // if page no equal to 0 then system returns all data
  this.spParams = defaultData.spParams || [];
  this.spName = defaultData.spName || null;
  this.ddlProperties = defaultData.ddlProperties || [];
  this.searchParams = defaultData.searchParams || [];
  this.isRefresh = defaultData.isRefresh || true;
  this.criteriaList = defaultData.criteriaList || [];
  this.totalSectionInfo = defaultData.totalSectionInfo || [];
  this.cacheTimeOut = defaultData.cacheTimeOut || null;
  this.onDemandCash = defaultData.onDemandCash || false; // It is used for dynamic report
}

export function ExportOption(defaultData?: any) {
  defaultData = defaultData || {};
  this.title = defaultData.title || "Title is Dynamically Generating";
  this.orientationType = defaultData.orientationType || 1;
  this.dataSource = defaultData.dataSource || [];
  this.shortft = defaultData.shortft || null;
  this.longfht = defaultData.longfht || null;
  this.isDynamicReport = defaultData.isDynamicReport || false;
  this.tableNativeElement = defaultData.tableNativeElement || null;
  this.gridColWidth = defaultData.gridColWidth || {};
  this.columns = defaultData.columns || [];
  this.reportInfo = defaultData.reportInfo || null;
}

export interface ExportOptionInterface {
  title: string;
  orientationType: number;
  dataSource: any;
  shortft: any;
  longfht: any;
  isDynamicReport: boolean;
  tableNativeElement: any;
  gridColWidth: any;
  columns: any[];
  reportInfo: any;
}

export function ImageFile1(defaultData) {
  defaultData = defaultData || {};
  this.deletedFileName = defaultData.deletedFileName || null;
  this.folderName = defaultData.folderName || null;
  this.fileName = defaultData.fileName || null;
  this.fileSrc = defaultData.fileSrc || null;
  this.isUploaded = defaultData.isUploaded || false;
  this.tag = defaultData.tag || FixedIDs.objectState.detached;
  this.id = defaultData.id || 0;
  this.fileTick = defaultData.fileTick || "";
  this.creationDate = defaultData.creationDate || new Date();
  this.creationTime = defaultData.creationTime || new Date();
  this.isThumbnailFormat = defaultData.isThumbnailFormat || true;
}

export function FileOptions() {
  this.folderName = null;
  this.uploadServiceUrl = null;
  this.downloadServiceUrl = null;
  this.fileName = null;
  this.propertyName = null;
  this.isMultiple = null;
  this.fileTick = null;
  this.acceptedFiles = null;
}

export class PageInfo {
  private id: number;
  private action: string;
  private currentAction: string;
  constructor(id: number = 0, action: string = "", currentAction: string = "") {
    this.id = id;
    this.action = action;
    this.currentAction = currentAction;
  }
}

export class UserInfo {
  private userPkId: number;
  private locationId: string;
  constructor(id: number = 0, locationId: string = "") {
    this.userPkId = id;
    this.locationId = locationId;
  }
}

export class ValidationMsg {
  [key: string]: any;
}

export class BarCodeConfig {
  private _format = "CODE128";
  private _width = 2;
  private _height = 100;
  private _isdisplayValue = true;
  private _font = "monospace";
  private _textAlign = "center";
  private _textPosition = "bottom";
  private _textMargin = 2;
  private _fontSize = 20;
  private _background = "#ffffff";
  private _lineColor = "#000000";
  private _margin = 10;
  private _marginTop = 10;
  private _marginBottom = 10;
  private _marginLeft = 10;
  private _marginRight = 10;

  constructor() { }

  // format
  get format(): string {
    return this._format;
  }
  set format(value: string) {
    this._format = value;
  }

  // width
  get width(): number {
    return this._width;
  }
  set width(value: number) {
    this._width = value;
  }

  // height
  get height(): number {
    return this._height;
  }
  set height(value: number) {
    this._height = value;
  }

  // isdisplayValue
  get isdisplayValue(): boolean {
    return this._isdisplayValue;
  }
  set isdisplayValue(value: boolean) {
    this._isdisplayValue = value;
  }

  // font
  get font(): string {
    return this._font;
  }
  set font(value: string) {
    this._font = value;
  }

  // textAlign
  get textAlign(): string {
    return this._textAlign;
  }
  set textAlign(value: string) {
    this._textAlign = value;
  }

  // textPosition
  get textPosition(): string {
    return this._textPosition;
  }
  set textPosition(value: string) {
    this._textPosition = value;
  }

  // textMargin
  get textMargin(): number {
    return this._textMargin;
  }
  set textMargin(value: number) {
    this._textMargin = value;
  }

  // fontSize
  get fontSize(): number {
    return this._fontSize;
  }
  set fontSize(value: number) {
    this._fontSize = value;
  }

  // margin
  get margin(): number {
    return this._margin;
  }
  set margin(value: number) {
    this._margin = value;
  }
}

export class AddressPicker {
  latitude: number = null;
  longitude: number = null;
  address: string = null;
  mapAddress: string = null;
  constructor(defaultData?: Partial<AddressPicker>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function addressPickerValidation(): any {
  return {
    addressPickerValidateModel: {
      address: {
        required: GlobalConstants.validationMsg.deliveryaddress,
        maxlength: {
          message: "Value max length 200",
          length: 200,
        } as ICharachterLength
      },
      mapAddress: {
        required: GlobalConstants.validationMsg.mapaddress,
        maxlength: {
          message: "Value max length 200",
          length: 200,
        } as ICharachterLength
      }
    } as ValidatingObjectFormat,
  };
}