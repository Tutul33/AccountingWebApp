
import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class ChangeIndustryTypeDTO {
    code: string = null;
    value: string = null;
    isActive: boolean = false;

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;

    constructor(defaultData?: Partial<ChangeIndustryTypeDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

  export function changeIndustryTypeValidation(): any {
    return {
        changeIndustryTypeValidation: {
            code: {
                required: 'Code is required.'
            },
        } as ValidatingObjectFormat,

    }
}

