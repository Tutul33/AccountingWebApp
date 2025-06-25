import { ImageFile } from "src/app/shared/models/common.model";
import { Config, FileUploadOption, GlobalConstants, GlobalMethods, ICharachterLength, IRange, ValidatingObjectFormat } from "../..";
import { VoucherItemModel } from "./voucher-item.model";


export class VoucherModel {
    id: number = 0;
    dateID: number = null;
    voucherTypeCd: number = null;
    companyID: number = null;
    orgID: number = null;
    projectID: number = null;
    voucherNo: string = null;
    remarks: string = null;
    createdByID:number=null;
    approvedByID:number=null;
    approvalStatus:number=null;
    approvalDateTime:Date=new Date(); 
    editUserID: number = null;
    lastUpdate: Date = new Date();
    isMultiEntry: boolean = false;
    voucherTitleCd:number=null;
    codeGenPropertyVal:string='';
    isDraft:boolean=false;
    isActive:boolean=true;    
    voucherItemList:VoucherItemModel[]=[];
    //Extra Property
    company: string = '';
    voucherDate:Date=null;
    OfficeBranch:string='';
    description:string=null;
    budget:number=0;
    invoiceBillRefNo:string='';
    transactionModeID:number=null;
    transectionID: number = null;
    chequeDate:Date=null;
    clearedOnDate:Date=null;
    //For Single
    fromCOAStructID:number=null;
    fromSubLedgerDetailID:number=null;
    fromCoaStructBalance:number=0;
    fromSubLedgerBalance:number=0;

    debitVal:number=null;
    creditVal:number=null;
    toCOAStructID:number=null;
    toSubLedgerDetailID:number=null;
    toAccountBalance:number=0;
    toSubledgerBalance:number=0;
    transactionID:number=0;
    transModeCd:number=0;
    imageFileList:VoucherAttachment[] = [];
    imageFileUploadOpton:FileUploadOption = imageFileUploadOption();
    voucherAttachmentList: VoucherAttachment[] = [];
    transactionNoList:any=[];
    fromSubLedgerTypeID:number=0;
    toSubLedgerTypeID:number=0;
    insertUserID:number=null;
    locationID:number=1;
    voucherItemID:number=0;
    chequeNo:string='';
    chequeLeafID:number=null;
    tranModeCd:number=null;    
    insertDateTime:Date=new Date();
    fromSubLedgerDetailList: any[] = [];
    toSubLedgerDetailList: any[] = [];
    toCoaStructureList: any[] = [];
    fromCoaStructureList:any[]=[];
    isInvalidDebitValue:boolean=false;
    isInvalidCreditValue:boolean=false;
    constructor(defaultData?: Partial<VoucherModel>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}
export class VoucherAttachment {
  id: number = 0;
  tag: number = 0;
  voucherItemID: number = 0;
  fileName: string = null;
  voucherItemAttachmentID:number=0;
  folderName: string = null;
  deletedFileName: string = null;
  fileTick: string = null;

  constructor(defaultData?: Partial<VoucherAttachment>) {
      defaultData = defaultData || {};
      Object.keys(defaultData).forEach((key) => {
          const value = defaultData[key];
          if (this.hasOwnProperty(key)) {
              this[key] = value;
          }
      });
  }
}
export function imageFileUploadOption(defaultObj?: any){
  const fileOption = new FileUploadOption()
  defaultObj = defaultObj || {};
  fileOption.acceptedFiles = '.png,.jpg,.jpeg,.gif';
  fileOption.folderName = Config.imageFolders.voucher;
  fileOption.fileTick = defaultObj?.fileTick || GlobalMethods.timeTick() + 1;
  return fileOption;
}
export function VoucherValidation(): any {
  return {
    voucherValidationModel: {
      fromCOAStructID:{
        required: "Please select From Account"
      },
      voucherDate:{
        required: "Please select From Voucher Date"
      },
      companyName:{
        required: "Please enter company"
      },
      remarks: {
        maxlength: {
          message: 'Remarks length can not be more than 150',
          length: 150
        } as ICharachterLength
      }
    } as ValidatingObjectFormat,
    voucherValidationItemModel: {
      fromCOAStructID:{
         required: "Please select From Account"
      },
      debitVal: {
        required: "Debit value is required.",
        range: {
            message: 'Debit value can not be more than 9999999999999.99',
            startValue: 0,
            endValue: 9999999999999.99

        } as IRange
      },
      creditVal: {
        required: "Credit value is required.",
        range: {
          message: 'Credit value can not be more than 9999999999999.99',
          startValue: 0,

          endValue: 9999999999999.99

        } as IRange
      },
      toCOAStructID:{
        required: GlobalConstants.validationMsg.toCOAStructID
      },
      description: {
        maxlength: {
          message: 'Description length can not be more than 150',
          length: 150
        } as ICharachterLength
      }
    } as ValidatingObjectFormat,
  };
}


