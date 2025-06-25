import { GlobalConstants as gl } from "src/app/app-shared/models/javascriptVariables";
//Contains config information
export class Config {
  static keyCodes = {
    backspace: 8,
    tab: 9,
    enter: 13,
    esc: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    insert: 45,
    del: 46,
    F2: 113
  };

  //here is the common publisable service url, like Controllers/Common in GS webapi project
  static url = {
    adminLocalUrl: gl.ERP_MODULES_URL.adminLocalUrl,
    adminFileRemoteUrl: gl.ERP_MODULES_URL.adminFileRemoteUrl,
    orgLocalUrl: gl.ERP_MODULES_URL.orgLocalUrl,
    orgReportFileUrl: gl.ERP_MODULES_URL.orgReportFileUrl,
    accountingLocalUrl: gl.ERP_MODULES_URL.accountingLocalUrl,
    accountingReportFileUrl: gl.ERP_MODULES_URL.accountingReportFileUrl,
  };

  static messageCode = {
    saveCode: "501",
    editCode: "502",
    deleteCode: "503",
    confirmDelete: "602",
    confirmDirtyDelete: "610",
    duplicateCheck: "810",
    emptyList: "815",
    confirmNodeChange: "615",
    dataLoss: '617',
    duplicateEntry: '896'
  };


  //For menu permission
  static permitActions = {
    Add: 1,
    Edit: 2,
    Delete: 3,
    Preview: 4,
    Print: 5,
    Cancel: 6,
    StandBy: 7,
    Approve: 8
  };

  static format = {
    shortYearDateFormat: "dd/MM/yy",
    dateFormat: "dd/MM/yyyy",
    shortMonthDateFormat: "dd-MMM-yy",
    shortMonthDateTimeFormat: "dd-MMM-yy" + " hh:mm a",
    dateTimeFormat: "dd/MM/yy" + " hh:mm:ss a",
    monthDayFormat: "MM, dd",
    monthYearFormat: "MM, yyyy",
    timeFormat: "hh:mm a"
  };


  static modalTypes = {
    gridModal: 1,
    entryModal: 2
  };

  static separator = {
    '/': 1,
    ',': 2,
    '-': 3
  };

  static dataType = {
    Text: { id: 1, name: "Text" },
    Int: { id: 2, name: "Integer" },
    Number: { id: 3, name: "Numeric" },
    Date: { id: 4, name: "Date" },
    Time: { id: 5, name: "Time" },
    DataTime: { id: 6, name: "Date & Time" }
  };

  static fieldSource = {
    'Master Data': 1,
    'BIC': 2,
    'Master Data/BIC': 3
  };

  static codeGenValueSource = {
    'Object value': 1,
    'Custom value': 2
  };

  static codeGenSystemValueSource = {
    'Text': 1,
    'Year': 2,
    'Month': 3,
    'Day': 4,
    'Timespan': 5,
    'Current User': 6,
    'Current Company': 7
  };

  static installmentTypes = {
    equalTo: { id: 1, name: "Equal To", value: 100, devidedBy: 1 },
    half: { id: 2, name: "Half", value: 50, devidedBy: 2 },
    oneThrid: { id: 3, name: "One Third", value: 33.33, devidedBy: 3 },
    oneFourth: { id: 4, name: "One Fourth", value: 25, devidedBy: 4 },
    oneFifth: { id: 5, name: "One Fifth", value: 20, devidedBy: 5 }
  };

  static codeGenVarient = {
    'Item': '101'
  };

  static priority = {
    'Urgent': '1',
  };


  static productionStatus = {
    Start: 1,
    Finish: 2,
    OutOfOrder: 3,
    Logout: 4,
    Stop: 5
  };
  //used in order when non-stock order then 1 when stock order then 2 when sub cotactor order then 3
  static orderCtgCode =
    {
      NonStockOrderCode: 1,
      StockOrderCode: 2,
      SubContactOrderCode: 3,
      SampleOrderCode: 4
    };
  static orderPrefix =
    {
      StockOrderPrefix: 'STK',
      SubContactOrderPrefix: 'SC',
      SampleOrderPrefix: 'SMPL'
    };
  static reportEngineType =
    {
      RDLC: 'RDL',
      CrystalReport: 'CR',
    };
  static logicalOperatorList = [{ id: 1, optionName: " AND ", value: ' && ' },
  { id: 2, optionName: " OR ", value: ' || ' }];

