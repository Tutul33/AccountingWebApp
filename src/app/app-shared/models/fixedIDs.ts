import { Config } from "./config";
export class FixedIDs {
  
  // static organizationElement = {
  //   'Head Quarter': 1,
  //   'Country': 2,
  //   'Company': 3,
  //   'Zone': 4,
  //   'CorporateOffice': 5,
  //   'Store': 6,
  //   'Unit' : 7,
  //   'Warehouse': 8,
  //   'SalesOffice': 9,
  //   'SalesCenter': 10,
  //   'Laboratory': 11,
  //   'Department': 12,
  //   'Section': 13,
  //   'CentralKitchen':14,
  //   'PreparationKitchen': 15,

  // };

   
  static objectState = {
    'detached': 0,
    'unchanged': 1,
    'deleted': 2,
    'modified': 3,
    'added': 4,
  };
  
  static approvalStatus = {
    "None": 0,
    "Approved": 1,
    "Rejected": 2,
    "Pending": 3,
    "Denied": 4,
    "Under Review": 5,
    "Recommended": 6,
    "Canceled": 7,
    "NotApproved": 8,
    "Verified": 9,
    "Submitted": 10,
    "Acknowledge": 11,
    "Closed": 12,
    "Passed": 13,
    "NotPassed": 14,
    "Prepared": 15,
    "Ok": 16,
    "NotOk": 17,
    'Draft': 18,
    'StandBy': 19,
    'Received': 20,
    'Done': 44,
    'PartialPassed': 45,
    'Delivered': 67,
    'PartialReceived': 68,
    'NotReceived': 69,
    'Withdraw': 76,
    'Collected': 77,
    'Open':79,
    'PartiallyOpen':80,
  };


  
  static reportRenderingType = {
    'Excel': 'Excel',
    'PDF': 'PDF',
    'DOC': 'DOC',
    'Image':'Image'
  };

  static reportOrientationType = {
    'Landscape': 1,
    'Portrait': 2,
  };

  
  static frequencyOccur = {
    'Daily': 1,
    'Weekly': 2,
    'Monthly': 3,
  };
  static itemStructureElement = {
    Head: 1,
    Group: 2,
    Item: 3,
    ItemType: 4,
    ItemCategory: 5,
    ItemSubCategory: 6
  };

  static priorityCd = {
    Urgent: 59
  };

  static attributeInputTypes = {
    Select: 1,
    MultiSelect: 2,
    Entry: 3,
    Datepicker: 4,
    PopUp: 5
  };

  static dataTypes = [
    { id: 1, name: "Text" },
    { id: 2, name: "Integer" },
    { id: 3, name: "Numeric" },
    { id: 4, name: "Date" },
    { id: 5, name: "Time" },
    { id: 6, name: "Date & Time" }
  ];

  
  static pageType = {
    'DashBoardPage': 3,
    'ReportPage': 4,
    'ViewPage': 5
  };

  static yesNo = {
    'Yes': 'Yes',
    'No': 'No'
  };


  static aggregateFunction = {
    'Sum': 1,
    'Count': 2
  };

  static getList(data) {
    let list = [];
    for (let name in data) {
      list.push({ value: data[name], text: name });
    }
    return list;
  }
  static professionalTitles = {
    'Mr.': 'Mr',
    'Mrs.': 'Mrs',
    'Ms.': 'MS',
    'Md.': 'MD',
  };

  static srcCd = {
    'AgainstPR': 1,
    'AgainstPO': 2,
    'DirectRcv': 3,
    'AgainstRequisiton': 4,
    'TransferReceive':5,
    'ReturnReceive':6
  };

  static genders = {
    'Male': 'MAL',
    'Female': 'FEM',
    'Transgender': 'TRAN'
  };

  static pageConfigType = {
    
  }

  static notificationType = {
    Email: 1,
    SMS: 2,
  };

  static oTPType = {
    Mobile: 1,
    Email: 2,
  };

  static branchType = {
    Main: 1,
    Local: 2
  }

  static action = {
    add: 1,
    edit: 2,
    remove: 3
  };


  static passwordExpiryPeriod = {
    'Never': { code: "0", description: 'Never' },
    'Every3month': { code: "3", description: 'Every 3 month' },
    'Every6month': { code: "6", description: 'Every 6 month' },
    'Every12month': { code: "12", description: 'Every 12 month' },

  };
 
  static periodicUnit = {
    Day: { code: 1, factorInDays: 1},
    Month: { code: 2, factorInDays: 30},
    Year: { code: 3, factorInDays: 365},
    Minute: { code: 4, factorInDays: 1440},
    Hour: { code: 5, factorInDays: 24},
  }

  static dateStatus = {
    'Current': 'Current',
    'Upcoming': 'Upcoming',
    'Previous': 'Previous'
  }

