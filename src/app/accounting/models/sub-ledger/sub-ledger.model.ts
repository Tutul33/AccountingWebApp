import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, IPattern } from "src/app/shared/models/common.model";

export class SubLedgerDTO {
    id: number = 0;
    subLedgerTypeID: number = null;
    name: string = null;
    RefID: number = null;
    isActive: boolean = true;
    mobile: string = null;
    email: string = null;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    subLedgerFile: SubLedgerAttachmentDTO = new SubLedgerAttachmentDTO();
    
    tag:any = 0;
    subLedgerType: string = null;
    

    constructor(defaultData?: Partial<SubLedgerDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function subLedgerValidation(): any {
    return {
        subLedgerValidation: {
            name: {
                required: 'Sub Ledger is required.',
                maxlength:{
                  message: 'Value max length 75!',
                  length: 75
                } as ICharachterLength,
            },
            subLedgerTypeID: {
                required: 'Sub Ledger type is required.'
            },
            mobile: {
                maxlength:{
                  message: 'Value max length 50!',
                  length: 50
                } as ICharachterLength,
                pattern: {
                  message: "Enter Valid Mobile No",
                  regex: "(^(\\+88)?(01){1}[3456789]{1}(\\d){8})$"
                } as IPattern
            },
            email: {
                maxlength:{
                  message: 'Value max length 75!',
                  length: 75
                } as ICharachterLength,
                pattern: {
                  message: "Enter Valid Email",
                  regex: "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}"
                } as IPattern
            },
        } as ValidatingObjectFormat,

    }
}

export class SubLedgerAttachmentDTO {
  id: number = 0;
  fileName: string = null;
  uploadDatetime: Date = GlobalConstants.serverDate;
  folderName: string = null;
  deletedFileName: string = null;
  fileTick: string = null;
  tag: any = 0;

  constructor(defaultData?: Partial<SubLedgerAttachmentDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

