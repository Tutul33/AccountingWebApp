import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class CashFlowActivityDTO {
  id: number = 0;
  name: string = null;
  groupName: string = null;
  cashFlowGrpCode: number = 0;
  cashFlowActivityWiseLedgerList: CashFlowActivityWiseLedgerDTO[] = []
  //extra properties
  locationID: number = GlobalConstants.userInfo.locationID;
  createdByID: number = GlobalConstants.userInfo.userPKID;

  constructor(defaultData?: Partial<CashFlowActivityDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

export function cashFlowValidation(): any {
  return {
    cashFlowValidationModel: {
      name: {
        required: 'Name is required.',
        // maxlength:{
        //   message: 'Value max length 75!',
        //   length: 75
        // } as ICharachterLength,
      }
    } as ValidatingObjectFormat,

  }
}

export class CashFlowActivityWiseLedgerDTO {
  id: number = 0;
  cOAStructID: number = null;
  activityID: number = 0;
  ledger: string = null;
  isSelected: boolean;
  isDisabled: boolean;
  tag: any = 0;

  constructor(defaultData?: Partial<CashFlowActivityWiseLedgerDTO>) {
    defaultData = defaultData || {};
    Object.keys(defaultData).forEach((key) => {
      const value = defaultData[key];
      if (this.hasOwnProperty(key)) {
        this[key] = value;
      }
    });
  }
}