  static fixedIDs = {
    genders: FixedIDs.genders,
    objectState: FixedIDs.objectState,
    getList: FixedIDs.getList,
    format: Config.appConstants.formate,
    approvalStatus: FixedIDs.approvalStatus,
    permitAction: Config.appConstants.permitActions,
    reportRenderingType: FixedIDs.reportRenderingType,
    reportOrientationType: FixedIDs.reportOrientationType,
    frequencyOccur: FixedIDs.frequencyOccur,
    noDepartmentID: 1,
    itemStructureElement: FixedIDs.itemStructureElement,
    attributeInputTypes: FixedIDs.attributeInputTypes,
    // organizationElement: FixedIDs.organizationElement,
    dataTypes: FixedIDs.dataTypes,
    pageType: FixedIDs.pageType,
    yesNo: FixedIDs.yesNo,
    aggregateFunction: FixedIDs.aggregateFunction,
    professionalTitles: FixedIDs.professionalTitles,
    srcCd: FixedIDs.srcCd,
    pageConfigType: FixedIDs.pageConfigType,
    branchType: FixedIDs.branchType,
    periodicUnit: FixedIDs.periodicUnit,
    priorityCd: FixedIDs.priorityCd,
    oTPType: FixedIDs.oTPType,
    passwordExpiryPeriod: FixedIDs.passwordExpiryPeriod,
    dateStatus: FixedIDs.dateStatus,
  };

  static itemLocationType = {
    "PreparedIn": 1,
    "UsedIn": 2
  };

  static managementDecisionCd = {
    'Damage': 1,
    
  };

  static DateDurationList = {
    Today:{ code: 0, value: "Today" },
    WithinTomorrow:{ code: 1, value: "Within Tomorrow" },
    WithinNext3Days:{ code: 2, value: "Within Next 3 Days" },
    WithinNext7Days:{ code: 6, value: "Within Next 7 Days" },
    WithinThisMonth:{ code: 7, value: "Within This Month" },
    CustomDate:{ code: 8, value: "Custom Date" }
  }

  static durationList = {

    'Today':{ code: 0, value: "Today" },
    'WithinTomorrow':{ code: 1, value: "Within Tomorrow" },
    'WithinNext3Days':{ code: 2, value: "Within Next 3 Days" },
    'WithinNext7Days':{ code: 6, value: "Within Next 7 Days" },
    'WithinThisMonth':{ code: 7, value: "Within This Month" },
    'CustomDate':{ code: 8, value: "Custom Date" }

  };

  static pageReasonRemarks = {
    IssuePageRemarks: 1,
    DamagePageRemarks: 2,
    DamagePageReasons: 3,
    PurchaseRequisitionPageRemarks: 4,
    PurchaseOrderPageRemarks: 5,
    RequisitionPageRemarks: 6,
    OrderVoidPageReasons: 7,
    ReceivePageRemarks: 8,
    ReconcilePageRemarks: 9,
    ReconcilePageReasons: 10,
    OrderDamagePageReasons: 11,
    OrderGiftPageReasons: 12,
    ItemConversionPageRemarks: 13,
    InstantDiscountRemarks: 14,
    MembershipBenefitsTermsConditionRemarks: 15,
    OfferRemarks:16,
    TransferPageReasons:17,
    ReturnRemarks: 18
  };
  static denominationList = [
    {noteCd: 1000},
    {noteCd: 500},
    {noteCd: 200},
    {noteCd: 100},
    {noteCd: 50},
    {noteCd: 20},
    {noteCd: 10},
    {noteCd: 5},
    {noteCd: 2},
    {noteCd: 1}    
  ];

  static moneyTransaction = {
    'PaymentReturn': { code: 201, description: 'Payment Return' },
    'BankDeposit': { code: 301, description: 'Bank Deposit' },
    'CashGiven': { code: 401, description: 'Advance Given' },
    'CashTaken': { code: 402, description: 'Advance Return' },
  };

  static socialPlatformType = {
    Facebook: 1,
    X: 2,
    Instagram: 3
  };

  static MemberType = {
    'Corporate': 'CRPT',
    'Personal': 'PRSN',
    'General': 'GNRL',
    'Staff': 'STFF',
  };

