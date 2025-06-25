import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, ImageFile } from "src/app/shared/models/common.model";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";


export class BankReconciliationDTO {
    id: number = 0;
    companyID: number = null;
    orgID: number = null;
    projectID: number = null;
    reconcilationDateFrom: Date = GlobalConstants.serverDate;
    reconcilationDateTo: Date = GlobalConstants.serverDate;
    cOAStructID: number = null;
    bankBalance: number = null;
    fileName: string = null;
    auditedDiscrepancy: number = null;
    isReconciled: boolean = false;
    imageFile: ImageFile = new ImageFile();

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    insertDateTime: Date = GlobalConstants.serverDate;
    
    tag:any = 0;
    
    constructor(defaultData?: Partial<BankReconciliationDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function bankReconciliationValidation(): any {
    return {
        bankReconciliationValidation: {
            companyID: {
                required: 'Company is required.',
            },
            orgID: {
                customValidator:{
                    method: orgCustomValidator()
                }
            },
            reconcilationDateFrom: {
                required: 'Date from is required.'
            },
            reconcilationDateTo: {
                required: 'Date to is required.'
            },
            cOAStructID: {
                required: 'Bank account is required.'
            },
            bankBalance: {
              required: 'Statement balance is required.'
            }
        } as ValidatingObjectFormat,

    }
}

export class BankReconcilVoucherTransactionDTO {
    id: number = 0;
    reconcilID: number = null;
    voucherItemID: number = null;

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    insertDateTime: Date = GlobalConstants.serverDate;
    
    constructor(defaultData?: Partial<BankReconcilVoucherTransactionDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function orgCustomValidator(): ValidatorFn {

    let isBranchModuleActive = GlobalConstants.bizConfigInfo.isBranchModuleActive;

    return (control: AbstractControl): ValidationErrors | null => 
    {
        const data = control.value;

        if(isBranchModuleActive && data == null)
        {
            return { value: { message: "Branch is required."} }
        }
        return null;
    };
}
