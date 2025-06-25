
import { GlobalConstants } from "src/app/app-shared/models/javascriptVariables";
import { ValidatingObjectFormat } from "../..";
import { ICharachterLength, IPattern } from "src/app/shared/models/common.model";
import { ImageFile } from "src/app/shared/models/common.model";
import { FixedIDs } from '../../../shared';



export class UserProfile {
    id: number = 0;
    compBranchID: number = 0;
    userID: string = null;
    userName: string = null;
    employeePassword: string = null;
    unitID: number = null;
    departmentID: number = null;
    employeeID: number = null;
    contactNo: string = null;
    email: string = null;
    fileName: string = null;
    isActive: boolean = true;
    userTypeID: number = FixedIDs.UserType.General.code;
    adminRoleCD: number = null;
    lastUpdate: Date;
    languageCode: string = null;

    //extra properties
    confirmPassword: string = null;
    imageFile: any = new ImageFile();
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;

    constructor(defaultData?: Partial<UserProfile>) {
        defaultData = defaultData || {},
            Object.keys(defaultData).forEach((key) => {
                const value = defaultData[key];
                if (this.hasOwnProperty(key)) {
                    this[key] = value;
                }
            })
    }
}

export function UserProfileValidation(): any {
    return {
        UserProfileValidation: {
            userID: {
                required: GlobalConstants.validationMsg.userid,
                maxlength: {
                    message: "Value max length 20",
                    length: 20,
                } as ICharachterLength,
                minlength: {
                    message: "Value min length 5",
                    length: 5,
                } as ICharachterLength, 
            },
            userName : {
                required: GlobalConstants.validationMsg.username,
                maxlength: {
                    message: "Value max length 50",
                    length: 50,
                } as ICharachterLength,
                minlength: {
                    message: "Value min length 5",
                    length: 5,
                } as ICharachterLength,  
            },
            employeePassword: {
                required: GlobalConstants.validationMsg.password,
                maxlength: {
                    message: "Value max length 20",
                    length: 20,
                } as ICharachterLength,
                minlength: {
                    message: "Value min length 4",
                    length: 4,
                } as ICharachterLength,
            },
            confirmPassword : {
                required: GlobalConstants.validationMsg.confirmpassword,
                maxlength: {
                    message: "Value max length 20",
                    length: 20,
                } as ICharachterLength,
                minlength: {
                    message: "Value min length 4",
                    length: 4,
                } as ICharachterLength, 
            },
            userTypeID : {
                required: GlobalConstants.validationMsg.usertype 
            },
            contactNo: {
                maxlength: {
                  message: "Value max length 50",
                  length: 50,
                } as ICharachterLength,
                pattern: {
                  message: GlobalConstants.validationMsg.validmobileno,
                  regex: "(^(\\+88)?(01){1}[3456789]{1}(\\d){8})$"
                } as IPattern
              },
              email: {
                maxlength: {
                    message: "Value max length 50",
                    length: 50,
                } as ICharachterLength,
                minlength: {
                    message: "Value min length 5",
                    length: 5,
                } as ICharachterLength, 
                pattern: {
                  message: GlobalConstants.validationMsg.validemail,
                  regex: "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}"
                } as IPattern
              },
        } as ValidatingObjectFormat,

    }
}