  static UserType = {
    'Guest': { code: 1, description: 'Guest' },
    'General': { code: 2, description: 'General' },
    'Management': { code: 3, description: 'Management' }
  };

 

static industryTypeCd = {
  SingleCompany: 1,
  GroupOfCompanies: 2
};

static orgBehavior = {
  Corporate: 1,
  GroupOf: 2,
  Company: 3,
  Organization: 4,
  HeadOffice: 5,
  AdministrativeOffice: 6,
  Branch: 7,
  Warehouse: 8,
  Unit: 9,
  Department: 10,
  SalesOffice: 11,
  SalesCenter: 12,
  Laboratory: 13,
  CentralKitchen: 14,
  Section: 15,
  Subsection: 16
};

static orgType = {
  Group: 1,
  Company: 2,
  Office: 3,
  Branch: 4,
  Unit: 5,
  Store: 6,
  Department: 7,
  Warehouse: 8,
  CentralKitchen:14,
};

static orgAddressType = {
  General: 1,
  Billing: 2,
  Shipping: 3,
  HeadOffice: 4,
}

static accountHead = {
  AccountNature: 1,
  GroupLedger: 2,
  SubGroupLedger: 3,
  ControlLedger: 4,
  Ledger: 5
}

static assetType = {
  IsStock: 1,
  IsFixedAssets: 2
}

static transationNature = {
  IsCashNature: 1,
  IsBankNature: 2
}


static stockValuationMethod = {
  AvgBuyPrice: 1,
  LastBuyPriceOnDate: 2
}

static accountingDestination = {
  BalanceSheet: 1,
  IncomeStatement: 2,
  ManufacturingStatement:3,
  ProfitLossAppropriation : 4
}


static accountingBalanceType = {
  DebitBalance: 1,
  CreditBalance: 2
}

static accountingNature = {
  Assets: 1,
  Liabilities: 2,
  Equity: 3,
  Expenses: 4,
  Income: 5
}

static voucherType = {
  DebitVoucher: { code : 1, value: 'Debit Voucher', shortName:'DV'},
  CreditVoucher: { code : 2, value: 'Credit Voucher', shortName:'CV'},
  ContraVoucher: { code : 3, value: 'Contra Voucher', shortName:'CTV'},
  JournalVoucher: { code : 4, value: 'Journal Voucher', shortName:'JV'}
}

static receiptCd = {
  cash: { code : 1, value: 'Cash', shortName:'Cash'},
  bank: { code : 2, value: 'Bank', shortName:'Bank'}
}

static FinancialYearStatus = {
  Closed: 12,
  Open: 79,
  PartiallyOpen: 80
}

static coaType = {
  'ProjectWise': 1,
  
};

static transactionNatureCd = {
  cashNature: { code : 1, value: 'Is Cash Nature', shortName:'CashNature'},
  bankNature: { code : 2, value: 'Is Bank Nature', shortName:'BankNature'}
}
static assetTypeDrop = {
  IsStock:  { code : 1, value: 'Is Stock'}, 
  IsFixedAssets: { code : 2, value: 'Is Fixed Assets'}
}

static transationNatureDrop = {
  IsCashNature:  { code : 1, value: 'Is Cash Nature'}, 
  IsBankNature: { code : 2, value: 'Is Bank Nature'}
  
}

static AccountDestination = {
  BalanceSheet: 1,
  IncomeStatement: 2,
  ManufacturingStatement: 3,
  ProfitLossAppropriation: 4 
}

static AccountHeadLevel = {
  AccountNature: 1,
  GroupLedger: 2,
  SubGroupledger: 3,
  Controlledger: 4,
  Ledger: 5
}


static TransactionMode = {
  Cheque: 1,
  OnlinePaymentNSP: 2,
  OnlinePaymentBFTN: 3,
  OnlinePaymentTT: 4,
}

static ApprovalStatus = {
  Approved: 1,
  Rejected: 2,
  Pending: 3
}


static voucherTitleCd = {
  debitVoucherCash: { code : 1, voucherType: 'Debit Voucher', typeCode:'DV',title:'Cash Payment Voucher',nature:'Is Cash Nature'},
  debitVoucherBank: { code : 2, voucherType: 'Debit Voucher', typeCode:'DV',title:'Bank Payment Voucher',nature:'Is Bank Nature'},
  creditVoucherCash: { code : 3, voucherType: 'Credit Voucher', typeCode:'CV',title:'Cash Receipt Voucher',nature:'Is Cash Nature'},
  creditVoucherBank: { code : 4, voucherType: 'Credit Voucher', typeCode:'CV',title:'Bank Receipt Voucher',nature:'Is Bank Nature'},
  contraVoucher: { code : 5, voucherType: 'Contra Voucher', typeCode:'CTV',title:'Contra Voucher',nature:''},
  journalVoucher: { code : 6, voucherType: 'Journal Voucher', typeCode:'JV',title:'Journal Voucher',nature:''},  
}

static chequeTypeDrop = {
  AccountCheque:  { code : 1, value: 'Account Cheque'}, 
  CardCheque: { code : 2, value: 'Card Cheque'}
  
}

static chequeLeafStatus = {
  "Issued": 1,
  "Executed": 2,
  "Bounced": 3,
  "Cancelled": 4,
  "OnHold": 5,
  "PostDated": 6,
  "Cleared": 7,
  "Deposited": 8,
  "Damaged": 9,
  "Lost": 10,
  "Received": 11,
  "UnUsed":12
};

}
