import { 
  ValidatingObjectFormat,
  GlobalConstants as GC,
  ICharachterLength
} from '../../index';
export class UserAuthorization{
    userID: string = null;
    password:string = null;
    storeID:number = GC.userInfo.rootOrgID;
    constructor(defaultData?: Partial<UserAuthorization>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
          const value = defaultData[key];
          if (this.hasOwnProperty(key)) {
            this[key] = value;
          }
        });
      }
}

export function userAuthorizationValidation(): any {
  return {
    userAuthorizationValidateModel: {
      userID: {
          required: GC.validationMsg.userid,
          maxlength:{
            message: 'Value max length 20!',
            length: 20
          } as ICharachterLength
      },
      password: {
        required: GC.validationMsg.password,
        maxlength:{
          message: 'Value max length 20!',
          length: 20
        } as ICharachterLength
      },
    } as ValidatingObjectFormat
  };
}


  export class Email{
      fromAddress: string = '';
      to: any = [];
      cC: any = [];
      bCC: any = [];
      body: string = null;
      subject: string = null;
      userToken: string = '';
      userID: string = null;
      displayName: string = null;
      emailTemplate: string = null;
      locale: string = null;
      files: any = [];
      refObject:any = null;
      isCanceled:boolean = false;
      isError:boolean = false;
      error:any = null;

      password: string = '';
      enableSsl:boolean = false;
      port: number = 0;
      host: string = '';
      
      constructor(defaultData?: Partial<Email>) {
          defaultData = defaultData || {};
          Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
              this[key] = value;
            }
          });
        }
  }
