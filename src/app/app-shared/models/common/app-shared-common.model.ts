export class DutyValue {
    amount:number = 0;
    vatValue: number = 0;
    vatPercent: number = 0;
    sDValue: number = 0;
    sDPercent: number = 0;
    constructor(defaultData?: Partial<DutyValue>) {
      defaultData = defaultData || {};
      Object.keys(defaultData).forEach((key) => {
        const value = defaultData[key];
        if (this.hasOwnProperty(key)) {
          this[key] = value;
        }
      });
    }
  }
  