  export function SingleJournalVoucherValidation(): any {
    return {
      voucherValidationModel: {
        voucherDate:{
          required: "Voucher Date is required."
        },
        company:{
          required: "Comany is Required."
        },
        fromCOAStructID:{
          required: "From Account is required."
        },
        
        debitVal: {
          required: "Debit value is required.",
          range: {
              message: 'Debit value can not be more than 9999999999999.99',
              startValue: 0,

              endValue: 9999999999999.99

          } as IRange
        },
        creditVal: {
          required: "Credit value is required.",
          range: {
            message: 'Credit value can not be more than 9999999999999.99',
            startValue: 0,

            endValue: 9999999999999.99

          } as IRange
        },        
        toCOAStructID:{
          required: "To Account is required."
        },
        description: {
          maxlength: {
            message: 'Description length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
    };
  }
  export function SingleVoucherCashValidation(): any {
    return {
      voucherValidationModel: {
        voucherDate:{
          required: "Please select voucher date."
        },
        company:{
          required: "Please enter company."
        },
        fromCOAStructID:{
          required: "Please select From Account"
        },
        debitVal: {
          required: "Debit value is required.",
          range: {
              message: 'Debit value can not be 0 and more than 9999999999999.99',
              startValue: 0.1,

              endValue: 9999999999999.99

          } as IRange
        },
        creditVal: {
          required: "Credit value length can not be less than 0",
          range: {
            message: 'Credit value can not be more than 9999999999999.99',
            startValue: 0,

            endValue: 9999999999999.99

          } as IRange
        },        
        toCOAStructID:{
          required: "Please select To Account"
        },
        description: {
          maxlength: {
            message: 'Description length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
    };
  }
  export function multiCashVoucherValidation(): any {
    return {
      voucherValidationModel: {
        fromCOAStructID:{
          required: "Please select From Account"
        },
        voucherDate:{
          required: "Please select voucher date."
        },
        companyName:{
          required: "Please enter company"
        },
        remarks: {
          maxlength: {
            message: 'Remarks length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
      voucherValidationItemModel: {
        fromCOAStructID:{
           required: "Please select From Account"
        },
        debitVal: {
          required: "Debit value is required.",
          range: {
              message: 'Debit value can not be 0 and more than 9999999999999.99',
              startValue: 0.1,

              endValue: 9999999999999.99

          } as IRange
        },
        creditVal: {
          required: "Credit value is required.",
          range: {
            message: 'Credit value can not be 0 and more than 9999999999999.99',
            startValue: 0,

            endValue: 9999999999999.99

          } as IRange
        },
        toCOAStructID:{
          required: "Please select To Account"
        },
        description: {
          maxlength: {
            message: 'Description length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
    };
  }
  export function SingleVoucherBankValidation(): any {
    return {
      voucherValidationModel: {
        voucherDate:{
          required: "Please select voucher date."
        },
        company:{
          required: "Please enter company."
        },
        fromCOAStructID:{
          required: "Please select From Account"
        },
        debitVal: {
          required: "Debit value is required.",
          range: {
              message: 'Debit value can not be 0 and more than 9999999999999.99',
              startValue: 0.1,

              endValue: 9999999999999.99

          } as IRange
        },
        creditVal: {
          required: "Credit value is required.",
          range: {
            message: 'Credit value can not be 0 and more than 9999999999999.99',
            startValue: 0,

            endValue: 9999999999999.99

          } as IRange
        },        
        toCOAStructID:{
            required: "Please select To Account"
        }
        ,
        description: {
          maxlength: {
            message: 'Description length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
    };
  }
  export function MultiVoucherBankValidation(): any {
    return {
      voucherValidationModel: {
        voucherDate:{
          required: "Please select voucher date."
        },
        companyName:{
          required: "Please enter company name."
        },
        remarks: {
          maxlength: {
            message: 'Remarks length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
      voucherValidationItemModel: {
        toCOAStructID:{
          required: "Please select To Account"
        },
        fromCOAStructID:{
          required: "Please select From Account"
        },
        debitVal: {
          required: "Debit value is required.",
          range: {
              message: 'Debit value can not be 0 and more than 9999999999999.99',
              startValue: 0.1,

              endValue: 9999999999999.99

          } as IRange
        },
        creditVal: {
          required: "Credit value is required.",
          range: {
            message: 'Credit value can not be 0 and more than 9999999999999.99',
            startValue: 0,

            endValue: 9999999999999.99

          } as IRange
        },        
        description: {
          maxlength: {
            message: 'Description length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
    };
  }
  export function SingleCreditVoucherCashValidation(): any {
    return {
      voucherValidationModel: {
        voucherDate:{
          required: "Please select voucher date."
        },
        company:{
          required: "Please enter company."
        },
        fromCOAStructID:{
          required: "Please select From Account"
        },
        creditVal: {
          required: "Credit value is required.",
          range: {
            message: 'Credit value can not be 0 and more than 9999999999999.99',
            startValue: 0.1,

            endValue: 9999999999999.99

          } as IRange
        },        
        toCOAStructID:{
          required: "Please select To Account"
        },
        description: {
          maxlength: {
            message: 'Description length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
    };
  }
  export function ContraVoucherValidation(): any {
    return {
      voucherValidationModel: {   
        voucherDate:{
          required: "Please select From Voucher Date"
        },
        companyName:{
          required: "Please enter company"
        },
        remarks: {
          maxlength: {
            message: 'Remarks length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
      voucherValidationItemModel: {
        fromCOAStructID:{
           required: "Please select From Account"
        },
        debitVal: {
          required: "Amount is required.",
          range: {
              message: 'Amount value can not be more than 9999999999999.99',
              startValue: 0.1,

              endValue: 9999999999999.99

          } as IRange
        },
        toCOAStructID:{
          required: "Please select To Account"
        },
        description: {
          maxlength: {
            message: 'Description length can not be more than 150',
            length: 150
          } as ICharachterLength
        }
      } as ValidatingObjectFormat,
    };
  }


  // export class VoucherItemChequeAttachmentDTO {
  //   id: number = 0;
  //   payTo:any = null;
  //   createdByID:number = GlobalConstants.userInfo.userPKID;
  //   locationID:number = GlobalConstants.userInfo.locationID;
  //   //tag: number = 0;
  //   voucherItemID: number = 0;
  //   fileName: string = null;
  //   voucherItemAttachmentID:number=0;
  //   folderName: string = null;
  //   deletedFileName: string = null;
  //   fileTick: string = null;
  
  //   constructor(defaultData?: Partial<VoucherItemChequeAttachmentDTO>) {
  //       defaultData = defaultData || {};
  //       Object.keys(defaultData).forEach((key) => {
  //           const value = defaultData[key];
  //           if (this.hasOwnProperty(key)) {
  //               this[key] = value;
  //           }
  //       });
  //   }
  // }

  export class VoucherItemChequeAttachmentDTO extends ImageFile {
    payTo:any = null;
    locationID:number = GlobalConstants.userInfo.locationID;
    createdByID:number = GlobalConstants.userInfo.userPKID;
    voucherItemID: number = 0;
    //fileName: string = null;
    voucherItemAttachmentID:number=0;
    // folderName: string = null;
    // deletedFileName: string = null;
    // fileTick: string = null;
    constructor(defaultData?: Partial<VoucherItemChequeAttachmentDTO>) {
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