"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarCodeConfig = exports.ValidationMsg = exports.UserInfo = exports.PageInfo = exports.FileOptions = exports.ImageFile1 = exports.ExportOption = exports.QueryData = exports.ImageFile = exports.FileInfo = exports.FileUploadOption = exports.ModalConfig = void 0;
var index_1 = require("../index");
// For Modal
var ModalConfig = /** @class */ (function () {
    function ModalConfig() {
        this.header = 'Modal';
        this.height = null;
        this.width = '70%';
        this.contentStyle = { 'max-height': '500px', overflow: 'auto' };
        this.baseZIndex = 10000;
        this.dismissableMask = false;
        this.closeOnEscape = false;
        this.closable = true;
    }
    return ModalConfig;
}());
exports.ModalConfig = ModalConfig;
// File Upload
var FileUploadOption = /** @class */ (function () {
    function FileUploadOption() {
        this.folderName = null;
        this.uploadServiceUrl = null;
        this.downloadServiceUrl = null;
        this.fileName = null;
        // public propertyName: string = null;
        // public isMultiple = false;
        this.fileTick = null;
        this.acceptedFiles = null;
        this.uploadCompleted = false;
    }
    return FileUploadOption;
}());
exports.FileUploadOption = FileUploadOption;
var FileInfo = /** @class */ (function () {
    function FileInfo() {
        this.UserID = null;
        this.id = null;
        this.FileName = null;
        this.FolderName = null;
        this.FileTick = null;
        this.PhysicalPath = null;
    }
    return FileInfo;
}());
exports.FileInfo = FileInfo;
var ImageFile = /** @class */ (function () {
    function ImageFile() {
        this.id = 0;
        this.folderName = null;
        this.fileName = null;
        this.deletedFileName = null;
        this.thubnailSrc = null;
        this.fileSrc = null;
        this.filePath = null;
        this.fileChecked = false;
        this.isUploaded = false;
        this.isThumbnailFormat = true;
        this.fileObject = {};
        this.progressId = null;
        this.progress = 0;
        this.tag = 0;
        this.fileTick = null;
        this.creationDate = index_1.GlobalConstants.serverDate.toLocaleDateString();
        this.creationTime = index_1.GlobalConstants.serverDate.toLocaleTimeString();
        // public creationDate: string = new Date().toLocaleDateString();
        // public creationTime: string = new Date().toLocaleTimeString();
    }
    return ImageFile;
}());
exports.ImageFile = ImageFile;
function QueryData(defaultData) {
    defaultData = defaultData || {};
    this.userID = defaultData.userID || null;
    this.pageDataCount = defaultData.pageDataCount || 10; // for instant bug fix of grid page size
    this.queryEvent = defaultData.queryEvent || '';
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
exports.QueryData = QueryData;
function ExportOption(defaultData) {
    if (defaultData === void 0) { defaultData = null; }
    defaultData = defaultData || {};
    this.title = defaultData.title || 'Title is Dynamically Generating';
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
exports.ExportOption = ExportOption;
function ImageFile1(defaultData) {
    defaultData = defaultData || {};
    this.deletedFileName = defaultData.deletedFileName || null;
    this.folderName = defaultData.folderName || null;
    this.fileName = defaultData.fileName || null;
    this.fileSrc = defaultData.fileSrc || null;
    this.isUploaded = defaultData.isUploaded || false;
    this.tag = defaultData.tag || 0;
    this.id = defaultData.id || 0;
    this.fileTick = defaultData.fileTick || '';
    this.creationDate = defaultData.creationDate || new Date();
    this.creationTime = defaultData.creationTime || new Date();
    this.isThumbnailFormat = defaultData.isThumbnailFormat || true;
}
exports.ImageFile1 = ImageFile1;
function FileOptions() {
    this.folderName = null;
    this.uploadServiceUrl = null;
    this.downloadServiceUrl = null;
    this.fileName = null;
    this.propertyName = null;
    this.isMultiple = null;
    this.fileTick = null;
    this.acceptedFiles = null;
}
exports.FileOptions = FileOptions;
var PageInfo = /** @class */ (function () {
    function PageInfo(id, action, currentAction) {
        if (id === void 0) { id = 0; }
        if (action === void 0) { action = ''; }
        if (currentAction === void 0) { currentAction = ''; }
        this.id = id;
        this.action = action;
        this.currentAction = currentAction;
    }
    return PageInfo;
}());
exports.PageInfo = PageInfo;
var UserInfo = /** @class */ (function () {
    function UserInfo(id, locationId) {
        if (id === void 0) { id = 0; }
        if (locationId === void 0) { locationId = ''; }
        this.userPkId = id;
        this.locationId = locationId;
    }
    return UserInfo;
}());
exports.UserInfo = UserInfo;
var ValidationMsg = /** @class */ (function () {
    function ValidationMsg() {
    }
    return ValidationMsg;
}());
exports.ValidationMsg = ValidationMsg;
var BarCodeConfig = /** @class */ (function () {
    function BarCodeConfig() {
        this._format = 'CODE128';
        this._width = 2;
        this._height = 100;
        this._isdisplayValue = true;
        this._font = 'monospace';
        this._textAlign = 'center';
        this._textPosition = 'bottom';
        this._textMargin = 2;
        this._fontSize = 20;
        this._background = '#ffffff';
        this._lineColor = '#000000';
        this._margin = 10;
        this._marginTop = 10;
        this._marginBottom = 10;
        this._marginLeft = 10;
        this._marginRight = 10;
    }
    Object.defineProperty(BarCodeConfig.prototype, "format", {
        // format
        get: function () {
            return this._format;
        },
        set: function (value) {
            this._format = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "width", {
        // width
        get: function () {
            return this._width;
        },
        set: function (value) {
            this._width = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "height", {
        // height
        get: function () {
            return this._height;
        },
        set: function (value) {
            this._height = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "isdisplayValue", {
        // isdisplayValue
        get: function () {
            return this._isdisplayValue;
        },
        set: function (value) {
            this._isdisplayValue = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "font", {
        // font
        get: function () {
            return this._font;
        },
        set: function (value) {
            this._font = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "textAlign", {
        // textAlign
        get: function () {
            return this._textAlign;
        },
        set: function (value) {
            this._textAlign = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "textPosition", {
        // textPosition
        get: function () {
            return this._textPosition;
        },
        set: function (value) {
            this._textPosition = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "textMargin", {
        // textMargin
        get: function () {
            return this._textMargin;
        },
        set: function (value) {
            this._textMargin = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "fontSize", {
        // fontSize
        get: function () {
            return this._fontSize;
        },
        set: function (value) {
            this._fontSize = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BarCodeConfig.prototype, "margin", {
        // margin
        get: function () {
            return this._margin;
        },
        set: function (value) {
            this._margin = value;
        },
        enumerable: false,
        configurable: true
    });
    return BarCodeConfig;
}());
exports.BarCodeConfig = BarCodeConfig;
//# sourceMappingURL=common.model.js.map