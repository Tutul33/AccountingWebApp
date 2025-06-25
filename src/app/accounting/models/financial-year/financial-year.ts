import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength } from "src/app/shared/models/common.model";

export class FinancialYearDTO {
    id: number = 0;
    name: string = null;
    fromDateID: number = null;
    toDateID: number = null;
    status: number = null;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    fromYearID: number = null;
    fromMonthID: number = null;
    toYearID: number = null;
    toMonthID: number = null;

    fromYear: number = null;
    toYear: number = null;
    fromMonth: string = "";
    toMonth: string = "";

    tag:any = 0;
    statusValue: string = null;
    

    constructor(defaultData?: Partial<FinancialYearDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function financialYearValidation(): any {
    return {
        financialYearValidation: {
            name: {
                required: 'Financial year is required.',
                maxlength:{
                  message: 'Value max length 50!',
                  length: 50
                } as ICharachterLength,
            },
            fromYearID: {
                required: 'From year is required.'
            },
            fromMonthID: {
                required: 'From month is required.'
            },
            toYearID: {
                required: 'To year is required.'
            },
            toMonthID: {
              required: 'To month is required.'
            },
            status: {
                required: 'Status is required.'
            }
        } as ValidatingObjectFormat,

    }
}
