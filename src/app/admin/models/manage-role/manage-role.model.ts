import { GlobalConstants, ValidatingObjectFormat } from 'src/app/app-shared/models/javascriptVariables';
import { ICharachterLength } from "src/app/shared/models/common.model";

export class ManageRole {
    id: number = 0;
    moduleID: number = null;
    parentIDd: number = null;
    name: string = null;
    descr: string = null;
    type: number = 0;
    grpCreatorID: string = null;
    grpOwnerID: string = null;
    orgID: string = null;
    userID: string = null;
    isActive: boolean = true;
    isDefault: boolean = false;
    lastUpdate: Date;

    // Extra Fields 
    locationID: number = GlobalConstants.userInfo.locationID;
    createdDateTime: Date = GlobalConstants.serverDate;
    insertUserID: number = GlobalConstants.userInfo.userPKID;
    editUserID: number = GlobalConstants.userInfo.userPKID;


    constructor(defaultData?: Partial<ManageRole>) {
        defaultData = defaultData || {},
            Object.keys(defaultData).forEach((key) => {
                const value = defaultData[key];
                if (this.hasOwnProperty(key)) {
                    this[key] = value;
                }
            })
    }
}


export function manageRoleValidation(): any {
    return {
        manageRoleValidation: {
            name: {
                required: GlobalConstants.validationMsg.role,
                maxlength: {
                    message: "Value max length 100",
                    length: 100,
                } as ICharachterLength,
                minlength: {
                    message: "Value min length 5",
                    length: 5,
                } as ICharachterLength,
            },
            descr: {
                required: GlobalConstants.validationMsg.role,
                maxlength: {
                    message: "Value max length 200",
                    length: 200,
                } as ICharachterLength
            },
        } as ValidatingObjectFormat,

    }
}

