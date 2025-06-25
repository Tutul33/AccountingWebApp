'use strict';

define(['toastr'], function (toastr) {

  var app = angular.module(ERP_MODULES.APP.name);
  //Configure Toastr
  toastr.options.timeOut = 4000;
  toastr.options.positionClass = 'toast-middle-center';
  toastr.options.closeButton = true;

  var keyCodes = {
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
  var url = {
    //gsRemoteUrl: ERP_MODULES_URL.gsRemoteUrl, //SETUP SVC for Development
    gsRemoteUrl: ERP_MODULES_URL.gsRemoteUrl, //SETUP SVC for Development
    gsLocalUrl: ERP_MODULES_URL.gsLocalUrl, //SETUP SVC for Development
    adminRemoteUrl: ERP_MODULES_URL.adminRemoteUrl, //ADMIN SVC for Development
    adminFileRemoteUrl: ERP_MODULES_URL.adminFileRemoteUrl,
    gmRemoteUrl: ERP_MODULES_URL.gmRemoteUrl,
    smpRemoteUrl: ERP_MODULES_URL.smpRemoteUrl,
    faRemoteUrl: ERP_MODULES_URL.faRemoteUrl, //SETUP SVC for Development

    omRemoteUrl: ERP_MODULES_URL.omRemoteUrl,
    crRemoteUrl: ERP_MODULES_URL.crRemoteUrl,
    orgRemoteUrl: ERP_MODULES_URL.orgRemoteUrl,
    comRemoteUrl: ERP_MODULES_URL.comRemoteUrl,
    itmRemoteUrl: ERP_MODULES_URL.itmRemoteUrl,
    mktRemoteUrl: ERP_MODULES_URL.mktRemoteUrl,
    mktLocalUrl: ERP_MODULES_URL.mktLocalUrl,
    invRemoteUrl: ERP_MODULES_URL.invRemoteUrl,
    rptRemoteUrl: ERP_MODULES_URL.rptRemoteUrl,
    rptLocalUrl: ERP_MODULES_URL.rptLocalUrl

  };

  var messageCode = {
    saveCode: "501",
    editCode: "502",
    deleteCode: "503",
    confirmDelete: "602",
    confirmDirtyDelete: "610",
    duplicateCheck: "810",
    emptyList: "815",
    confirmNodeChange: "615"
  };


  //For menu permission
  var permitActions = {

    Add: 1,
    Edit: 2,
    Delete: 3,
    Preview: 4,
    Print: 5,
    Cancel: 6,
    StandBy: 7,
    Approve: 8
  };


  var format = {
    shortYearDateFormat: "dd/MM/yy",
    dateFormat: "dd/MM/yyyy",
    dateTimeFormat: "dd/MM/yy" + " hh:mm:ss a",
    monthDayFormat: "MM, dd",
    monthYearFormat: "MM, yyyy",
    timeFormat: "hh:mm a"
  };


  var modalTypes = {
    gridModal: 1,
    entryModal: 2
  };

  var separator = {
    '/': 1,
    ',': 2,
    '-': 3
  };

  var dataType = {
    Text: { id: 1, name: "Text" },
    Int: { id: 2, name: "Integer" },
    Number: { id: 3, name: "Numeric" },
    Date: { id: 4, name: "Date" },
    Time: { id: 5, name: "Time" },
    DataTime: { id: 6, name: "Date & Time" }
  };

  var fieldSource = {
    'Master Data': 1,
    'BIC': 2,
    'Master Data/BIC': 3
  };

  var codeGenValueSource = {
    'Object value': 1,
    'Custom value': 2
  };

  var codeGenSystemValueSource = {
    'Text': 1,
    'Year': 2,
    'Month': 3,
    'Day': 4,
    'Timespan': 5,
    'Current User': 6,
    'Current Company': 7
  };

  var installmentTypes = {
    equalTo: { id: 1, name: "Equal To", value: 100, devidedBy: 1 },
    half: { id: 2, name: "Half", value: 50, devidedBy: 2 },
    oneThrid: { id: 3, name: "One Third", value: 33.33, devidedBy: 3 },
    oneFourth: { id: 4, name: "One Fourth", value: 25, devidedBy: 4 },
    oneFifth: { id: 5, name: "One Fifth", value: 20, devidedBy: 5 }
  };

  var codeGenVarient = {
    'Item': '101'
  };

  var priority = {
    'Urgent': '1',
  };


  var productionStatus = {
    Start: 1,
    Finish: 2,
    OutOfOrder: 3,
    Logout: 4,
    Stop: 5
  };
  //used in order when non-stock order then 1 when stock order then 2 when sub cotactor order then 3
  var orderCtgCode =
  {
    NonStockOrderCode: 1,
    StockOrderCode: 2,
    SubContactOrderCode: 3,
    SampleOrderCode: 4
  };
  var orderPrefix =
  {
    StockOrderPrefix: 'STK',
    SubContactOrderPrefix: 'SC',
    SampleOrderPrefix: 'SMPL'
  };
  var reportEngineType =
  {
    RDLC: 'RDL',
    CrystalReport: 'CR',
  };
  var logicalOperatorList = [{ id: 1, optionName: " AND ", value: ' && ' },
  { id: 2, optionName: " OR ", value: ' || ' }];

  var conditionList = [
    { id: 1, optionName: "Euqal (==)", value: ' = ' },
    { id: 2, optionName: "Greater Than (>)", value: ' > ' },
    { id: 3, optionName: "Smaller Than (<)", value: ' < ' },
    { id: 4, optionName: "Greater Than Or Equal (>=)", value: ' >= ' },
    { id: 5, optionName: "Smaller Than Or Equal (<=)", value: ' <= ' },
    { id: 6, optionName: "Not Equal (!=)", value: ' <> ' }
  ];

  var colUnitList = [{ key: '%', value: 1 }, { key: 'px', value: 2 }];


  var pageLayout = {
    'PORTRAIT': 1,
    'LANDSCAPE': 2
  };

  var pageSize = {
    'A4': 1,
    'Letter': 2,
    'Legal': 3,
    'Custom': 9
  };

  app.constant("appConstants", {
    'url': url,
    'messageCode': messageCode,
    'keyCodes': keyCodes,
    'formate': format,
    'modalTypes': modalTypes,
    'dataType': dataType,
    'permitActions': permitActions,
    'productionStatus': productionStatus,
    'separator': separator,
    'fieldSource': fieldSource,
    'codeGenValueSource': codeGenValueSource,
    'codeGenSystemValueSource': codeGenSystemValueSource,
    'codeGenVarient': codeGenVarient,
    'priority': priority,
    'installmentTypes': installmentTypes,
    'orderCtgCode': orderCtgCode,
    'orderPrefix': orderPrefix,
    'logicalOperatorList': logicalOperatorList,
    'conditionList': conditionList,
    'reportEngineType': reportEngineType,
    'colUnitList': colUnitList,
    'pageLayout': pageLayout,
    'pageSize': pageSize
  });

  app.value("appValues", {
    'currentModuleName': "",
    'pageInfo': ""
  });
  app.constant("domainFolders", {
    'quotation': 'Quotation',
    'order': 'Order',
    'employee': 'Employee',
    'signatures': 'Signatures',
    'udcImage': 'UDCImage',
    'generalSetup': 'GeneralSetup',
    'commercial': 'Commercial',
    'packdelivery': 'PackDelivery',
    'utility': 'utility'

  });

  app.constant("imageFolders", {
    'user': "User",
    'menu': "Menu",
    'color': "Color",
    'gmtImage': "GMTImage",
    'gmtMeasurement': "GMTMeasurement",
    'gmtCareInstruct': "gmtCareInstruct",
    'gmtTechnical': "GMTTechnical",
    'pi': "PI",
    'piAttachment': "PIAttachment",
    'piEmpDetail': "piEmpDetail",

    'piAchievement': "piAchievement",
    'piEduBackgroud': "piEduBackgroud",
    'piMembership': "piMembership",
    'piOtherSkill': "piOtherSkill",
    'piPriorExperience': "piPriorExperience",
    'piTraining': "piTraining",
    'leaveApplicantSignture': "leaveApplicantSignture",
    'loanApplicantSignture': "loanApplicantSignture",
    'employeeSignture': "employeeSignture",
    'careSymbol': 'CareSymbol',
    'itemDetailCode': 'ItemDetailCode',
    'buyerItemCodeArtwork': 'buyerItemCodeArtwork',
    'jobOrder': 'JobOrder',
    'lcAttachment': "lcAttachment",
    'tt': 'TT',
    'docPreparation': 'docPreparation',
    'docSubmission': 'docSubmission',
    'chkPayRcv': 'chkPayRcv',
    'piSubmission': "PISubmission",
    'billSubmission': "billSubmission",
    'docSubmissionBank': 'docSubmissionBank',
    'custDocAccept': 'CustDocAccept',
    'bankDocAccept': 'BankDocAccept',
    'order': 'order',
    'plan': 'plan',
    'fileInfo': 'fileInfo',
    'oderPractFile': 'oderPractFile',
    'deliveryConfirm': 'deliveryConfirm',
    'reportLayoutAttachment': 'reportLayoutAttachment',
    'Letter': 'Letter',
    'CommercialAutoGen': 'CommercialAutoGen'
  });
});
