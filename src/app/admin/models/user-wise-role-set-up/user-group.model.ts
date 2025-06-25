import { GlobalConstants, ValidatingObjectFormat } from 'src/app/app-shared/models/javascriptVariables';
export class UserGroup {
    id: number = 0;
    GroupID: number = null;
    UserID: number = null;
    
    locationID: number = GlobalConstants.userInfo.locationID;
    insertUserID: number = GlobalConstants.userInfo.userPKID;
    editUserID: number = GlobalConstants.userInfo.userPKID;
    lastUpdate:Date=new Date();

    //Extra Fields
    isSelected:boolean=false;

    constructor(defaultData?: Partial<UserGroup>) {
        defaultData = defaultData || {},
            Object.keys(defaultData).forEach((key) => {
                const value = defaultData[key];
                if (this.hasOwnProperty(key)) {
                    this[key] = value;
                }
            })
    }
}


export function UserGroupValidation(): any {
    return {
        UserGroupValidateModel: {
        } as ValidatingObjectFormat,

    }
}