  static conditionList = [
    { id: 1, optionName: "Euqal (==)", value: ' = ' },
    { id: 2, optionName: "Greater Than (>)", value: ' > ' },
    { id: 3, optionName: "Smaller Than (<)", value: ' < ' },
    { id: 4, optionName: "Greater Than Or Equal (>=)", value: ' >= ' },
    { id: 5, optionName: "Smaller Than Or Equal (<=)", value: ' <= ' },
    { id: 6, optionName: "Not Equal (!=)", value: ' <> ' }
  ];

  static colUnitList = [{ key: '%', value: 1 }, { key: 'px', value: 2 }];


  static pageLayout = {
    'PORTRAIT': 1,
    'LANDSCAPE': 2
  };

  static pageSize = {
    'A4': 1,
    'Letter': 2,
    'Legal': 3,
    'Custom': 9
  };

  static appConstants = {
    'url': Config.url,
    'messageCode': Config.messageCode,
    'keyCodes': Config.keyCodes,
    'formate': Config.format,
    'modalTypes': Config.modalTypes,
    'dataType': Config.dataType,
    'permitActions': Config.permitActions,
    'productionStatus': Config.productionStatus,
    'separator': Config.separator,
    'fieldSource': Config.fieldSource,
    'codeGenValueSource': Config.codeGenValueSource,
    'codeGenSystemValueSource': Config.codeGenSystemValueSource,
    'codeGenVarient': Config.codeGenVarient,
    'priority': Config.priority,
    'installmentTypes': Config.installmentTypes,
    'orderCtgCode': Config.orderCtgCode,
    'orderPrefix': Config.orderPrefix,
    'logicalOperatorList': Config.logicalOperatorList,
    'conditionList': Config.conditionList,
    'reportEngineType': Config.reportEngineType,
    'colUnitList': Config.colUnitList,
    'pageLayout': Config.pageLayout,
    'pageSize': Config.pageSize
  };

  static appValues = {
    'currentModuleName': "",
    'pageInfo': ""
  };

  static folderName = {
    'audio': 'audios'
  };

  static domainFolders = {
    'quotation': 'Quotation',
    'order': 'Order',
    'employee': 'Employee',
    'signatures': 'Signatures',
    'udcImage': 'UDCImage',
    'generalSetup': 'GeneralSetup',
    'commercial': 'Commercial',
    'packdelivery': 'PackDelivery',
    'utility': 'utility'

  };


  static imageFolders = {
    'user': "User",
    'menu': "Menu",
    'order': 'order',    
    'fileInfo': 'fileInfo',
    'oderPractFile': 'oderPractFile',
    'item': 'item',
    'group': 'group',
    'SupplierAgreement': 'SupplierAgreement',
    'meal': 'meal',
    'inventory': 'inventory',
    'bankcardtype': 'bankcardtype',
    'paymentgatewaysvc':'paymentgatewaysvc',
    'storepaymentgateway':'storepaymentgateway',
    'bannertemplate':'bannertemplate',
    'currencyNote': 'currencyNote',
    'pageBannerAttechment':'pageBannerAttechment',
    'thirdParty':'thirdParty',
    'damageItem':'damageItem',
    'ecomPageConfig': 'ecomPageConfig',
    'salesInvoice' : 'salesInvoice',
    'language' : 'language',
    'pageMenu' : 'pageMenu',
    'reportLayout':'reportLayout',
    'offer': 'offer',
    'voucher': 'voucher',
    'openingBalance':'openingBalance',
    'project':'project',
    'subLedger':'subLedger',
     'cheque':'cheque',
     'bankReconciliation': 'bankReconciliation',
    };

  //rptConfig
  static inputType = {
    'Select': 1,
    'MultiSelect': 2,
    'Entry': 3,
    'DatePickerRange': 4,
    'DatePicker': 5,
    'Popup': 6
  };

  static getDefaultVarList = {
    'Login User': 'userInfo.userPKID',
    'Location': 'userInfo.locationID',
    'Company Name': 'companyInfo.companyName',
    'Current Date': 'new Date()',
  };


}
