import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";

export class VoucherNotificationLogDTO {
    id: number = 0;
    voucherID: number = null;
    email: string = null;
    mobile: string = null;
    subject: string = null;
    ActionDateTime: Date = GlobalConstants.serverDate;
    attachments: string = null;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;

    
    constructor(defaultData?: Partial<VoucherNotificationLogDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}
