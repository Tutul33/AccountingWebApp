import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { IRange, ICharachterLength } from 'src/app/shared/models/common.model';

export class AccountDestinationDTO {
    id: number = 0;
    destinationCode: number = 0;
    isActive: boolean = true;
    isDefault: boolean = false;

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;

    constructor(defaultData?: Partial<AccountDestinationDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}


export class SubLedgerTypeDTO {
    id: number = 0;
    name: string = null;
    code: number = null;
    isActive: boolean = true;
    isDefault: boolean = false;
    sourceCd: number = null;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;
    source: string = null;
    

    constructor(defaultData?: Partial<SubLedgerTypeDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function subLedgerTypeValidation(): any {
    return {
        subLedgerTypeValidation: {
            name: {
                required: 'Name is required.',
                maxlength:{
                    message: 'Value max length 20!',
                    length: 20
                } as ICharachterLength,
            },
            code: {
                //required: 'Code is required.',
                range: {
                    message: 'Code range between 1 to 255.',
                    startValue: 0,
                    endValue: 255
                } as IRange
            },
            sourceCd: {
                required: 'Source is required.'
            }
        } as ValidatingObjectFormat,

    }
}

export class TransactionModeDTO {
    id: number = 0;
    value: string = null;
    code: number = null;
    isActive: boolean = true;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;
    

    constructor(defaultData?: Partial<TransactionModeDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function transactionModeValidation(): any {
    return {
        transactionModeValidation: {
            value: {
                required: 'Name is required.',
                maxlength:{
                    message: 'Value max length 75!',
                    length: 75
                } as ICharachterLength,
            },
            code: {
                required: 'Code is required.',
                range: {
                    message: 'Code range between 1 to 255.',
                    startValue: 1,
                    endValue: 255
                } as IRange
            },
        } as ValidatingObjectFormat,

    }
}


export class VoucherNotificationDTO {
    id: number = 0;
    voucherCode: number = null;
    sendSMSAuto: boolean = false;
    sendSMSManual: boolean = false;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;
    sMSTypeDR: number = null;
    sMSTypeCR: number = null;
    

    constructor(defaultData?: Partial<VoucherNotificationDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export class ProjectBranchDTO {
    id: number = 0;
    keyCode: string = null;
    keyCodeBranch: string = null;
    keyCodeProject: string = null;
    isActive: boolean = null;

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;
    isBranchModuleActive: boolean = false;
    isProjectModuleActive: boolean = false;

    constructor(defaultData?: Partial<ProjectBranchDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export class VoucherCategoryDTO {
    id: number = 0;
    title: string = null;
    voucherCode: number = null;
    transactionNatureCode: number = null;
    isActive: boolean = true;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;
    voucherType: string = null;
    

    constructor(defaultData?: Partial<VoucherCategoryDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function voucherCategoryValidation(): any {
    return {
        voucherCategoryValidation: {
            title: {
                required: 'Title is required.',
                maxlength:{
                    message: 'Value max length 20!',
                    length: 50
                } as ICharachterLength,
            },
            voucherCode: {
                required: 'Voucher type is required.'
            }
        } as ValidatingObjectFormat,

    }
}

export class OrgCashConfigDTO {
    id: number = 0;
    orgID: number = null;
    isNegativeBalanceAllowed: boolean = true;


    //extra properties
    companyID: number = null;
    unitBranchID: number = null;
    companyName: string = null;
    unitBranchName: string = null;
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag: any = 0;    

    constructor(defaultData?: Partial<OrgCashConfigDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function orgCashConfigValidation(): any {
    return {
        orgCashConfigValidation: {
            companyID: {
                required: 'Company is required.',
            }
        } as ValidatingObjectFormat,

    }
}


export class ChequeLeafStatusDTO {
    id: number = 0;
    value: string = null;
    code: number = null;
    isActive: boolean = true;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;
    

    constructor(defaultData?: Partial<ChequeLeafStatusDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }

}

export function chequeStatusNotifyValidation(): any {
    return {
        chequeStatusNotifyValidation: {
            value: {
                required: 'Days is required.',
                customValidator:{
                    method: maxQtyValidator()
                }
            }

        } as ValidatingObjectFormat,

    }
}

export function maxQtyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => 
    {
        const data = control.value;
        const keyCode = control["nativeElement"].getAttribute("id") || null;

        if(keyCode == "ICNDB")
        {
            let issuedChequeNotifyDays = Number(data);
            if(issuedChequeNotifyDays < 1 || issuedChequeNotifyDays > 120)
            {
                return { value: { message: "Issued cheque notify days before range is between 1 to 120."} }
            }
        }
        else if(keyCode == "RCNDB")
        {
            let receivedChequeNotifyDays = Number(data);
            if(receivedChequeNotifyDays < 1 || receivedChequeNotifyDays > 30)
            {
                return { value: { message: "Received cheque notify days before range is between 1 to 30."} }
            }
        }
        return null;
    };
  }


