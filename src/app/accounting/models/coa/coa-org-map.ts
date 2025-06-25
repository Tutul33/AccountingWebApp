import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class COAOrgMapDTO {
    id: number = 0;               
    orgID?: number = null;     
    projectID?: number = null;       
    cOAStructureID: number = null;     
    tag:any = 0;

    // isHide: boolean = false;             
    // isActive: boolean = true; 

    parentID?: number = null;   
    accountName: string = null;         
    isControlLegerHide:boolean;
    companyID?: number = null;
    
    constructor(defaultData?: Partial<COAOrgMapDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }

    

}

export function orgAndProjectValidation(): any {
    return {
        orgAndProjectValidationModelValidation: {
            orgID: {
                required: GlobalConstants.validationMsg.orgID
            },
            projectID: {
                required: GlobalConstants.validationMsg.projectID
            },

            companyID: {
                required: GlobalConstants.validationMsg.companyID
            },
        } as ValidatingObjectFormat,

    }
}