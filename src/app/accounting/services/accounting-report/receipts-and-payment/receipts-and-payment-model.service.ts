import { Injectable } from "@angular/core";
import { GlobalMethods } from "src/app/core/models/javascriptMethods";
@Injectable()
export class ReceiptsAndPaymentsModelService {
  companyList:any[] = [];
  officeBranchList:any[] = [];
  projectList:any[] = [];
  isRefresh:boolean = true;
  constructor() {}
  prepareOrgList(res) {
    try {
      let orgList = [
        {
          label: "-- Office --",
          value: "office",
          items: [],
        },
        {
          label: "-- Branch --",
          value: "branch",
          items: [],
        },
        {
          label: "-- Unit --",
          value: "unit",
          items: [],
        },
      ];
      res.forEach((item) => {
        if (item.value == "Office") {
          //3 Office
          let objOffice = orgList.find((x) => x.value == "office");
          if (objOffice) {
            objOffice.items.push(item);
          }
        } else if (item.value == "Branch") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "branch");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
        else if (item.value == "Unit") {
          //4 Branch
          let objBranch = orgList.find((x) => x.value == "unit");
          if (objBranch) {
            objBranch.items.push(item);
          }
        }
      });
      return orgList;
    } catch (error) {
      throw error;
    }
  }
  prepareData(data){
    try {
      let list = [];
      let particularType = 1; //Opeing
      let particularList = [...new Set(data.filter(f => f.particularType == particularType).map(item => item.controlLedgerID))]; 
      particularList.forEach(controlLedgerID => {
        let controlLedger = data.find(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        list.push({
          particularType: controlLedger.particularType,
          particularTypeName: controlLedger.particularTypeName,
          ledger : controlLedger.controlLedger,
          balance: null
        });

        let ledgerList = data.filter(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        ledgerList.forEach(ledger => {
          list.push({
            particularType: ledger.particularType,
            particularTypeName: ledger.particularTypeName,
            ledger : '     ' + ledger.ledger,
            balance: GlobalMethods.convertToNumberFormat(ledger.balance, 'en-IN', 2, 2)
          });
        });
      });

      if(particularList.length > 0)
      {
        list.push({
          particularType: particularType,
          particularTypeName: null,
          ledger : 'Total',
          balance: this.prepareTotal(particularType, data)
        });
      }

      particularType = 2; //receipts
      particularList = [...new Set(data.filter(f => f.particularType == particularType).map(item => item.controlLedgerID))]; 
      particularList.forEach(controlLedgerID => {
        let controlLedger = data.find(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        list.push({
          particularType: controlLedger.particularType,
          particularTypeName: controlLedger.particularTypeName,
          ledger : controlLedger.controlLedger,
          balance: null
        });

        let ledgerList = data.filter(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        ledgerList.forEach(ledger => {
          list.push({
            particularType: ledger.particularType,
            particularTypeName: ledger.particularTypeName,
            ledger : '     ' + ledger.ledger,
            balance: GlobalMethods.convertToNumberFormat(ledger.balance, 'en-IN', 2, 2)
          });
        });
      });

      if(particularList.length > 0)
        {
          list.push({
            particularType: particularType,
            particularTypeName: null,
            ledger : 'Total',
            balance: this.prepareTotal(particularType, data)
          });
        }

      particularType = 3; //payments
      particularList = [...new Set(data.filter(f => f.particularType == particularType).map(item => item.controlLedgerID))]; 
      particularList.forEach(controlLedgerID => {
        let controlLedger = data.find(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        list.push({
          particularType: controlLedger.particularType,
          particularTypeName: controlLedger.particularTypeName,
          ledger : controlLedger.controlLedger,
          balance: null
        });

        let ledgerList = data.filter(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        ledgerList.forEach(ledger => {
          list.push({
            particularType: ledger.particularType,
            particularTypeName: ledger.particularTypeName,
            ledger : '     ' + ledger.ledger,
            balance: GlobalMethods.convertToNumberFormat(ledger.balance, 'en-IN', 2, 2)
          });
        });
      });


      if(particularList.length > 0)
        {
          list.push({
            particularType: particularType,
            particularTypeName: null,
            ledger : 'Total',
            balance: this.prepareTotal(particularType, data)
          });
        }

      particularType = 4; //closing
      particularList = [...new Set(data.filter(f => f.particularType == particularType).map(item => item.controlLedgerID))]; 
      particularList.forEach(controlLedgerID => {
        let controlLedger = data.find(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        list.push({
          particularType: controlLedger.particularType,
          particularTypeName: controlLedger.particularTypeName,
          ledger : controlLedger.controlLedger,
          balance: null
        });

        let ledgerList = data.filter(f => f.controlLedgerID == controlLedgerID && f.particularType == particularType);
        ledgerList.forEach(ledger => {
          list.push({
            particularType: ledger.particularType,
            particularTypeName: ledger.particularTypeName,
            ledger : '     ' + ledger.ledger,
            balance: GlobalMethods.convertToNumberFormat(ledger.balance, 'en-IN', 2, 2)
          });
        });
      });


      if(particularList.length > 0)
        {
          list.push({
            particularType: particularType,
            particularTypeName: null,
            ledger : 'Total',
            balance: this.prepareTotal(particularType, data)
          });
        }

      return list;
    } catch (error) {
      throw error;
    }
  }
   prepareTotal(particularType:number, data:any[]){
      try {
        let total = 0;
        total = data.filter(f => f.particularType == particularType && f.balance != null).reduce((sum, account) => sum + account.balance, 0) || 0;
        return GlobalMethods.convertToNumberFormat(total, 'en-IN', 2, 2);
      } catch (e) {
        throw e;
      }
    }
}
