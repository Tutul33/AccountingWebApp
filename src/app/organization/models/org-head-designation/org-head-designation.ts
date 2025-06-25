import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class OrgHeadDesignation {
    id:number = 0;
    orgStructureID: number = 0;
    designationID: number = null;

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;


    constructor(defaultData?: Partial<OrgHeadDesignation>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function orgHeadDesignationValidation(): any {
    return {
        orgHeadDesignationValidation: {
            designationID: {
                required: GlobalConstants.validationMsg.designation
            }
        } as ValidatingObjectFormat,
    }
}