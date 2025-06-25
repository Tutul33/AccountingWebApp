import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, IPattern } from "src/app/shared/models/common.model";

export class LockVoucherDTO {
    id: number = 0;
    companyID: number = null;
    orgID: number = null;
    projectID: number = null;
    lockEntryTillDateID: number = 0;
    lockEditTillDateID: number = 0;
    insertUserID: number = GlobalConstants.userInfo.userPKID;
    isActive: boolean = true;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    
    tag: any = 0;
    companyName: string = "";
    orgName: string = "";
    projectName: string = "";
    fromDate: string = "";
    toDate: string = "";
    lockEntryTillDate: Date = GlobalConstants.serverDate;
    lockEditTillDate: Date = GlobalConstants.serverDate;
    

    constructor(defaultData?: Partial<LockVoucherDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function lockVoucherValidation(): any {
    return {
      lockVoucherValidation: {
          companyID: {
                required: 'Company is required.',
            },
            lockEntryTillDate: {
                required: 'Lock Entry Till Date is required.'
            },
            lockEditTillDate: {
                required: 'Lock Edit Till Date is required.'
            },
        } as ValidatingObjectFormat,

    }
}
