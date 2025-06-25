export class UserInfo {
    constructor(
     public locationID: number,
     public userPKID: number,
     public empPKID: number,
     public employeeID: string,
     public userName: string,
     public companyID: number,
     public company: string,
     public password: string,
     public empOrgID: {},
     public userTypeID: number
    ){}
    
}
