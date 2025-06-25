import { GlobalConstants, ValidatingObjectFormat } from "src/app/app-shared/models/javascriptVariables";
import { ICharachterLength, IRange, IPattern } from 'src/app/shared/models/common.model';

export class OrgBasicDTO {
    id:number = 0;
    orgStructureID: number = 0;
    shortName: string = null;
    mobileNo: any = null;
    telephoneNo: any = null;
    fax: any = null;
    email: string = null;
    website: any = null;
    whatsAppNo: any = null;

    orgSocialContactsList: OrgSocialContactsDTO [] = [];

    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;

    constructor(defaultData?: Partial<OrgBasicDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export class OrgSocialContactsDTO {
    id:number = 0;
    orgStructureID: number = 0;
    socialPlatformCd: number = null;
    contactLink: string = null;


    //extra properties
    tag:any = 0;

    constructor(defaultData?: Partial<OrgSocialContactsDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export class OrgAddressDTO {
    id:number = 0;
    orgStructureID: number = 0;
    sourceOrgStructureID: number = null;
    addressID: number = 0;
    addressTypeCd: number = null;
    hasChangePermission: boolean = true;
    isActive: boolean = true;

    addressLine1: string = null;
    addressLine2: string = null;
    village: string = null;
    postOffice: string = null;
    pOBox: string = null;
    zip: string = null;
    thana: string = null;
    district: string = null;
    division: string = null;
    city: string = null;
    state: string = null;
    countryID: number = 0;
    country: string = null;
    shortAddressFormat: string = null;
    shortAddress: string = null;
    organizationName: string = null;
    employeeID: number = 0;
    addressEditPermission: boolean = true;
    billingAddressEditPermission: boolean = true;
    deliveryAddressEditPermission: boolean = true;
    setAddressDTO: any = null;
    isDeleted: boolean = false;

    orgContactDetailsList: OrgContactDetailsDTO[] = [];

     //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag: number = 0;



    constructor(defaultData?: Partial<OrgAddressDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export class OrgContactDetailsDTO {
    id:number = 0;
    orgStructureID: number = 0;
    employeeID: number = 0;
    insertDateTime: Date=new Date(); 
    orgAddressID: number = null;
    hR_EmployeeID: string = null;
    employeeName: string = null;
    designation: string = null;
    organization: string = null;
    email: string = null;
    contactNo: string = null;
    isDeleted: boolean = false;


    //extra properties
    locationID: number = GlobalConstants.userInfo.locationID;
    createdByID: number = GlobalConstants.userInfo.userPKID;
    tag:any = 0;

    constructor(defaultData?: Partial<OrgContactDetailsDTO>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        }
        });
    }
}

export function basicInfoValidation(): any {
    return {
        basicInfoValidation: {
            orgStructureID: {
            required: "OrgStructure ID is required !",
            maxlength:{
                message: 'OrgStructure Note max length 100!',
                length: 100
                } as ICharachterLength
            },
            shortName: {
            maxlength:{
                message: 'Value max length 50!',
                length: 50
                } as ICharachterLength
            },
            mobileNo: {
            maxlength:{
                message: 'Value max length 50!',
                length: 50
                } as ICharachterLength
            },
            telephoneNo: {
            maxlength:{
                message: 'Value max length 20!',
                length: 20
                } as ICharachterLength
            },
            fax: {
            maxlength:{
                message: 'Value max length 20!',
                length: 20
                } as ICharachterLength
            },
            email: {
            maxlength:{
                message: 'Value max length 100!',
                length: 100
                } as ICharachterLength,
            pattern: {
                message: "Enter Valid Email",
                regex: "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}"
                } as IPattern,
            },
            website: {
            maxlength:{
                message: 'Value max length 100!',
                length: 100
                } as ICharachterLength
            },
            whatsAppNo: {
            maxlength:{
                message: 'Value max length 100!',
                length: 100
                } as ICharachterLength
            },
      } as ValidatingObjectFormat,
    };
}

export function socialContactValidation(): any {
    return {
        socialContactValidation: {
        contactLink: {
          maxlength:{
            message: 'Value max length 150!',
            length: 150
          } as ICharachterLength
        },
      } as ValidatingObjectFormat,
    };
}


