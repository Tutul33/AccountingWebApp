import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, IPattern, IRange } from "src/app/shared/models/common.model";

export class ChequeBookDTO {
  id: number = 0;
  companyID: number = null;
  orgID: number = null;
  projectID?: number = null;
  cOAStructureID: number = null;
  accountName: string = null;
  chequeTypeCd: number = null;
  chequeBookNo: number = null;
  noOfLeaf: number = null;
  leafStartNo: number = null;
  leafEndNo: number = null;
  isActive: boolean = true;
  createdByID: number = GlobalConstants.userInfo.userPKID;
  insertDateTime: Date = new Date();
  editUserID: number = null;
  lastUpdate: Date = new Date();


  //extra properties
  locationID: number = GlobalConstants.userInfo.locationID;
  tag: any = 0;
  bankAccount: any = null;

  constructor(defaultData?: Partial<ChequeBookDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function chequeBookValidation(): any {
  return {
    chequeBookModelValidation: {
      companyID: {
        required: GlobalConstants.validationMsg.companyID,
      },
      orgID: {
        required: GlobalConstants.validationMsg.orgID,
      },
      cOAStructureID: {
        required: GlobalConstants.validationMsg.cOAStructureID,
      },
      accountName: {
        required: GlobalConstants.validationMsg.accountName,
        maxlength: {
          message: 'Value max length 50!',
          length: 50
        } as ICharachterLength,
      },
      chequeTypeCd: {
        required: GlobalConstants.validationMsg.chequeTypeCd,
      },
      chequeBookNo: {
        required: GlobalConstants.validationMsg.chequeBookNo,
        maxlength: {
          message: 'Value max length 50!',
          length: 50
        } as ICharachterLength,
      },
      noOfLeaf: {
        required: GlobalConstants.validationMsg.noOfLeaf,
        range: {
          message: 'Value can not be more than 999',
          startValue: 0,
          endValue: 999
        } as IRange
      },
      leafStartNo: {
        required: GlobalConstants.validationMsg.leafStartNo,
        range: {
          message: 'Value can not be more than 9999999999',
          startValue: 0,
          endValue: 9999999999
        } as IRange
      },


    } as ValidatingObjectFormat,

  }
}


export class ChequeLogDTO {

  id: number;
  voucherItemID: number;
  statusCd: number = null;
  statusDate: Date = GlobalConstants.serverDate;
  note?: string = null;
  isActive: boolean = false;
  actionDateTime: Date = GlobalConstants.serverDate;;
  insertUserID: number = GlobalConstants.userInfo.userPKID;

  locationID: number = GlobalConstants.userInfo.locationID;

  constructor(defaultData?: Partial<ChequeLogDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}
