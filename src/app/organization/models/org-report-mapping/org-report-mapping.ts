
import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class OrgReportMapping {
    id:number = 0;
    orgStructureID: number = 0;
    reportToOrgStructureID: number = null;

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;


    constructor(defaultData?: Partial<OrgReportMapping>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function orgReportMappingValidation(): any {
    return {
        orgReportMappingValidation: {
            reportToOrgStructureID: {
                required: GlobalConstants.validationMsg.designation
            }
        } as ValidatingObjectFormat,
    }
}
